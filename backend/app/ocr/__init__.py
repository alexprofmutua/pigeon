from app.config import settings
from app.ocr.base import OcrProvider
from app.ocr.mock import MockOcrProvider

_PROVIDERS: dict[str, type] = {
    "mock": MockOcrProvider,
}


def get_ocr_provider() -> OcrProvider:
    if settings.ocr_provider == "tesseract":
        from app.ocr.tesseract import TesseractOcrProvider

        return TesseractOcrProvider()

    provider_cls = _PROVIDERS.get(settings.ocr_provider)
    if provider_cls is None:
        raise ValueError(
            f"Unknown OCR provider '{settings.ocr_provider}'. "
            f"Available: mock, tesseract"
        )
    return provider_cls()
