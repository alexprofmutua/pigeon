"""Parse OCR text into structured chess moves.

This module turns raw scoresheet lines like ``1. e4 c5`` into
``OcrMoveCandidate`` objects that the upload pipeline already understands.

Regex learning path (work through in order)
-------------------------------------------
1. ``MOVE_NUMBER_WHITE`` — matches ``1. e4`` (move number + white move)
2. ``MOVE_NUMBER_BLACK_ONLY`` — matches ``1... c5`` (black move without white on same line)
3. ``normalize_ocr_san`` — string fixes before/after regex (``0-0`` → ``O-O``)
4. ``SAN_TOKEN`` (optional, later) — validate each token looks like real SAN

Start with steps 1–3. Whitespace splitting is enough for most scoresheets.
"""

from __future__ import annotations
import re
from app.ocr.base import OcrMoveCandidate

# ---------------------------------------------------------------------------
# Regex patterns — read the comments, then run the tests in test_move_parser.py
# ---------------------------------------------------------------------------

# Matches: "1. e4" or "12. Nf3" at the start of a line.
#   \d+     one or more digits (the move number)
#   \.      a literal dot
#   \s*     optional spaces
#   (.+)    capture everything after (the move text)
MOVE_NUMBER_WHITE = re.compile(r"^(\d+)\.\s*(.+)$")

# Matches: "1... c5" — black's move when white's move was on a previous line.
#   \d+     move number
#   \.\.\.  three dots (black-to-move marker)
#   \s*     optional spaces
#   (.+)    the black move (and maybe more tokens)
MOVE_NUMBER_BLACK_ONLY = re.compile(r"^(\d+)\.\.\.\s*(.+)$")

# Optional — use this when you want to *validate* a token looks like SAN.
# Uncomment and use in _split_move_tokens once basic parsing works.
#
# Pieces:     [NBRQK]?
# File/rank:  [a-h]?[1-8]?
# Capture:    x?
# Destination:[a-h][1-8]
# Promotion:  (=[NBRQK])?
# Check/mate: [+#]?
# Castling:   O-O-O | O-O
#
# SAN_TOKEN = re.compile(
#     r"^(?:"
#     r"[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQK])?[+#]?"
#     r"|O-O-O|O-O"
#     r")$",
#     re.IGNORECASE,
# )


def normalize_ocr_san(token: str) -> str:
    """Fix common OCR mistakes in a single move token.

    This uses simple string rules (not regex) — good first step before
    you tackle pattern matching.
    """
    cleaned = token.strip()

    # Castling: OCR often reads letter O as digit 0, or uses hyphens.
    cleaned = cleaned.replace("0-0-0", "O-O-O").replace("0-0", "O-O")
    cleaned = cleaned.replace("0-O-O", "O-O-O").replace("O-0-0", "O-O-O")

    # Some sheets use lowercase o; python-chess expects uppercase O for castling.
    if cleaned.lower() in {"o-o", "o-o-o"}:
        cleaned = cleaned.upper()

    return cleaned


def _split_move_tokens(move_text: str) -> list[str]:
    """Split the move portion of a line into individual SAN tokens.

    Default strategy: split on whitespace (``"e4 c5"`` → ``["e4", "c5"]``).

    When you are ready for stricter parsing, filter tokens with SAN_TOKEN
    or reject lines that contain garbage words.
    """
    return [normalize_ocr_san(part) for part in move_text.split() if part.strip()]


def parse_move_line(line: str) -> OcrMoveCandidate | None:
    """Parse one scoresheet line into white/black moves.

    Returns None if the line does not look like a move line (headers, blank, etc.).
    """
    stripped = line.strip()
    if not stripped:
        return None

    move_number: int | None = None
    white: str | None = None
    black: str | None = None

    black_only = MOVE_NUMBER_BLACK_ONLY.match(stripped)
    if black_only:
        move_number = int(black_only.group(1))
        tokens = _split_move_tokens(black_only.group(2))
        black = tokens[0] if tokens else None
        return OcrMoveCandidate(
            move_number=move_number,
            white=white,
            black=black,
            raw_text=stripped,
        )

    white_line = MOVE_NUMBER_WHITE.match(stripped)
    if white_line:
        move_number = int(white_line.group(1))
        tokens = _split_move_tokens(white_line.group(2))
        white = tokens[0] if len(tokens) > 0 else None
        black = tokens[1] if len(tokens) > 1 else None
        return OcrMoveCandidate(
            move_number=move_number,
            white=white,
            black=black,
            raw_text=stripped,
        )

    # Not a move line — skip headers like "White: Alice" or random OCR noise.
    return None


def parse_move_lines(lines: list[str]) -> list[OcrMoveCandidate]:
    """Parse many lines (typical Tesseract output)."""
    moves: list[OcrMoveCandidate] = []
    for line in lines:
        candidate = parse_move_line(line)
        if candidate is not None:
            moves.append(candidate)
    return moves


def parse_move_text(text: str) -> list[OcrMoveCandidate]:
    """Parse a full OCR blob (newline-separated move lines)."""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return parse_move_lines(lines)
