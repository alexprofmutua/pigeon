import json
import uuid
from datetime import UTC, datetime
from pathlib import Path

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.models import (
    Event,
    Game,
    GameMove,
    GameStatus,
    MoveSource,
    Player,
    ScoresheetUpload,
    UploadStatus,
)
from app.ocr import get_ocr_provider
from app.pgn.validator import build_pgn, validate_move_sequence
from app.schemas import (
    FieldWithConfidence,
    GameReviewResponse,
    MoveCorrection,
    MoveErrorResponse,
    MovePairReview,
    MoveWithConfidence,
    ReviewUpdateRequest,
    ValidationResponse,
)



class UploadService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.storage_dir = Path(settings.storage_dir)

    async def save_upload(
        self,
        *,
        file_bytes: bytes,
        mime_type: str,
        original_filename: str | None,
        game_id: uuid.UUID | None = None,
    ) -> ScoresheetUpload:
        self.storage_dir.mkdir(parents=True, exist_ok=True)

        upload_id = uuid.uuid4()
        ext = _extension_for_mime(mime_type)
        storage_path = self.storage_dir / f"{upload_id}{ext}"
        storage_path.write_bytes(file_bytes)

        upload = ScoresheetUpload(
            id=upload_id,
            game_id=game_id,
            storage_path=str(storage_path),
            mime_type=mime_type,
            original_filename=original_filename,
            status=UploadStatus.PENDING,
        )
        self.db.add(upload)
        await self.db.commit()
        await self.db.refresh(upload)
        return upload

    async def get_upload(self, upload_id: uuid.UUID) -> ScoresheetUpload | None:
        result = await self.db.execute(
            select(ScoresheetUpload).where(ScoresheetUpload.id == upload_id)
        )
        return result.scalar_one_or_none()

    async def process_upload(self, upload_id: uuid.UUID) -> ScoresheetUpload:
        upload = await self.get_upload(upload_id)
        if upload is None:
            raise ValueError(f"Upload {upload_id} not found")

        upload.status = UploadStatus.PROCESSING
        await self.db.commit()

        try:
            provider = get_ocr_provider()
            image_bytes = Path(upload.storage_path).read_bytes()
            ocr_result = await provider.extract(image_bytes, mime_type=upload.mime_type)

            upload.ocr_provider = ocr_result.provider
            upload.ocr_raw_json = _ocr_result_to_dict(ocr_result)
            upload.status = UploadStatus.COMPLETED
            upload.ocr_completed_at = datetime.now(UTC)

            if ocr_result.moves:
                game = await self._get_or_create_game(upload, ocr_result)
                upload.game_id = game.id
                await self._apply_ocr_to_game(game, ocr_result)

            await self.db.commit()
            await self.db.refresh(upload)
            return upload
        except Exception as exc:
            upload.status = UploadStatus.FAILED
            upload.error_message = str(exc)
            await self.db.commit()
            await self.db.refresh(upload)
            raise

    async def _get_or_create_game(self, upload: ScoresheetUpload, ocr_result) -> Game:
        if upload.game_id:
            result = await self.db.execute(select(Game).where(Game.id == upload.game_id))
            game = result.scalar_one()
            return game

        game = Game(status=GameStatus.NEEDS_REVIEW, result=ocr_result.header_fields.get("result", "*"))
        self.db.add(game)
        await self.db.flush()
        return game

    async def _apply_ocr_to_game(self, game: Game, ocr_result) -> None:
        headers = ocr_result.header_fields

        if headers.get("event"):
            event = Event(name=headers["event"], location=headers.get("site"))
            self.db.add(event)
            await self.db.flush()
            game.event_id = event.id

        if headers.get("white"):
            white = Player(name=headers["white"])
            self.db.add(white)
            await self.db.flush()
            game.white_player_id = white.id

        if headers.get("black"):
            black = Player(name=headers["black"])
            self.db.add(black)
            await self.db.flush()
            game.black_player_id = black.id

        if headers.get("result"):
            game.result = headers["result"]

        await self.db.execute(delete(GameMove).where(GameMove.game_id == game.id))
        ply = 1
        for candidate in ocr_result.moves:
            if candidate.white:
                self.db.add(
                    GameMove(
                        game_id=game.id,
                        ply=ply,
                        san=candidate.white,
                        confidence=candidate.white_confidence,
                        source=MoveSource.OCR,
                    )
                )
                ply += 1
            if candidate.black:
                self.db.add(
                    GameMove(
                        game_id=game.id,
                        ply=ply,
                        san=candidate.black,
                        confidence=candidate.black_confidence,
                        source=MoveSource.OCR,
                    )
                )
                ply += 1

        game.status = GameStatus.NEEDS_REVIEW


