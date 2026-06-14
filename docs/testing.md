# Testing notes

Manual and fixture-based tests for the scoresheet → PGN loop.

## Synthetic fixture 01

| Field | Value |
|-------|--------|
| File | `test-fixtures/synthetic-01.svg` |
| Source | Synthetic — drawn by us |
| Consent | N/A (fake names) |
| Event | SYNTHETIC TEST EVENT 2026 |
| White | Player A |
| Black | Player B |
| Result | 1-0 |

### Expected moves (golden)

```
1. e4 e5
2. Nf3 Nc6
3. Bb5 a6
4. Ba4 Nf6
5. O-O Be7
```

Use this file to test upload + OCR once the scanner is wired. Compare extracted text to the golden list above.

## Week 2 manual test

- [ ] `npm run dev` in `frontend/` — upload page loads
- [ ] Backend on `:8000` — health check shows connected
- [ ] Drag-drop or camera upload reaches `/api/v1/uploads`
- [ ] Correction screen shows image left, moves right
