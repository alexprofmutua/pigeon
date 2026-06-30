# Testing notes

Manual and fixture-based tests for the scoresheet → PGN loop.

See [`test-data-protocol.md`](test-data-protocol.md) — all fixtures here are **synthetic** with fake names only.

## Fixture overview

| Fixture | Opening / focus | Exercises |
|---------|-----------------|-------------|
| `synthetic-01` | Ruy Lopez — clean paired lines | Baseline OCR + parser |
| `synthetic-02` | Sicilian — captures on same line | Capture SAN (`cxd4`, `Nxd4`); matches mock OCR golden game |
| `synthetic-03` | Sicilian — split lines + notation edges | White-only line, `3...` black-only, check `+`, OCR castling `0-0` → `O-O` |

Each fixture ships as **SVG** (editable source) and **PNG** (for `POST /api/v1/uploads`, which accepts JPEG/PNG only).

---

## Synthetic fixture 01

| Field | Value |
|-------|--------|
| File | `test-fixtures/synthetic-01.svg` (source), export PNG locally if needed |
| Source | Synthetic — drawn by us |
| Consent | N/A (fake names) |
| Event | SYNTHETIC TEST EVENT 2026 |
| White | Player A |
| Black | Player B |
| Result | 1-0 |

### Expected move lines (golden)

```
1. e4 e5
2. Nf3 Nc6
3. Bb5 a6
4. Ba4 Nf6
5. O-O Be7
```

### Flat SANs (validation / PGN)

`e4`, `e5`, `Nf3`, `Nc6`, `Bb5`, `a6`, `Ba4`, `Nf6`, `O-O`, `Be7`

---

## Synthetic fixture 02 — Sicilian + captures

| Field | Value |
|-------|--------|
| File | `test-fixtures/synthetic-02.svg`, `test-fixtures/synthetic-02.png` |
| Source | Synthetic — drawn by us |
| Consent | N/A (fake names) |
| Event | SYNTHETIC TEST EVENT 2026 — Sheet B |
| White | Player C |
| Black | Player D |
| Result | 1-0 |

### What this tests

- **Parser:** capture notation (`cxd4`, `Nxd4`) on standard paired lines
- **OCR:** different opening from fixture 01 (Sicilian vs Ruy Lopez)
- **Mock parity:** same move list as `MockOcrProvider` — useful to compare Tesseract vs mock
- **Validation / PGN:** full legal sequence through move 10

### Expected move lines (golden)

```
1. e4 c5
2. Nf3 d6
3. d4 cxd4
4. Nxd4 Nf6
5. Nc3 a6
```

### Flat SANs (validation / PGN)

`e4`, `c5`, `Nf3`, `d6`, `d4`, `cxd4`, `Nxd4`, `Nf6`, `Nc3`, `a6`

### Manual smoke

```bash
curl -s -X POST "http://127.0.0.1:8000/api/v1/uploads" \
  -F "file=@test-fixtures/synthetic-02.png"
# → process → compare lines to golden; verify → GET /pgn
```

---

## Synthetic fixture 03 — split lines, checks, OCR castling

| Field | Value |
|-------|--------|
| File | `test-fixtures/synthetic-03.svg`, `test-fixtures/synthetic-03.png` |
| Source | Synthetic — drawn by us |
| Consent | N/A (fake names) |
| Event | SYNTHETIC TEST EVENT 2026 — Sheet C |
| White | Player E |
| Black | Player F |
| Result | * (in progress) |

### What this tests

- **Parser `MOVE_NUMBER_WHITE`:** `3. d4` (white only on one line)
- **Parser `MOVE_NUMBER_BLACK_ONLY`:** `3... cxd4` (black move on its own line)
- **Parser normalization:** sheet shows `7. 0-0` — parser should yield `O-O` (castling after `Be2` clears f1)
- **Parser:** check suffix `Nf6+`
- **OCR:** multi-line layout (harder than 01/02); expect noise — correction UX still required
- **Validation:** sequence is legal through ply 14 (`Be2` before `O-O` — bishop must leave f1)

### Expected move lines (golden)

```
1. e4 c5
2. Nf3 d6
3. d4
3... cxd4
4. Nxd4 Nf6+
5. Nc3 a6
6. Be2 e6
7. 0-0 Qc7
```

### Flat SANs after parsing (validation / PGN)

Use **`O-O`** (not `0-0`) when submitting corrections or comparing validation:

`e4`, `c5`, `Nf3`, `d6`, `d4`, `cxd4`, `Nxd4`, `Nf6+`, `Nc3`, `a6`, `Be2`, `e6`, `O-O`, `Qc7`

### Manual smoke

```bash
curl -s -X POST "http://127.0.0.1:8000/api/v1/uploads" \
  -F "file=@test-fixtures/synthetic-03.png"
# → process with OCR_PROVIDER=tesseract locally
# → expect imperfect raw_text; parser should still structure lines
# → correct if needed → verify → GET /pgn
```

---

## Regenerating PNG from SVG

Upload API accepts **JPEG/PNG only**. If you edit an SVG, re-export PNG:

```bash
cd test-fixtures
qlmanage -t -s 1200 -o . synthetic-02.svg && mv -f synthetic-02.svg.png synthetic-02.png
qlmanage -t -s 1200 -o . synthetic-03.svg && mv -f synthetic-03.svg.png synthetic-03.png
```

(On Linux, use `rsvg-convert -w 1200 synthetic-02.svg -o synthetic-02.png`.)

---

## Week 2 manual test

- [ ] `npm run dev` in `frontend/` — upload page loads
- [ ] Backend on `:8000` — health check shows connected
- [ ] Drag-drop or camera upload reaches `/api/v1/uploads`
- [ ] Correction screen shows image left, moves right

## Ticket 1.10 checklist (fixtures 02–03)

- [x] `synthetic-02` — Sicilian + captures (SVG + PNG)
- [x] `synthetic-03` — split lines, `3...`, check, `0-0` castling (SVG + PNG)
- [x] Golden moves documented above
- [ ] Both founders run manual smoke on at least one fixture each
- [ ] Note OCR quality vs golden in `what_we_learned.md` when tested
