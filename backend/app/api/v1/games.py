from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.database import get_db
from app.models import Event, Game, GameStatus, Player
from app.schemas import (
    EventCreate,
    EventResponse,
    GameCreate,
    GameResponse,
    PlayerCreate,
    PlayerResponse,
)
from app.services import ReviewService

router = APIRouter()


@router.post("/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(payload: EventCreate, db: AsyncSession = Depends(get_db)):
    event = Event(**payload.model_dump())
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


@router.get("/events", response_model=list[EventResponse])
async def list_events(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).order_by(Event.created_at.desc()))
    return result.scalars().all()


@router.get("/events/{event_id}", response_model=EventResponse)
async def get_event(event_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("/players", response_model=PlayerResponse, status_code=status.HTTP_201_CREATED)
async def create_player(payload: PlayerCreate, db: AsyncSession = Depends(get_db)):
    player = Player(**payload.model_dump())
    db.add(player)
    await db.commit()
    await db.refresh(player)
    return player


@router.get("/players", response_model=list[PlayerResponse])
async def list_players(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Player).order_by(Player.name))
    return result.scalars().all()


@router.post("/games", response_model=GameResponse, status_code=status.HTTP_201_CREATED)
async def create_game(payload: GameCreate, db: AsyncSession = Depends(get_db)):
    game = Game(**payload.model_dump())
    db.add(game)
    await db.commit()
    await db.refresh(game)
    return game


@router.get("/games", response_model=list[GameResponse])
async def list_games(
    game_status: GameStatus | None = None,
    event_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Game).order_by(Game.created_at.desc())
    if game_status is not None:
        query = query.where(Game.status == game_status)
    if event_id is not None:
        query = query.where(Game.event_id == event_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/games/search", response_model=list[GameResponse])
async def search_games(
    q: str | None = None,
    player: str | None = None,
    event_id: UUID | None = None,
    event_name: str | None = None,
    result: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    game_status: GameStatus | None = None,
    db: AsyncSession = Depends(get_db),
):
    white = aliased(Player)
    black = aliased(Player)

    query = (
        select(Game)
        .outerjoin(Event, Game.event_id == Event.id)
        .outerjoin(white, Game.white_player_id == white.id)
        .outerjoin(black, Game.black_player_id == black.id)
        .order_by(Game.created_at.desc())
    )

    if game_status is not None:
        query = query.where(Game.status == game_status)
    if event_id is not None:
        query = query.where(Game.event_id == event_id)
    if event_name is not None:
        query = query.where(Event.name.ilike(f"%{event_name}%"))
    if result is not None:
        query = query.where(Game.result == result)
    if player is not None:
        pattern = f"%{player}%"
        query = query.where(or_(white.name.ilike(pattern), black.name.ilike(pattern)))
    if date_from is not None:
        query = query.where(Event.start_date >= date_from)
    if date_to is not None:
        query = query.where(Event.start_date <= date_to)
    if q is not None:
        pattern = f"%{q}%"
        query = query.where(
            or_(
                white.name.ilike(pattern),
                black.name.ilike(pattern),
                Event.name.ilike(pattern),
            )
        )

    rows = await db.execute(query)
    return rows.scalars().unique().all()


@router.get("/games/{game_id}", response_model=GameResponse)
async def get_game(game_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Game).where(Game.id == game_id))
    game = result.scalar_one_or_none()
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@router.get("/games/{game_id}/pgn")
async def export_pgn(game_id: UUID, db: AsyncSession = Depends(get_db)):
    service = ReviewService(db)
    try:
        pgn, filename = await service.get_pgn_export(game_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return PlainTextResponse(
        content=pgn,
        media_type="text/plain; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
