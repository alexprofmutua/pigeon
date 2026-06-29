"""
API tests for ticket 1.5 — chess validation on the review endpoints.
Run:
    cd backend && pytest tests/test_chess_validation_api.py -v
"""

import io
import pytest

async def _game_id_from_mock_upload(client, sample_png: bytes) -> str:
    #Upload a PNG and process with mock OCR; return the created game id.
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
    return game_id


@pytest.mark.asyncio
async def test_review_reports_first_illegal_move(client, sample_png):
    #GET /review exposes the first illegal move ply after a bad correction.
    game_id = await _game_id_from_mock_upload(client, sample_png)

    bad_moves = [
        {"ply": 1, "san": "e4"},
        {"ply": 2, "san": "c5"},
        {"ply": 3, "san": "Ke9"},  # impossible king move — illegal on ply 3
    ]
    patch_response = await client.patch(
        f"/api/v1/games/{game_id}/moves",
        json={"moves": bad_moves},
    )
    assert patch_response.status_code == 200

    review_response = await client.get(f"/api/v1/games/{game_id}/review")
    assert review_response.status_code == 200

    validation = review_response.json()["validation"]
    assert validation["legal"] is False
    assert validation["legal_through_ply"] == 2
    assert len(validation["errors"]) == 1
    assert validation["errors"][0]["ply"] == 3
    assert validation["errors"][0]["san"] == "Ke9"
    assert validation["errors"][0]["reason"]


@pytest.mark.asyncio
async def test_patch_response_includes_validation(client, sample_png):
    #PATCH /moves returns the same validation block as GET /review.
    game_id = await _game_id_from_mock_upload(client, sample_png)

    bad_moves = [
        {"ply": 1, "san": "e4"},
        {"ply": 2, "san": "c5"},
        {"ply": 3, "san": "Ke9"},
    ]
    patch_response = await client.patch(
        f"/api/v1/games/{game_id}/moves",
        json={"moves": bad_moves},
    )
    assert patch_response.status_code == 200

    validation = patch_response.json()["validation"]
    assert validation["legal"] is False
    assert validation["errors"][0]["ply"] == 3


@pytest.mark.asyncio
async def test_review_flags_invalid_move_in_pairs(client, sample_png):
    #Move pairs include valid=false on the first illegal move for the UI.
    game_id = await _game_id_from_mock_upload(client, sample_png)

    bad_moves = [
        {"ply": 1, "san": "e4"},
        {"ply": 2, "san": "c5"},
        {"ply": 3, "san": "Ke9"},
    ]
    await client.patch(f"/api/v1/games/{game_id}/moves", json={"moves": bad_moves})

    review = (await client.get(f"/api/v1/games/{game_id}/review")).json()
    pairs = review["moves"]

    assert pairs[0]["white"]["valid"] is True   # 1. e4
    assert pairs[0]["black"]["valid"] is True   # 1... c5
    assert pairs[1]["white"]["valid"] is False  # 2. Ke9 — illegal


@pytest.mark.asyncio
async def test_verify_rejects_illegal_sequence(client, sample_png):
    #POST /verify returns 400 when the game still has illegal moves.
    game_id = await _game_id_from_mock_upload(client, sample_png)

    bad_moves = [
        {"ply": 1, "san": "e4"},
        {"ply": 2, "san": "c5"},
        {"ply": 3, "san": "Ke9"},
    ]
    await client.patch(f"/api/v1/games/{game_id}/moves", json={"moves": bad_moves})

    verify_response = await client.post(f"/api/v1/games/{game_id}/verify")
    assert verify_response.status_code == 400
    assert "illegal" in verify_response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_legal_game_can_still_verify(client, sample_png):
    #Regression: mock Sicilian stays legal and verify still works.
    game_id = await _game_id_from_mock_upload(client, sample_png)

    review = (await client.get(f"/api/v1/games/{game_id}/review")).json()
    assert review["validation"]["legal"] is True

    verify_response = await client.post(f"/api/v1/games/{game_id}/verify")
    assert verify_response.status_code == 200
    assert verify_response.json()["status"] == "verified"
