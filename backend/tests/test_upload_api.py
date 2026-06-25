import io

import pytest

from app.config import settings


@pytest.fixture
def sample_jpeg() -> bytes:
    # Minimal valid JPEG (1x1)
    return (
        b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
        b"\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c"
        b"\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c"
        b"\x1c $.\' \",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x08\x00"
        b"\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00"
        b"\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00"
        b"\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x08\x01"
        b"\x01\x00\x00?\x00\xd2\xcf \xff\xd9"
    )


@pytest.mark.asyncio
async def test_upload_png_returns_id(client, sample_png):
    response = await client.post(
        "/api/v1/uploads",
        files={"file": ("scoresheet.png", io.BytesIO(sample_png), "image/png")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"]
    assert data["mime_type"] == "image/png"
    assert data["status"] == "pending"


@pytest.mark.asyncio
async def test_upload_jpeg_returns_id(client, sample_jpeg):
    response = await client.post(
        "/api/v1/uploads",
        files={"file": ("scoresheet.jpg", io.BytesIO(sample_jpeg), "image/jpeg")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"]
    assert data["mime_type"] == "image/jpeg"


@pytest.mark.asyncio
async def test_reject_webp(client, sample_png):
    response = await client.post(
        "/api/v1/uploads",
        files={"file": ("scoresheet.webp", io.BytesIO(sample_png), "image/webp")},
    )
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]


@pytest.mark.asyncio
async def test_reject_empty_file(client):
    response = await client.post(
        "/api/v1/uploads",
        files={"file": ("empty.png", io.BytesIO(b""), "image/png")},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Empty file"


@pytest.mark.asyncio
async def test_reject_content_type_mismatch(client, sample_png):
    response = await client.post(
        "/api/v1/uploads",
        files={"file": ("fake.jpg", io.BytesIO(sample_png), "image/jpeg")},
    )
    assert response.status_code == 400
    assert "does not match" in response.json()["detail"]


@pytest.mark.asyncio
async def test_reject_file_too_large(client, sample_png, monkeypatch):
    monkeypatch.setattr(settings, "max_upload_size_mb", 0)
    response = await client.post(
        "/api/v1/uploads",
        files={"file": ("scoresheet.png", io.BytesIO(sample_png), "image/png")},
    )
    assert response.status_code == 413
    assert response.json()["detail"] == "File too large"