class ReviewService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_game_for_review(self, game_id: uuid.UUID) -> GameReviewResponse:
        game = await self._load_game(game_id)
        if game is None:
            raise ValueError(f"Game {game_id} not found")

        moves_sans = [m.san for m in game.moves]
        validation = validate_move_sequence(moves_sans)

        header = {
            "white": FieldWithConfidence(
                value=game.white_player.name if game.white_player else None,
                confidence=_avg_confidence(game.moves, color="white"),
            ),
            "black": FieldWithConfidence(
                value=game.black_player.name if game.black_player else None,
                confidence=_avg_confidence(game.moves, color="black"),
            ),
            "event": FieldWithConfidence(
                value=game.event.name if game.event else None,
                confidence=None,
            ),
            "result": FieldWithConfidence(value=game.result, confidence=None),
        }

        move_pairs = _moves_to_pairs(game.moves, validation)
        scoresheet_url = None
        if game.uploads:
            scoresheet_url = f"/api/v1/uploads/{game.uploads[0].id}/image"

        return GameReviewResponse(
            game_id=game.id,
            status=game.status,
            scoresheet_url=scoresheet_url,
            header=header,
            moves=move_pairs,
            validation=ValidationResponse(
                legal=validation.legal,
                legal_through_ply=validation.legal_through_ply,
                errors=[
                    MoveErrorResponse(ply=e.ply, san=e.san, reason=e.reason)
                    for e in validation.errors
                ],
            ),
        )

    async def update_moves(self, game_id: uuid.UUID, payload: ReviewUpdateRequest) -> GameReviewResponse:
        game = await self._load_game(game_id)
        if game is None:
            raise ValueError(f"Game {game_id} not found")

        await self.db.execute(delete(GameMove).where(GameMove.game_id == game.id))
        for correction in sorted(payload.moves, key=lambda m: m.ply):
            self.db.add(
                GameMove(
                    game_id=game.id,
                    ply=correction.ply,
                    san=correction.san,
                    confidence=1.0,
                    source=MoveSource.MANUAL,
                )
            )

        if payload.result is not None:
            game.result = payload.result

        if payload.white_name and game.white_player:
            game.white_player.name = payload.white_name
        if payload.black_name and game.black_player:
            game.black_player.name = payload.black_name
        if payload.event_name and game.event:
            game.event.name = payload.event_name

        game.status = GameStatus.NEEDS_REVIEW
        await self.db.commit()
        return await self.get_game_for_review(game_id)

    async def verify_game(self, game_id: uuid.UUID) -> GameReviewResponse:
        game = await self._load_game(game_id)
        if game is None:
            raise ValueError(f"Game {game_id} not found")

        moves_sans = [m.san for m in game.moves]
        validation = validate_move_sequence(moves_sans)
        if not validation.legal:
            raise ValueError("Cannot verify game with illegal move sequence")

        white_name = game.white_player.name if game.white_player else "White"
        black_name = game.black_player.name if game.black_player else "Black"
        event_name = game.event.name if game.event else None
        site = game.event.location if game.event else None

        game.pgn = build_pgn(
            white=white_name,
            black=black_name,
            moves=moves_sans,
            result=game.result or "*",
            event=event_name,
            site=site,
            round_num=game.round,
        )
        game.status = GameStatus.VERIFIED
        await self.db.commit()
        return await self.get_game_for_review(game_id)

    async def _load_game(self, game_id: uuid.UUID) -> Game | None:
        result = await self.db.execute(
            select(Game)
            .where(Game.id == game_id)
            .options(
                selectinload(Game.moves),
                selectinload(Game.event),
                selectinload(Game.white_player),
                selectinload(Game.black_player),
                selectinload(Game.uploads),
            )
        )
        return result.scalar_one_or_none()


def build_process_upload_response(upload: ScoresheetUpload):
    from app.schemas import ProcessUploadResponse, UploadResponse

    ocr_data = upload.ocr_raw_json or {}
    base = UploadResponse.model_validate(upload)
    return ProcessUploadResponse(
        **base.model_dump(),
        raw_text=ocr_data.get("raw_text"),
        lines=ocr_data.get("lines", []),
    )


def _extension_for_mime(mime_type: str) -> str:
    return {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }.get(mime_type, ".bin")


def _ocr_result_to_dict(ocr_result) -> dict:
    return {
        "provider": ocr_result.provider,
        "raw_text": ocr_result.raw_text,
        "lines": ocr_result.lines,
        "header_fields": ocr_result.header_fields,
        "moves": [
            {
                "move_number": m.move_number,
                "white": m.white,
                "black": m.black,
                "white_confidence": m.white_confidence,
                "black_confidence": m.black_confidence,
                "raw_text": m.raw_text,
            }
            for m in ocr_result.moves
        ],
        "raw_blocks": ocr_result.raw_blocks,
        "warnings": ocr_result.warnings,
    }


def _avg_confidence(moves: list[GameMove], *, color: str) -> float | None:
    if not moves:
        return None
    if color == "white":
        confidences = [m.confidence for i, m in enumerate(moves) if i % 2 == 0 and m.confidence]
    else:
        confidences = [m.confidence for i, m in enumerate(moves) if i % 2 == 1 and m.confidence]
    if not confidences:
        return None
    return sum(confidences) / len(confidences)


def _moves_to_pairs(moves: list[GameMove], validation) -> list[MovePairReview]:
    import chess

    board = chess.Board()
    pairs: list[MovePairReview] = []
    move_number = 1
    i = 0

    while i < len(moves):
        white_move = moves[i]
        white_valid = _is_valid_at_ply(board, white_move.san, white_move.ply, validation)
        if white_valid:
            board.push_san(white_move.san)

        black_move = None
        black_valid = None
        if i + 1 < len(moves):
            black_move = moves[i + 1]
            black_valid = _is_valid_at_ply(board, black_move.san, black_move.ply, validation)
            if black_valid:
                board.push_san(black_move.san)

        pairs.append(
            MovePairReview(
                move_number=move_number,
                white=MoveWithConfidence(
                    san=white_move.san,
                    confidence=white_move.confidence,
                    valid=white_valid,
                ),
                black=MoveWithConfidence(
                    san=black_move.san if black_move else None,
                    confidence=black_move.confidence if black_move else None,
                    valid=black_valid,
                ),
            )
        )
        move_number += 1
        i += 2 if black_move else 1

    return pairs


def _is_valid_at_ply(board, san: str, ply: int, validation) -> bool:
    if ply > validation.legal_through_ply:
        return False
    try:
        board.parse_san(san)
        return True
    except ValueError:
        return False
