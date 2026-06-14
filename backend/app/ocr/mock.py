from app.ocr.base import OcrMoveCandidate, OcrProvider, OcrResult


class MockOcrProvider(OcrProvider):
    """Deterministic OCR provider for development and integration testing."""

    name = "mock"

    async def extract(self, image_bytes: bytes, *, mime_type: str) -> OcrResult:
        return OcrResult(
            provider=self.name,
            header_fields={
                "event": "Spring Open U1600",
                "site": "Community Center",
                "date": "2026.03.15",
                "white": "Smith, John",
                "black": "Lee, Karen",
                "result": "1-0",
            },
            moves=[
                OcrMoveCandidate(1, "e4", "c5", 0.95, 0.88),
                OcrMoveCandidate(2, "Nf3", "d6", 0.92, 0.85),
                OcrMoveCandidate(3, "d4", "cxd4", 0.90, 0.72),
                OcrMoveCandidate(4, "Nxd4", "Nf6", 0.91, 0.87),
                OcrMoveCandidate(5, "Nc3", "a6", 0.89, 0.83),
            ],
            raw_blocks=[{"type": "mock", "note": "Replace with real OCR output"}],
            warnings=["Mock provider — no image was processed"],
        )
