import io

import pytest

from app.services import build_process_upload_response


@pytest.mark.asyncio
async def test_process_returns_raw_text_and_lines(client, sample_png):
    upload_response = await client.post(
        "/api/v1/uploads",
        files={"file": ("scoresheet.png", io.BytesIO(sample_png), "image/png")},
    )
    upload_id = upload_response.json()["id"]

    process_response = await client.post(f"/api/v1/uploads/{upload_id}/process")
    assert process_response.status_code == 200

    data = process_response.json()
    assert data["status"] == "completed"
    assert data["ocr_provider"] == "mock"
    assert "1. e4 c5" in data["raw_text"]
    assert data["lines"] == [
        "1. e4 c5",
        "2. Nf3 d6",
        "3. d4 cxd4",
        "4. Nxd4 Nf6",
        "5. Nc3 a6",
    ]
    assert data["game_id"] is not None


@pytest.mark.asyncio
async def test_tesseract_provider_returns_lines_only(monkeypatch):
    from app.ocr.base import OcrResult
    from app.ocr.tesseract import TesseractOcrProvider

    async def fake_extract(self, image_bytes: bytes, *, mime_type: str) -> OcrResult:
        return OcrResult(
            provider="tesseract",
            raw_text="1. e4 e5\n2. Nf3 Nc6",
            lines=["1. e4 e5", "2. Nf3 Nc6"],
        )

    monkeypatch.setattr(TesseractOcrProvider, "extract", fake_extract)

    result = await TesseractOcrProvider().extract(b"fake", mime_type="image/png")
    assert result.lines == ["1. e4 e5", "2. Nf3 Nc6"]
    assert result.moves == []


def test_build_process_upload_response_includes_ocr_fields():
    from datetime import UTC, datetime
    from uuid import uuid4

    from app.models import ScoresheetUpload, UploadStatus

    upload = ScoresheetUpload(
        id=uuid4(),
        storage_path="storage/test.png",
        mime_type="image/png",
        original_filename="sheet.png",
        status=UploadStatus.COMPLETED,
        ocr_provider="tesseract",
        ocr_raw_json={
            "raw_text": "1. e4 e5",
            "lines": ["1. e4 e5"],
        },
    )
    upload.created_at = datetime.now(UTC)
    upload.ocr_completed_at = datetime.now(UTC)

    response = build_process_upload_response(upload)
    assert response.raw_text == "1. e4 e5"
    assert response.lines == ["1. e4 e5"]
