# What We Learned

Our weekly log — what we did, accomplished, and learned building Pigeon.  
We update every **Sunday** after the demo. One section per week.

**Founders:** Alex Mutua (product, frontend, security) · Cletus Abumah (backend, OCR, database)

---

## How to use this file

Each week, we copy the template below, fill it in, and keep previous weeks for history. This becomes our interview material and project memory.

```markdown
## Week N — [dates]

### Weekly goal
What we planned on Monday.

### What we did
- Bullet list of tasks completed.

### What we accomplished
- Shippable outcomes (features, docs, deploys, tests).

### What we learned
- Technical lessons, user feedback, mistakes, surprises.

### Blockers
- What slowed us down and how we handled it.

### Next week
- Top 3 priorities for Monday.
```

---

## Pre-build — Planning phase (through June 2026)

### Weekly goal

Define product vision, documentation, team structure, and master plan before writing code.

### What we did

- Wrote product vision, MVP spec, roadmap, and step-by-step master plan.
- Documented why Pigeon wins vs existing scoresheet scanners (archive, dashboard, coaches, organizers).
- Defined team roles, 60/40 equity split, and September internship target.
- Researched competitors (Chess Scanner, KnightVision, Score Sheet Scanner, CheSScan).
- **User validation:** I spoke with dozens of players and coaches about the problem and our approach.
- Added weekly todo tracker (`todos/week-01.json` + `pdone` command).
- Rewrote docs from our POV (we / I where appropriate).

### What we accomplished

- Full planning docs in `docs/` — ready to start Phase 0 (git + scaffold).
- Clear differentiation: lifelong event archive, not one-off scanning.
- Agreement on stack direction: Python (FastAPI) + React/Vite + SQL.
- User demand signal: players and coaches consistently said they need a product like this.

### What we learned

- **The problem is real.** Lower-section and chessmat games rarely get archived; Chess.com/Lichess are for analysis of a few games, not full tournament history.
- **Competitors exist** — we must win on archive-by-event, stats, coach workflow, and correction UX — not “we also scan scoresheets.”
- **Perfect OCR is not the MVP.** Human correction is expected; speed and a smooth correction screen matter more than magic handwriting recognition.
- **Scope discipline matters.** September must-haves (Phase A) are separate from coach bulk, full dashboard stats, and engine analysis.
- Planning without code is useful only up to a point — execution starts with git and scaffold.

### Blockers

- Git repo not initialized yet (next step).
- Wireframes in `wireframes.md` — we will refine as we build.
- OCR engine choice in `ocr-strategy.md` — we start with Tesseract + preprocessing; add cloud OCR later for hard sheets.

### Next week (Week 1 — Phase 0)

1. Initialize private git repo (Alex).
2. Scaffold backend + frontend (Alex: frontend, Cletus: backend).
3. CI on pull requests (Cletus lead).
4. Begin Phase 1 tickets for upload + OCR spike.

---

## Week 1 — June 2026

### Weekly goal

Phase 0 foundation — git, frontend scaffold, docs, todos.

### What we accomplished

- Git repo + GitHub, React/Vite frontend, planning docs, `pdone` tracker.
- Merged Cletus backend + Alex docs onto `main`.

---

## Week 2 — June 2026

### Weekly goal

Upload a scoresheet from the browser and get raw OCR text back from the API.

### What we did

- Built upload UI with drag-drop and camera capture (`frontend/src/components/UploadView.jsx`).
- Added Vite proxy and API client (`vite.config.js`, `frontend/src/api.js`).
- Built correction screen shell — image left, moves right (`CorrectionView.jsx`).
- Created synthetic test fixture `test-fixtures/synthetic-01.svg` + `docs/testing.md`.
- Fixed backend CORS for `localhost:5173`.
- Merged integrate branch to `main` after partner merge confusion (see `merge-recovery.md`).

### What we accomplished

- End-to-end upload flow from browser → FastAPI upload → process endpoint.
- Pigeon-branded UI replacing default Vite template.
- Week 3 todos ready for parser, validation, and wired correction.

### What we learned

- **`git pull` on `main` does not bring other branches** — must merge feature branches before expecting files on main.
- Vite proxy avoids CORS pain in dev; still fixed CORS on backend for direct calls.
- Correction layout is the highest-risk UX — building the shell early was right.

### Blockers

- Correction screen still uses placeholder moves — wire to review API in Week 3.
- Cletus Week 2 tasks (parser, real OCR) still open on his side.

### Next week (Week 3)

1. Wire correction UI to backend review API.
2. Cletus: move parser + chess validation + PGN export.
3. Alex: uncertainty highlights + full e2e flow + PGN download button.

---

## Week 3 — [fill in when complete]
