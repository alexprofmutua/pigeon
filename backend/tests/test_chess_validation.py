"""
Tests for ticket 1.5 — chess validation (python-chess).
Run:
    cd backend && pytest tests/test_chess_validation.py -v
"""

import chess
from app.pgn.validator import validate_move_sequence

# Same move list as MockOcrProvider / mock Sicilian (10 plies, all legal)
LEGAL_SICILIAN = [
    "e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6",
]

def test_empty_move_list_is_legal():
    report = validate_move_sequence([])

    assert report.legal is True
    assert report.legal_through_ply == 0
    assert report.errors == []
    assert report.final_fen == chess.STARTING_FEN


def test_legal_sequence_has_no_errors():
    report = validate_move_sequence(LEGAL_SICILIAN)

    assert report.legal is True
    assert report.legal_through_ply == len(LEGAL_SICILIAN)
    assert report.errors == []
    assert report.final_fen is not None


def test_first_illegal_move_returns_ply_index():
    # Legal opening, then an impossible king move on ply 3 (white's 2nd move)
    moves = ["e4", "c5", "Ke9"]

    report = validate_move_sequence(moves)

    assert report.legal is False
    assert report.legal_through_ply == 2  # e4 and c5 were legal
    assert len(report.errors) == 1
    assert report.errors[0].ply == 3
    assert report.errors[0].san == "Ke9"
    assert report.errors[0].reason  # non-empty message from python-chess


def test_reports_each_illegal_move_at_same_position():
    # After Ke9 fails, the board stays put — Qh9 is also checked at that
    # position and reported separately (with alternatives), not silently skipped.
    moves = ["e4", "c5", "Ke9", "Qh9"]

    report = validate_move_sequence(moves)

    assert report.legal is False
    assert report.legal_through_ply == 2
    assert len(report.errors) == 2
    assert report.errors[0].ply == 3
    assert report.errors[0].san == "Ke9"
    assert report.errors[1].ply == 4
    assert report.errors[1].san == "Qh9"
    assert report.errors[0].alternatives  # hint moves for correction UI


def test_illegal_first_move():
    report = validate_move_sequence(["Ke9"])

    assert report.legal is False
    assert report.legal_through_ply == 0
    assert report.errors[0].ply == 1
    assert report.errors[0].san == "Ke9"