ALLOWED_MIME_TYPES = frozenset({"image/jpeg", "image/png"})

_SIGNATURES: dict[str, tuple[bytes, ...]] = {
    "image/jpeg": (b"\xff\xd8\xff",),
    "image/png": (b"\x89PNG\r\n\x1a\n",),
}


def validate_image_upload(*, mime_type: str | None, file_bytes: bytes) -> None:
    """Raise ValueError if the upload is not a supported JPEG/PNG image."""
    if mime_type not in ALLOWED_MIME_TYPES:
        allowed = ", ".join(sorted(ALLOWED_MIME_TYPES))
        raise ValueError(f"Unsupported file type. Allowed types: {allowed}")

    if not file_bytes:
        raise ValueError("Empty file")

    signatures = _SIGNATURES[mime_type]
    if not any(file_bytes.startswith(signature) for signature in signatures):
        raise ValueError("File content does not match declared image type")
