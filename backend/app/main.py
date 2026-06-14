from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import router as v1_router
from app.config import settings
from app.database import Base, engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["replace with frontend URL"],
    allow_credentials=True,
    allow_methods=["replace with frontend URL"],
    allow_headers=["replace with frontend URL"],
)

app.include_router(v1_router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "ok", "ocr_provider": settings.ocr_provider}

@app.get("/api/hello")
def say_hello():
    return {"message": "Hello from the backend!!"}