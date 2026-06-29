"""
API tests for ticket 1.8 — PGN export endpoint.
Run:
    cd backend && pytest tests/test_pgn_export.py -v
"""

import io
import chess.pgn
import pytest

async def _verified_game_id(client, sample_png: bytes) -> str:
    #Upload, process, and verify mock OCR game; return game_id.
    upload_response = await client.post(
        "/api/v1/uploads",
        files={"file": ("scoresheet.png", io.BytesIO(sample_png), "image/png")},
    )
    assert upload_response.status_code == 200
    upload_id = upload_response.json()["id"]

    process_response = await client.post(f"/api/v1/uploads/{upload_id}/process")
    assert process_response.status_code == 200
    game_id = process_response.json()["game_id"]
    assert game_id is not None

    review = (await client.get(f"/api/v1/games/{game_id}/review")).json()
    moves = []
    ply = 1
    for pair in review["moves"]:
        if pair["white"]["san"]:
            moves.append({"ply": ply, "san": pair["white"]["san"]})
            ply += 1
        if pair["black"]["san"]:
            moves.append({"ply": ply, "san": pair["black"]["san"]})
            ply += 1

    await client.patch(
        f"/api/v1/games/{game_id}/moves",
        json={"moves": moves, "result": "1-0"},
    )
    verify_response = await client.post(f"/api/v1/games/{game_id}/verify")
    assert verify_response.status_code == 200
    return game_id


@pytest.mark.asyncio
async def test_export_verified_game_returns_valid_pgn(client, sample_png):
    game_id = await _verified_game_id(client, sample_png)

    response = await client.get(f"/api/v1/games/{game_id}/pgn")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/plain")

    pgn_text = response.text
    assert '[White "Smith, John"]' in pgn_text
    assert '[Black "Lee, Karen"]' in pgn_text
    assert '[Result "1-0"]' in pgn_text
    assert '[Event "Spring Open U1600"]' in pgn_text
    assert "1. e4" in pgn_text

    parsed = chess.pgn.read_game(io.StringIO(pgn_text))
    assert parsed is not None
    assert parsed.headers["White"] == "Smith, John"
    assert parsed.headers["Black"] == "Lee, Karen"
    assert parsed.headers["Result"] == "1-0"


@pytest.mark.asyncio
async def test_export_sets_download_headers(client, sample_png):
    game_id = await _verified_game_id(client, sample_png)

    response = await client.get(f"/api/v1/games/{game_id}/pgn")
    assert response.status_code == 200

    disposition = response.headers.get("content-disposition", "")
    assert "attachment" in disposition
    assert f"pigeon-{game_id}.pgn" in disposition


@pytest.mark.asyncio
async def test_export_unverified_game_returns_404(client, sample_png):
    upload_response = await client.post(
        "/api/v1/uploads",
        files={"file": ("scoresheet.png", io.BytesIO(sample_png), "image/png")},
    )
    upload_id = upload_response.json()["id"]
    process_response = await client.post(f"/api/v1/uploads/{upload_id}/process")
    game_id = process_response.json()["game_id"]

    response = await client.get(f"/api/v1/games/{game_id}/pgn")
    assert response.status_code == 404
    assert "verify" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_export_missing_game_returns_404(client):
    missing_id = "00000000-0000-0000-0000-000000000001"
    response = await client.get(f"/api/v1/games/{missing_id}/pgn")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
