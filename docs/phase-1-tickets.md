# Phase 1 Tickets

Weeks 2–4 goal: **one scoresheet → corrected moves → legal PGN.**

Copy these into GitHub Issues (or your project board) when ready. Each maps to [`master-plan.md`](master-plan.md) Phase 1.

| # | Title | Owner | Branch suggestion | Done when |
|---|-------|-------|-------------------|-----------|
| 1.1 | Image upload API (JPEG/PNG, size limit, safe storage) | Cletus | `feat/upload-api` | `curl` upload returns 200 + file id |
| 1.2 | Upload UI (drag-drop + camera on mobile browser) | Alex | `feat/upload-ui` | Image reaches backend from browser |
| 1.3 | OCR spike (Tesseract + raw text + line breaks) | Cletus | `feat/ocr-spike` | Sample scoresheet returns move text |
| 1.4 | Move parser (SAN/algebraic → structured list) | Cletus | `feat/move-parser` | Unit tests pass for common notation |
| 1.5 | Chess validation (python-chess, first illegal move) | Cletus | `feat/chess-validation` | API returns illegal move index |
| 1.6 | Correction screen (edit moves + image side-by-side) | Alex | `feat/correction-ui` | User can fix OCR output in UI |
| 1.7 | Uncertainty highlights (low-confidence moves) | Alex + Cletus | `feat/ocr-confidence-ui` | Uncertain moves visually marked |
| 1.8 | PGN export endpoint + download button | Cletus | `feat/pgn-export` | Valid `.pgn` downloads |
| 1.9 | Wire full flow in frontend | Alex | `feat/e2e-flow` | End-to-end demo without Postman |
| 1.10 | Test notes + 3 fixture scoresheets | Both | `docs/testing-fixtures` | See [`testing.md`](testing.md) |

---

## Suggested build order

We work in this order to avoid blocking each other:

1. **Cletus:** 1.1 upload API  
2. **Alex:** 1.2 upload UI (depends on 1.1)  
3. **Cletus:** 1.3 OCR spike (can start in parallel after 1.1)  
4. **Cletus:** 1.4 parser → 1.5 validation  
5. **Alex:** 1.6 correction screen (needs 1.3 output shape)  
6. **Both:** 1.7 uncertainty UI  
7. **Cletus:** 1.8 PGN export  
8. **Alex:** 1.9 wire full flow  
9. **Both:** 1.10 fixtures + manual test notes  

---

## GitHub Issue template (copy per ticket)

```markdown
## Goal
[One sentence from table above]

## Owner
Alex / Cletus

## Tasks
- [ ] ...
- [ ] ...

## Definition of done
[From "Done when" column]

## Test plan
- [ ] Works locally
- [ ] Other founder can demo without walkthrough
```

---

## Phase 1 exit criteria

- [ ] Demo video: one scoresheet → edit → export PGN
- [ ] Both founders can run the flow locally
- [ ] Documented in `what_we_learned.md` for the week we finish
