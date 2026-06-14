from fastapi import APIRouter

from app.api.v1 import games, review, uploads

router = APIRouter()
router.include_router(games.router, tags=["events", "players", "games"])
router.include_router(uploads.router, tags=["uploads"])
router.include_router(review.router, tags=["review"])
