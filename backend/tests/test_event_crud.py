"""Event CRUD API tests (ticket 2.2)."""

import io
from uuid import uuid4

import pytest


async def _create_event(client, **overrides):
    payload = {
        "name": "Fall Scholastic",
        "location": "Library",
        "section": "U1200",
        **overrides,
    }
    response = await client.post("/api/v1/events", json=payload)
    assert response.status_code == 201
    return response.json()


async def _create_player(client, name: str):
    response = await client.post("/api/v1/players", json={"name": name})
    assert response.status_code == 201
    return response.json()


async def _create_game(client, *, event_id, white_player_id, black_player_id, **overrides):
    payload = {
        "event_id": event_id,
        "white_player_id": white_player_id,
        "black_player_id": black_player_id,
        "result": "1/2-1/2",
        **overrides,
    }
    response = await client.post("/api/v1/games", json=payload)
    assert response.status_code == 201
    return response.json()


async def _game_id_from_mock_upload(client, sample_png: bytes) -> str:
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
async def test_create_event_and_game(client):
    event = await _create_event(client)
    event_id = event["id"]

    white = await _create_player(client, "Alice")
    black = await _create_player(client, "Bob")

    game = await _create_game(
        client,
        event_id=event_id,
        white_player_id=white["id"],
        black_player_id=black["id"],
    )
    assert game["event_id"] == event_id


@pytest.mark.asyncio
async def test_create_event(client):
    event = await _create_event(client, name="NC Opens 2024", location="Raleigh")

    assert event["name"] == "NC Opens 2024"
    assert event["location"] == "Raleigh"
    assert event["section"] == "U1200"
    assert "id" in event
    assert "created_at" in event


@pytest.mark.asyncio
async def test_list_events(client):
    first = await _create_event(client, name="Spring Open")
    second = await _create_event(client, name="Summer Open")

    response = await client.get("/api/v1/events")
    assert response.status_code == 200

    events = response.json()
    ids = {event["id"] for event in events}
    assert first["id"] in ids
    assert second["id"] in ids


@pytest.mark.asyncio
async def test_get_event_by_id(client):
    created = await _create_event(client, name="Winter Classic")

    response = await client.get(f"/api/v1/events/{created['id']}")
    assert response.status_code == 200

    event = response.json()
    assert event["id"] == created["id"]
    assert event["name"] == "Winter Classic"


@pytest.mark.asyncio
async def test_get_event_not_found(client):
    response = await client.get(f"/api/v1/events/{uuid4()}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Event not found"


@pytest.mark.asyncio
async def test_attach_two_games_to_one_event(client):
    """Same flow as test_create_event_and_game, but two games share one event."""
    event = await _create_event(client, name="Club Championship")
    event_id = event["id"]

    alice = await _create_player(client, "Alice")
    bob = await _create_player(client, "Bob")
    carol = await _create_player(client, "Carol")

    game_one = await _create_game(
        client,
        event_id=event_id,
        white_player_id=alice["id"],
        black_player_id=bob["id"],
        result="1-0",
        round=1,
        board=1,
    )
    game_two = await _create_game(
        client,
        event_id=event_id,
        white_player_id=carol["id"],
        black_player_id=alice["id"],
        result="0-1",
        round=2,
        board=3,
    )

    assert game_one["event_id"] == event_id
    assert game_two["event_id"] == event_id

    list_response = await client.get("/api/v1/games")
    assert list_response.status_code == 200

    attached = [g for g in list_response.json() if g["event_id"] == event_id]
    assert len(attached) == 2
    attached_ids = {g["id"] for g in attached}
    assert game_one["id"] in attached_ids
    assert game_two["id"] in attached_ids


@pytest.mark.asyncio
async def test_list_games_filtered_by_event(client):
    event_a = await _create_event(client, name="Event A")
    event_b = await _create_event(client, name="Event B")

    alice = await _create_player(client, "Alice")
    bob = await _create_player(client, "Bob")
    carol = await _create_player(client, "Carol")

    game_a = await _create_game(
        client,
        event_id=event_a["id"],
        white_player_id=alice["id"],
        black_player_id=bob["id"],
    )
    await _create_game(
        client,
        event_id=event_b["id"],
        white_player_id=carol["id"],
        black_player_id=alice["id"],
    )

    filtered = await client.get("/api/v1/games", params={"event_id": event_a["id"]})
    assert filtered.status_code == 200

    games = filtered.json()
    assert len(games) == 1
    assert games[0]["id"] == game_a["id"]
    assert games[0]["event_id"] == event_a["id"]


@pytest.mark.asyncio
async def test_patch_assigns_event_id(client, sample_png):
    """Review PATCH accepts event_id (sent by the frontend) and links the game."""
    event = await _create_event(client, name="Assigned Event")
    game_id = await _game_id_from_mock_upload(client, sample_png)

    review_response = await client.get(f"/api/v1/games/{game_id}/review")
    assert review_response.status_code == 200
    review = review_response.json()

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
        json={"moves": moves, "event_id": event["id"]},
    )
    assert patch_response.status_code == 200
    assert patch_response.json()["header"]["event"]["value"] == "Assigned Event"

    game_response = await client.get(f"/api/v1/games/{game_id}")
    assert game_response.status_code == 200
    assert game_response.json()["event_id"] == event["id"]
