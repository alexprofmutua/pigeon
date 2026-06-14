from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import GameReviewResponse, MessageResponse, ReviewUpdateRequest
from app.services import ReviewService

router = APIRouter()


@router.get("/games/{game_id}/review", response_model=GameReviewResponse)
async def get_game_review(game_id: UUID, db: AsyncSession = Depends(get_db)):
    service = ReviewService(db)
    try:
        return await service.get_game_for_review(game_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.patch("/games/{game_id}/moves", response_model=GameReviewResponse)
async def update_game_moves(
    game_id: UUID,
    payload: ReviewUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    service = ReviewService(db)
    try:
        return await service.update_moves(game_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/games/{game_id}/verify", response_model=GameReviewResponse)
async def verify_game(game_id: UUID, db: AsyncSession = Depends(get_db)):
    service = ReviewService(db)
    try:
        return await service.verify_game(game_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
