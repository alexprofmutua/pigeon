# OCR Strategy

How Pigeon reads scoresheets — chosen to fit our goals, timeline, and team.

**Owners:** Cletus Abumah (integration, experiments) · Alex Mutua (correction UI, uncertainty display)

---

## Our goals

- Extract move text from photos of handwritten or printed scoresheets.
- Flag **uncertain** text so users correct those moves first.
- Ship a working scanner by September with **human correction** as part of the product.
- Compare accuracy vs competitors **before product completion** (Phase 4 in `master-plan.md`).
- Keep costs low during development; avoid training a custom ML model as freshmen.

---

## Recommendation: two-stage approach

### Stage 1 — Prototype (Phase 1, Weeks 2–4): **Tesseract + OpenCV**

| | |
|---|---|
| **What** | [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) via `pytesseract` in Python, with image preprocessing |
| **Preprocessing** | OpenCV: grayscale, contrast, deskew, crop to scoresheet region, optional binarization |
| **Why now** | Free, runs locally, no API keys, no per-scan cost, good for learning and CI |
| **Limitation** | Weak on messy handwriting — **expected**; correction UI carries the product |

**Cletus:** build an `OcrProvider` interface so we can swap engines without rewriting the API.

```python
# Concept — not production code yet
class OcrResult:
    raw_text: str
    lines: list[str]
    segments: list[dict]  # text, confidence, bounding_box

def run_ocr(image_path: str) -> OcrResult: ...
```

Return **per-word or per-line confidence** from Tesseract (`image_to_data`) so Alex can highlight uncertain moves in the UI.

### Stage 2 — Accuracy pass (Phase 3–4): **Google Cloud Vision API** (fallback)

| | |
|---|---|
| **What** | [Cloud Vision Document Text Detection](https://cloud.google.com/vision/docs/ocr) |
| **When** | After Stage 1 works end-to-end; use for low-confidence regions or full re-scan |
| **Why** | Stronger on varied handwriting than Tesseract alone; pay-per-image (~$1.50 per 1000 images in general pricing — verify current rates) |
| **How** | If Tesseract average confidence on a line &lt; threshold → optional Vision API pass on that crop |

**Alternative:** AWS Textract — similar idea; pick one cloud provider, not both.

### Stage 3 — Post-September (only if metrics justify it)

- Compare multiple engines on our consented test set.
- Chess-specific post-processing (regex for SAN: `Nf3`, `O-O`, `exd5`, `#`, `+`).
- Optional fine-tuning or custom model — **not** before September.

---

## What we are not doing first

| Option | Why not now |
|--------|-------------|
| Train our own handwriting model | Months of ML work + labeled data; wrong priority |
| Cloud-only from day one | Cost, API keys, offline dev harder |
| Single engine forever | Tesseract alone will not match KnightVision marketing claims |
| Perfect OCR promise | Conflicts with product truth; correction is the feature |

---

## Chess-specific pipeline (after raw OCR)

Raw OCR text is not enough. **Cletus** owns a parser layer:

1. Split text into move pairs (1. e4 e5, 2. Nf3 …).
2. Normalize common OCR mistakes (`0-O` → `O-O`, `l` vs `1`, `S` vs `5` in context).
3. Feed parsed moves to **python-chess** for legality validation.
4. Return first illegal move index to the correction UI.

OCR + parser + validator together define “scan quality,” not OCR alone.

---

## Testing plan (when scanner exists)

As Alex noted: formal scoresheet testing comes **after** the scanner is built.

| When | What |
|------|------|
| Phase 1 | 3 fixture images; manual “good enough to correct?” |
| Phase 4 | 10+ consented scoresheets; measure **moves corrected per game** |
| Before September ship | Same sheets through Chess Scanner + KnightVision; record time and correction count |

Document results in `what_we_learned.md` and a future `docs/ocr-evaluation.md`.

---

## Phase 1 decision (Week 1)

**Approved direction for scaffold:**

- **Engine:** Tesseract 5.x + OpenCV preprocessing
- **Interface:** pluggable `OcrProvider` in backend
- **UI:** confidence thresholds → yellow/red highlights on move list
- **Revisit:** Google Cloud Vision in Phase 3 if correction rate is too high on real sheets

---

## Dependencies (backend)

```
pytesseract
opencv-python-headless
python-chess
Pillow
```

Tesseract binary must be installed on dev machines (document in README during Phase 0).

Cloud Vision (later):

```
google-cloud-vision
```

Store API key in `.env` only — never commit.
