"""Tests for ticket 1.4 — move parser.

Run just these tests while you work on regex:

    cd backend && pytest tests/test_move_parser.py -v

Green tests = parser handles that case. Red tests = next learning target.
"""

import pytest
from app.ocr.base import OcrMoveCandidate
from app.parsing.move_parser import (
    normalize_ocr_san,
    parse_move_line,
    parse_move_lines,
    parse_move_text,
)

# Step 1: normalization (string fixes, no regex)

@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("0-0", "O-O"),
        ("0-0-0", "O-O-O"),
        ("O-O", "O-O"),
        ("e4", "e4"),
        ("Nf3", "Nf3"),
    ],
)
def test_normalize_ocr_san(raw: str, expected: str):
    assert normalize_ocr_san(raw) == expected

# Step 2: one line at a time (MOVE_NUMBER_WHITE / MOVE_NUMBER_BLACK_ONLY)

def test_parse_single_line_white_and_black():
    result = parse_move_line("1. e4 c5")
    assert result == OcrMoveCandidate(1, "e4", "c5", raw_text="1. e4 c5")

def test_parse_single_line_white_only():
    result = parse_move_line("1. e4")
    assert result == OcrMoveCandidate(1, "e4", None, raw_text="1. e4")

def test_parse_black_only_line():
    result = parse_move_line("1... c5")
    assert result == OcrMoveCandidate(1, None, "c5", raw_text="1... c5")

def test_parse_castling_after_normalize():
    # normalize runs inside _split_move_tokens — line uses OCR-style zeros
    result = parse_move_line("2. 0-0 Nf6")
    assert result == OcrMoveCandidate(2, "O-O", "Nf6", raw_text="2. 0-0 Nf6")

def test_parse_capture_and_check():
    result = parse_move_line("4. Nxd4 Nf6+")
    assert result == OcrMoveCandidate(4, "Nxd4", "Nf6+", raw_text="4. Nxd4 Nf6+")

def test_skip_non_move_line():
    assert parse_move_line("White: Smith, John") is None
    assert parse_move_line("") is None

# Step 3: full mock Sicilian (same text as MockOcrProvider)

MOCK_LINES = [
    "1. e4 c5",
    "2. Nf3 d6",
    "3. d4 cxd4",
    "4. Nxd4 Nf6",
    "5. Nc3 a6",
]

MOCK_EXPECTED = [
    OcrMoveCandidate(1, "e4", "c5", raw_text="1. e4 c5"),
    OcrMoveCandidate(2, "Nf3", "d6", raw_text="2. Nf3 d6"),
    OcrMoveCandidate(3, "d4", "cxd4", raw_text="3. d4 cxd4"),
    OcrMoveCandidate(4, "Nxd4", "Nf6", raw_text="4. Nxd4 Nf6"),
    OcrMoveCandidate(5, "Nc3", "a6", raw_text="5. Nc3 a6"),
]

def test_parse_mock_sicilian_lines():
    assert parse_move_lines(MOCK_LINES) == MOCK_EXPECTED

def test_parse_mock_sicilian_text():
    raw_text = "\n".join(MOCK_LINES)
    assert parse_move_text(raw_text) == MOCK_EXPECTED

# Step 4: tougher OCR — mark xfail until regex is extended

def test_promotion_notation():
    result = parse_move_line("40. e8=Q")
    assert result == OcrMoveCandidate(40, "e8=Q", None, raw_text="40. e8=Q")
