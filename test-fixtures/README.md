# Test fixtures

Only **synthetic** or **consented** scoresheet images belong here.

See [`../docs/test-data-protocol.md`](../docs/test-data-protocol.md).

## Protocol

| Rule | Status |
|------|--------|
| Fake names only (Player A–F) | Yes |
| No real tournament photos | Yes |
| Consent documented | N/A — synthetic |
| Upload API test format | PNG committed alongside SVG source |

## Files

| File | Source | Consent | Tests | Expected output |
|------|--------|---------|-------|-----------------|
| `synthetic-01.svg` / `.png` | Synthetic — we created it | N/A | Baseline paired lines, castling | [`../docs/testing.md`](../docs/testing.md) |
| `synthetic-02.svg` / `.png` | Synthetic — we created it | N/A | Sicilian, captures (`cxd4`, `Nxd4`) | [`../docs/testing.md`](../docs/testing.md) |
| `synthetic-03.svg` / `.png` | Synthetic — we created it | N/A | Split lines, `3...`, `+`, OCR `0-0` | [`../docs/testing.md`](../docs/testing.md) |

## Golden move lines

### synthetic-01.svg

1. e4 e5  
2. Nf3 Nc6  
3. Bb5 a6  
4. Ba4 Nf6  
5. O-O Be7  

### synthetic-02 (Sicilian)

1. e4 c5  
2. Nf3 d6  
3. d4 cxd4  
4. Nxd4 Nf6  
5. Nc3 a6  

### synthetic-03 (notation edge cases)

1. e4 c5  
2. Nf3 d6  
3. d4  
3... cxd4  
4. Nxd4 Nf6+  
5. Nc3 a6  
6. Be2 e6  
7. 0-0 Qc7  

Flat SANs for validation: see **fixture 03** section in [`../docs/testing.md`](../docs/testing.md) (`0-0` → `O-O` after parsing).
