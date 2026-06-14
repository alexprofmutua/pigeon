import io

import pytest


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["ocr_provider"] == "mock"


@pytest.mark.asyncio
async def test_upload_process_review_verify_flow(client, sample_png):
    # Upload scoresheet
    upload_response = await client.post(
        "/api/v1/uploads",
        files={"file": ("scoresheet.png", io.BytesIO(sample_png), "image/png")},
    )
    assert upload_response.status_code == 202
    upload_id = upload_response.json()["id"]

    # Process with mock OCR
    process_response = await client.post(f"/api/v1/uploads/{upload_id}/process")
    assert process_response.status_code == 200
    process_data = process_response.json()
    assert process_data["status"] == "completed"
    assert process_data["ocr_provider"] == "mock"
    game_id = process_data["game_id"]
    assert game_id is not None

    # Review screen payload
    review_response = await client.get(f"/api/v1/games/{game_id}/review")
    assert review_response.status_code == 200
    review = review_response.json()
    assert review["status"] == "needs_review"
    assert review["header"]["white"]["value"] == "Smith, John"
    assert len(review["moves"]) == 5
    assert review["validation"]["legal"] is True

    # Correct a move (no-op: re-submit same moves)
    moves = []
    ply = 1
    for pair in review["moves"]:
        if pair["white"]["san"]:
            moves.append({"ply": ply, "san": pair["white"]["san"]})
            ply += 1
        if pair["black"]["san"]:
            moves.append({"ply": ply, "san": pair["black"]["san"]})
            ply += 1

    patch_response = await client.patch(
        f"/api/v1/games/{game_id}/moves",
        json={"moves": moves, "result": "1-0"},
    )
    assert patch_response.status_code == 200

    # Verify and export PGN
    verify_response = await client.post(f"/api/v1/games/{game_id}/verify")
    assert verify_response.status_code == 200
    assert verify_response.json()["status"] == "verified"

    pgn_response = await client.get(f"/api/v1/games/{game_id}/pgn")
    assert pgn_response.status_code == 200
    assert "Smith, John" in pgn_response.text
    assert "1. e4" in pgn_response.text


@pytest.mark.asyncio
async def test_create_event_and_game(client):
    event_response = await client.post(
        "/api/v1/events",
        json={"name": "Fall Scholastic", "location": "Library", "section": "U1200"},
    )
    assert event_response.status_code == 201
    event_id = event_response.json()["id"]

    white_response = await client.post("/api/v1/players", json={"name": "Alice"})
    black_response = await client.post("/api/v1/players", json={"name": "Bob"})

    game_response = await client.post(
        "/api/v1/games",
        json={
            "event_id": event_id,
            "white_player_id": white_response.json()["id"],
            "black_player_id": black_response.json()["id"],
            "result": "1/2-1/2",
        },
    )
    assert game_response.status_code == 201
    assert game_response.json()["event_id"] == event_id
