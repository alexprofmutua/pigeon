"""Vision-model OCR provider for handwritten chess scoresheets.

Generic OCR engines like Tesseract are trained for printed/typed text and
perform poorly on handwritten chess notation -- there's no linguistic
context to disambiguate confusions like 1/l/I or 0/O/Q the way there is in
prose. A vision-capable LLM does meaningfully better on this specific input
type because it can reason about the two-column scoresheet layout and
plausible chess notation while reading, rather than reading raw glyphs.
This does not make extraction perfect -- nothing does, on messy
handwriting -- which is exactly why validator.py's alternative-move
ranking exists downstream: it's the safety net for whatever this still
gets wrong.
"""
import base64
import json
import os

import httpx

from app.ocr.base import OcrMoveCandidate, OcrProvider, OcrResult

EXTRACTION_PROMPT = """You are reading a photograph of a handwritten chess scoresheet.
Look carefully at each row of the White and Black move columns, letter by letter, before
deciding on a move. Common misreads to watch for: 1 vs l vs I, 0 vs O vs Q, 6 vs b vs G,
N vs H, and a capture 'x' being dropped or added. Cross-check each reading against basic
chess logic (a piece letter should be followed by a real board square).

Return STRICT JSON only, no markdown fences, no preamble:
{
  "event": "string or empty",
  "site": "string or empty",
  "date": "YYYY.MM.DD or empty",
  "round": "string or empty",
  "board": "string or empty (the board number, if printed on the sheet)",
  "section": "string or empty (e.g. Open, U1800, U1200 -- tournaments often run several sections at once)",
  "white": "string or empty",
  "black": "string or empty",
  "result": "1-0 | 0-1 | 1/2-1/2 | *",
  "moves": [
    {"move_number": 1, "white": "e4", "white_confidence": 0.95, "black": "c5", "black_confidence": 0.9}
  ]
}
white_confidence/black_confidence are your own calibrated confidence (0.0-1.0) that the
reading is correct -- lower it whenever the handwriting was ambiguous, faint, or crossed out.
If a move is illegible, give your single best guess and use a low confidence value; never
skip a move or leave a placeholder."""


class ClaudeVisionOcrProvider(OcrProvider):
    """Reads scoresheets using Claude's vision model instead of traditional OCR."""

    name = "claude_vision"

    def __init__(self, api_key: str | None = None, model: str = "claude-sonnet-4-6"):
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        self.model = model

    async def extract(self, image_bytes: bytes, *, mime_type: str) -> OcrResult:
        if not self.api_key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY is not set -- required for the claude_vision OCR provider."
            )

        b64 = base64.b64encode(image_bytes).decode("ascii")
        body = {
            "model": self.model,
            "max_tokens": 1500,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {"type": "base64", "media_type": mime_type, "data": b64},
                        },
                        {"type": "text", "text": EXTRACTION_PROMPT},
                    ],
                }
            ],
        }
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages", headers=headers, json=body
            )
            resp.raise_for_status()
            data = resp.json()

        text = next((c["text"] for c in data.get("content", []) if c.get("type") == "text"), "{}")
        text = text.strip()
        if text.startswith("```"):
            text = text.strip("`")
            if text.startswith("json"):
                text = text[4:]
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError:
            return OcrResult(
                provider=self.name,
                raw_text=text,
                warnings=["Model did not return parseable JSON; raw response preserved."],
            )

        header_fields = {
            k: parsed.get(k, "")
            for k in ("event", "site", "date", "round", "board", "section", "white", "black", "result")
            if parsed.get(k)
        }

        moves = [
            OcrMoveCandidate(
                move_number=m.get("move_number"),
                white=m.get("white") or None,
                black=m.get("black") or None,
                white_confidence=float(m.get("white_confidence") or 0.0),
                black_confidence=float(m.get("black_confidence") or 0.0),
                raw_text=f"{m.get('white', '')} {m.get('black', '')}".strip(),
            )
            for m in parsed.get("moves", [])
        ]

        low_confidence = [
            m for m in moves if m.white_confidence < 0.6 or (m.black and m.black_confidence < 0.6)
        ]
        warnings = []
        if low_confidence:
            warnings.append(
                f"{len(low_confidence)} move(s) flagged low-confidence -- review closely."
            )

        return OcrResult(
            provider=self.name,
            raw_text=json.dumps(parsed),
            lines=[f"{m.get('white','')} {m.get('black','')}" for m in parsed.get("moves", [])],
            moves=moves,
            header_fields=header_fields,
            raw_blocks=[{"type": "claude_vision", "model": self.model}],
            warnings=warnings,
        )
