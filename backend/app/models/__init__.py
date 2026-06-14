import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.database import Base


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


def _json_type():
    return JSON().with_variant(JSONB(), "postgresql")


class GameStatus(str, enum.Enum):
    PENDING_OCR = "pending_ocr"
    NEEDS_REVIEW = "needs_review"
    VERIFIED = "verified"
    REJECTED = "rejected"


class UploadStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class MoveSource(str, enum.Enum):
    OCR = "ocr"
    MANUAL = "manual"


class Event(Base):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str | None] = mapped_column(String(255))
    section: Mapped[str | None] = mapped_column(String(100))
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    games: Mapped[list["Game"]] = relationship(back_populates="event")


class Player(Base):
    __tablename__ = "players"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    uscf_id: Mapped[str | None] = mapped_column(String(20))
    fide_id: Mapped[str | None] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    white_games: Mapped[list["Game"]] = relationship(
        back_populates="white_player", foreign_keys="Game.white_player_id"
    )
    black_games: Mapped[list["Game"]] = relationship(
        back_populates="black_player", foreign_keys="Game.black_player_id"
    )


class Game(Base):
    __tablename__ = "games"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    event_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id"), nullable=True
    )
    white_player_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("players.id"), nullable=True
    )
    black_player_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("players.id"), nullable=True
    )
    round: Mapped[int | None] = mapped_column(Integer)
    board: Mapped[int | None] = mapped_column(Integer)
    result: Mapped[str | None] = mapped_column(String(10))
    pgn: Mapped[str | None] = mapped_column(Text)
    status: Mapped[GameStatus] = mapped_column(
        Enum(GameStatus, name="game_status"), default=GameStatus.PENDING_OCR, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    event: Mapped["Event | None"] = relationship(back_populates="games")
    white_player: Mapped["Player | None"] = relationship(
        back_populates="white_games", foreign_keys=[white_player_id]
    )
    black_player: Mapped["Player | None"] = relationship(
        back_populates="black_games", foreign_keys=[black_player_id]
    )
    moves: Mapped[list["GameMove"]] = relationship(
        back_populates="game", order_by="GameMove.ply", cascade="all, delete-orphan"
    )
    uploads: Mapped[list["ScoresheetUpload"]] = relationship(back_populates="game")


class GameMove(Base):
    __tablename__ = "game_moves"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    game_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("games.id", ondelete="CASCADE"), nullable=False
    )
    ply: Mapped[int] = mapped_column(Integer, nullable=False)
    san: Mapped[str] = mapped_column(String(20), nullable=False)
    confidence: Mapped[float | None] = mapped_column(Float)
    source: Mapped[MoveSource] = mapped_column(
        Enum(MoveSource, name="move_source"), default=MoveSource.OCR, nullable=False
    )

    game: Mapped["Game"] = relationship(back_populates="moves")


class ScoresheetUpload(Base):
    __tablename__ = "scoresheet_uploads"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    game_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("games.id"), nullable=True
    )
    storage_path: Mapped[str] = mapped_column(String(512), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    original_filename: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[UploadStatus] = mapped_column(
        Enum(UploadStatus, name="upload_status"), default=UploadStatus.PENDING, nullable=False
    )
    ocr_provider: Mapped[str | None] = mapped_column(String(50))
    ocr_raw_json: Mapped[dict | None] = mapped_column(_json_type())
    error_message: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ocr_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    game: Mapped["Game | None"] = relationship(back_populates="uploads")
