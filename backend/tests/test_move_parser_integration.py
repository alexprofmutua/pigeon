"""Integration: Tesseract-style OCR (lines only) + move parser → game created."""

import io

import pytest


@pytest.mark.asyncio
async def test_process_parses_lines_into_game(client, sample_png, monkeypatch):
    """When OCR returns lines but no moves, parser should create a game."""

    async def fake_extract(self, image_bytes: bytes, *, mime_type: str):
        from app.ocr.base import OcrResult

        lines = [
            "1. e4 c5",
            "2. Nf3 d6",
            "3. d4 cxd4",
            "4. Nxd4 Nf6",
            "5. Nc3 a6",
        ]
        return OcrResult(
            provider="tesseract",
            raw_text="\n".join(lines),
            lines=lines,
            moves=[],  # Tesseract path today
        )

    from app.ocr.tesseract import TesseractOcrProvider

    monkeypatch.setattr(TesseractOcrProvider, "extract", fake_extract)
    monkeypatch.setenv("OCR_PROVIDER", "tesseract")

    upload_response = await client.post(
        "/api/v1/uploads",
        files={"file": ("scoresheet.png", io.BytesIO(sample_png), "image/png")},
    )
    upload_id = upload_response.json()["id"]

    process_response = await client.post(f"/api/v1/uploads/{upload_id}/process")
    assert process_response.status_code == 200

    data = process_response.json()
    assert data["game_id"] is not None
    assert data["lines"] == [
        "1. e4 c5",
        "2. Nf3 d6",
        "3. d4 cxd4",
        "4. Nxd4 Nf6",
        "5. Nc3 a6",
    ]
