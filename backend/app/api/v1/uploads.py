from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.schemas import UploadResponse
from app.services import UploadService
from app.upload_validation import validate_image_upload

router = APIRouter()


@router.post("/uploads", response_model = UploadResponse, status_code = status.HTTP_200_OK)
async def upload_scoresheets(
    file: UploadFile = File(...),
    game_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    file_bytes = await file.read()

    try:
        validate_image_upload(mime_type = file.content_type, file_bytes = file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code = 400, detail = str(exc)) from exc

    if len(file_bytes) > settings.max_upload_size_bytes:
        raise HTTPException(status_code = 413, detail = "File too large")

    service = UploadService(db)
    upload = await service.save_upload(
        file_bytes = file_bytes,
        mime_type = file.content_type,
        original_filename = file.filename,
        game_id = game_id,
    )
    return upload


@router.get("/uploads/{upload_id}", response_model=UploadResponse)
async def get_upload(upload_id: UUID, db: AsyncSession = Depends(get_db)):
    service = UploadService(db)
    upload = await service.get_upload(upload_id)
    if upload is None:
        raise HTTPException(status_code = 404, detail = "Upload not found")
    return upload


@router.post("/uploads/{upload_id}/process", response_model=UploadResponse)
async def process_upload(upload_id: UUID, db: AsyncSession = Depends(get_db)):
    service = UploadService(db)
    try:
        return await service.process_upload(upload_id)
    except ValueError as exc:
        raise HTTPException(status_code = 404, detail = str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code = 500, detail = str(exc)) from exc


@router.get("/uploads/{upload_id}/image")
async def get_upload_image(upload_id: UUID, db: AsyncSession = Depends(get_db)):
    service = UploadService(db)
    upload = await service.get_upload(upload_id)
    if upload is None:
        raise HTTPException(status_code = 404, detail = "Upload not found")

    path = Path(upload.storage_path)
    if not path.exists():
        raise HTTPException(status_code = 404, detail = "Image file not found")

    return FileResponse(path, media_type = upload.mime_type)
