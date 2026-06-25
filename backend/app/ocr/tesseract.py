import asyncio
from io import BytesIO

import cv2
import numpy as np
import pytesseract
from PIL import Image

from app.ocr.base import OcrProvider, OcrResult


class TesseractOcrProvider(OcrProvider):
    """Run Tesseract locally and return raw text with line breaks preserved."""

    name = "tesseract"

    async def extract(self, image_bytes: bytes, *, mime_type: str) -> OcrResult:
        return await asyncio.to_thread(self._extract_sync, image_bytes)

    def _extract_sync(self, image_bytes: bytes) -> OcrResult:
        image = Image.open(BytesIO(image_bytes))
        processed = self._preprocess(image)
        raw_text = pytesseract.image_to_string(processed)
        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]

        return OcrResult(
            provider=self.name,
            raw_text=raw_text,
            lines=lines,
            raw_blocks=[{"type": "tesseract", "line_count": len(lines)}],
            warnings=[],
        )

    def _preprocess(self, image: Image.Image) -> Image.Image:
        rgb = np.array(image.convert("RGB"))
        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
        adjusted = cv2.convertScaleAbs(gray, alpha=1.5, beta=0)
        return Image.fromarray(adjusted)
