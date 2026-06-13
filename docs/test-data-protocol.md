# Test Data Protocol

How we handle scoresheet images and test files for OCR — **consent first, nothing private in git.**

See also: [`privacy-security.md`](privacy-security.md), [`ocr-strategy.md`](ocr-strategy.md).

---

## Rules (non-negotiable)

1. **Never commit** real tournament scoresheets with player names unless we have **written consent** from every person on the sheet.
2. **Never commit** `.env`, API keys, or uploads from production/staging.
3. **Synthetic or consented only** in the repo — everything else stays local or in a private shared drive.
4. If we are unsure whether a file is okay to store, **we don't commit it** — we ask first.

---

## What we can put in the repo

| Allowed | Not allowed |
|---------|-------------|
| Synthetic scoresheets we draw/print ourselves | Photos from real tournaments (default) |
| Heavily redacted samples (names blacked out) + consent note | Minors' scoresheets without parent/coach consent |
| README describing where test files live | Private user uploads from staging |
| Empty `test-fixtures/.gitkeep` | `uploads/`, `scans/` with real data |

---

## Folder layout (local + repo)

```
pigeon/
├── test-fixtures/              # committed — synthetic/consented only
│   ├── README.md               # what each file is and consent status
│   ├── synthetic-01.png        # we create these ourselves
│   └── ...
├── uploads/                    # gitignored — dev uploads at runtime
├── scans/                      # gitignored
└── private-data/               # gitignored — shared drive mirror if needed
```

We already gitignore `uploads/`, `scans/`, `private-data/` in `.gitignore`.

---

## Consent checklist (real scoresheets)

Before using a real sheet for tests or training:

- [ ] Player(s) on the sheet agreed (or coach/TD for event bulk)
- [ ] We documented consent in `test-fixtures/README.md` (date, who, scope)
- [ ] Names/events redacted if sheet is committed; full sheet stays private if not
- [ ] Sheet not used for public blog/posts without separate permission

---

## Synthetic scoresheets (Phase 1 default)

Until we have consented real sheets:

1. We print or hand-write a **fake** scoresheet (fake names: "Player A" / "Player B", fake event).
2. We photograph it and store under `test-fixtures/`.
3. We record **expected moves** in `docs/testing.md` (golden PGN or move list).

---

## Sharing between Alex and Cletus

| Method | Use for |
|--------|---------|
| **Git** (`test-fixtures/`) | Synthetic, consented, redacted files only |
| **Private Google Drive / shared folder** | Real tournament sheets until consent + redaction |
| **Never iMessage random DMs** | Easy to lose track of consent |

---

## When we evaluate OCR (Phase 4)

- 10+ sheets with documented consent or synthetic source
- Metrics in `docs/ocr-evaluation.md` (we create when scanner exists)
- Compare vs competitors on the **same** consented/synthetic set only

---

## If we accidentally commit private data

1. Remove the file from the repo immediately.
2. Rotate any exposed secrets.
3. Use `git filter-repo` or GitHub support if it hit `main` — don't just delete in a follow-up commit.
4. Note the incident in `what_we_learned.md` (no names in the log).
