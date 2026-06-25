from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum


class ConfidenceLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class OcrMoveCandidate:
    move_number: int | None
    white: str | None
    black: str | None
    white_confidence: float = 0.0
    black_confidence: float = 0.0
    raw_text: str = ""


@dataclass
class OcrResult:
    provider: str
    raw_text: str = ""
    lines: list[str] = field(default_factory=list)
    moves: list[OcrMoveCandidate] = field(default_factory=list)
    header_fields: dict[str, str] = field(default_factory=dict)
    raw_blocks: list[dict] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


class OcrProvider(ABC):
    name: str

    @abstractmethod
    async def extract(self, image_bytes: bytes, *, mime_type: str) -> OcrResult:
        """Extract chess notation and header fields from a scoresheet image."""

    def supports(self, mime_type: str) -> bool:
        return mime_type in {"image/jpeg", "image/png"}
