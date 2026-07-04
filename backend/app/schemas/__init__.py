from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models import GameStatus, UploadStatus


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class EventCreate(BaseModel):
    name: str
    location: str | None = None
    section: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class EventResponse(ORMModel):
    id: UUID
    name: str
    location: str | None
    section: str | None
    start_date: date | None
    end_date: date | None
    created_at: datetime


class PlayerCreate(BaseModel):
    name: str
    uscf_id: str | None = None
    fide_id: str | None = None


class PlayerResponse(ORMModel):
    id: UUID
    name: str
    uscf_id: str | None
    fide_id: str | None
    created_at: datetime


class GameCreate(BaseModel):
    event_id: UUID | None = None
    white_player_id: UUID | None = None
    black_player_id: UUID | None = None
    round: int | None = None
    board: int | None = None
    result: str | None = "*"


class GameResponse(ORMModel):
    id: UUID
    event_id: UUID | None
    white_player_id: UUID | None
    black_player_id: UUID | None
    round: int | None
    board: int | None
    result: str | None
    pgn: str | None
    status: GameStatus
    created_at: datetime
    updated_at: datetime


class UploadResponse(ORMModel):
    id: UUID
    game_id: UUID | None
    mime_type: str
    original_filename: str | None
    status: UploadStatus
    ocr_provider: str | None
    error_message: str | None
    created_at: datetime
    ocr_completed_at: datetime | None


class ProcessUploadResponse(UploadResponse):
    raw_text: str | None = None
    lines: list[str] = Field(default_factory=list)


class FieldWithConfidence(BaseModel):
    value: str | None
    confidence: float | None = None


class MoveWithConfidence(BaseModel):
    san: str | None
    confidence: float | None = None
    valid: bool | None = None
    alternatives: list[str] = Field(default_factory=list)


class MovePairReview(BaseModel):
    move_number: int
    white: MoveWithConfidence
    black: MoveWithConfidence


class MoveErrorResponse(BaseModel):
    ply: int
    san: str
    reason: str
    alternatives: list[str] = Field(default_factory=list)


class ValidationResponse(BaseModel):
    legal: bool
    legal_through_ply: int
    errors: list[MoveErrorResponse]


class GameReviewResponse(BaseModel):
    game_id: UUID
    status: GameStatus
    scoresheet_url: str | None
    header: dict[str, FieldWithConfidence]
    moves: list[MovePairReview]
    validation: ValidationResponse


class MoveCorrection(BaseModel):
    ply: int = Field(ge=1)
    san: str


class ReviewUpdateRequest(BaseModel):
    moves: list[MoveCorrection]
    result: str | None = None
    white_name: str | None = None
    black_name: str | None = None
    event_name: str | None = None
    board: int | None = None
    section: str | None = None


class MessageResponse(BaseModel):
    message: str
