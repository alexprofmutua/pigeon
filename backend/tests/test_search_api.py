"""Search API tests (ticket 2.5)."""

from datetime import date

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


async def _create_game(client, *, white_player_id, black_player_id, **overrides):
    payload = {
        "white_player_id": white_player_id,
        "black_player_id": black_player_id,
        "result": "1/2-1/2",
        **overrides,
    }
    response = await client.post("/api/v1/games", json=payload)
    assert response.status_code == 201
    return response.json()


async def _search(client, **params):
    response = await client.get(
        "/api/v1/games/search",
        params={key: value for key, value in params.items() if value is not None},
    )
    assert response.status_code == 200
    return response.json()


@pytest.fixture
async def archive(client):
    """
    Small library used by every search test:
    - NC Opens 2024: Alice (white) vs Bob (black), 1-0
    - Club Championship: Carol (white) vs Alice (black), 1/2-1/2
    """
    nc_opens = await _create_event(
        client,
        name="NC Opens 2024",
        location="Raleigh",
        start_date="2024-06-01",
        end_date="2024-06-07",
    )
    club = await _create_event(
        client,
        name="Club Championship",
        start_date="2023-11-15",
    )

    alice = await _create_player(client, "Alice Chen")
    bob = await _create_player(client, "Bob Smith")
    carol = await _create_player(client, "Carol Jones")

    nc_game = await _create_game(
        client,
        event_id=nc_opens["id"],
        white_player_id=alice["id"],
        black_player_id=bob["id"],
        result="1-0",
        round=1,
        board=2,
    )
    club_game = await _create_game(
        client,
        event_id=club["id"],
        white_player_id=carol["id"],
        black_player_id=alice["id"],
        result="1/2-1/2",
        round=3,
        board=5,
    )

    return {
        "nc_opens": nc_opens,
        "club": club,
        "alice": alice,
        "bob": bob,
        "carol": carol,
        "nc_game": nc_game,
        "club_game": club_game,
    }


def _ids(games):
    return {game["id"] for game in games}


@pytest.mark.asyncio
async def test_search_by_player_name(client, archive):
    results = await _search(client, player="Alice")

    assert _ids(results) == {archive["nc_game"]["id"], archive["club_game"]["id"]}


@pytest.mark.asyncio
async def test_search_by_event_id(client, archive):
    results = await _search(client, event_id=archive["nc_opens"]["id"])

    assert len(results) == 1
    assert results[0]["id"] == archive["nc_game"]["id"]
    assert results[0]["event_id"] == archive["nc_opens"]["id"]


@pytest.mark.asyncio
async def test_search_by_event_name(client, archive):
    results = await _search(client, event_name="NC Opens")

    assert len(results) == 1
    assert results[0]["id"] == archive["nc_game"]["id"]


@pytest.mark.asyncio
async def test_search_by_result(client, archive):
    results = await _search(client, result="1-0")

    assert len(results) == 1
    assert results[0]["id"] == archive["nc_game"]["id"]
    assert results[0]["result"] == "1-0"


@pytest.mark.asyncio
async def test_search_by_date_range(client, archive):
    results = await _search(
        client,
        date_from=date(2024, 1, 1),
        date_to=date(2024, 12, 31),
    )

    assert len(results) == 1
    assert results[0]["id"] == archive["nc_game"]["id"]


@pytest.mark.asyncio
async def test_search_q_free_text(client, archive):
    # LibraryPage sends ?q= for a single search box (player or event text).
    by_player = await _search(client, q="bob")
    assert _ids(by_player) == {archive["nc_game"]["id"]}

    by_event = await _search(client, q="club")
    assert _ids(by_event) == {archive["club_game"]["id"]}


@pytest.mark.asyncio
async def test_search_combined_filters(client, archive):
    results = await _search(client, player="Alice", result="1/2-1/2")

    assert len(results) == 1
    assert results[0]["id"] == archive["club_game"]["id"]


@pytest.mark.asyncio
async def test_search_no_matches(client, archive):
    results = await _search(client, player="Nobody")

    assert results == []
