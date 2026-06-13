# Pigeon

We're building Pigeon — a chess scoresheet scanner and **lifelong game archive**. It turns handwritten tournament notation into clean PGN files, organizes every game by event, and gives players, coaches, and organizers tools to review, stats-track, and preserve games that would otherwise be forgotten—especially games from lower sections and chessmats that never reach FIDE or public databases.

## Why It Matters

Most over-the-board games are written on paper and then disappear. Top boards sometimes get recorded; everyone else loses valuable history. With Pigeon, players save **all** their games—NC Opens 2024, Mombasa Opens, club nights—in one place with dashboard stats, replay, and coach/organizer workflows.

## Why We Will Win

- **Faster scanning** than manual entry and clunky one-off tools.
- **Event-organized archive** for your entire chess life, not single-game exports.
- **Personal dashboard**: openings, win rates, streaks, top rivals.
- **Coach tools**: student permission, stars, comments on games.
- **Organizer bulk workflow**: phone scan → laptop review with AI legality hints.
- **Every handwriting level** with smart correction UX—we don't pretend OCR is perfect.

See [`docs/differentiation.md`](docs/differentiation.md) for our full competitive story.

## Our First Goal (September)

We are shipping a functional, deployed app that:

- Uploads or captures scoresheet images.
- Extracts move notation with uncertainty flags.
- Lets users correct moves quickly with the image visible.
- Validates moves against chess rules.
- Exports clean PGN.
- Saves games in event-grouped, searchable libraries.
- Shows dashboard stats and in-app replay.
- Supports user accounts with security basics.

## Team

**Alex Mutua** (founder, 60%) · **Cletus Abumah** (co-founder, 40%) — CS freshmen, ~20 hrs/week each.

Our primary goal: **internship-ready engineering** at companies like Microsoft, Meta, and similar programs. See [`docs/team-and-equity.md`](docs/team-and-equity.md).

## Weekly todos

We track tasks in JSON and mark them from the terminal:

```bash
pdone who alex      # once per machine (see docs/todos.md)
pdone git-init        # mark a task done → Alex: 1/5 done
```

See [`docs/todos.md`](docs/todos.md).

## Documentation

Full index: [`docs/README.md`](docs/README.md)

| File | What it covers |
|------|----------------|
| [`docs/master-plan.md`](docs/master-plan.md) | **Main plan** — every step, week by week |
| [`docs/differentiation.md`](docs/differentiation.md) | Why we win (archive, dashboard, coaches, organizers) |
| [`docs/product-features.md`](docs/product-features.md) | Full feature list by player / coach / organizer |
| [`docs/team-and-equity.md`](docs/team-and-equity.md) | Roles, 60/40 split, internship goals |
| [`docs/vision.md`](docs/vision.md) | Our mission (every board, not just top sections) |
| [`docs/mvp-spec.md`](docs/mvp-spec.md) | September must-haves vs stretch |
| [`docs/roadmap.md`](docs/roadmap.md) | High-level phases |
| [`docs/team-workflow.md`](docs/team-workflow.md) | How we work — git, PRs, weekly rhythm |
| [`docs/todos.md`](docs/todos.md) | Weekly JSON todos + `pdone` command |
| [`docs/privacy-security.md`](docs/privacy-security.md) | Security rules from day one |
| [`docs/what_we_learned.md`](docs/what_we_learned.md) | Weekly log — what we did and learned |
| [`docs/wireframes.md`](docs/wireframes.md) | Screen layout sketches |
| [`docs/ocr-strategy.md`](docs/ocr-strategy.md) | OCR engine choice and testing plan |
| [`docs/phase-1-tickets.md`](docs/phase-1-tickets.md) | Phase 1 GitHub issues / build order |
| [`docs/test-data-protocol.md`](docs/test-data-protocol.md) | Consent rules for scoresheet test images |

## Our Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React + Vite | Fast dev server, Alex owns UI |
| Backend | FastAPI (Python) | Matches our Python skills, async APIs |
| Database | SQLite (dev) → Postgres (staging) | Simple locally, standard in production |
| OCR (Phase 1) | Tesseract + OpenCV | Free, local — see `docs/ocr-strategy.md` |
| Chess logic | python-chess | PGN + legality validation |

## Project layout

```
pigeon/
├── backend/           # FastAPI (Cletus — Week 1 scaffold)
├── frontend/          # React + Vite (Alex)
├── docs/              # Plans, specs, protocols
├── scripts/           # pdone, setup-shell.sh
├── test-fixtures/     # Synthetic/consented scoresheets only
├── todos/             # Weekly task JSON (week-01.json, …)
└── README.md
```

## Development setup

### Prerequisites

- **Node.js** 18+ (`node -v`, `npm -v`)
- **Python** 3.11+ (`python3 -v`)
- **Git** + GitHub access

Install later (Phase 1): **Tesseract** OCR binary — documented when Cletus wires OCR.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173/**

### Backend

*(Coming when Cletus merges `feat/backend-scaffold`)*

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API will run at **http://localhost:8000**

### Weekly todos

```bash
./scripts/setup-shell.sh   # once — adds pdone to ~/.zshrc
pdone who alex             # or: pdone who cletus
pdone status
```

See [`docs/todos.md`](docs/todos.md).

### Environment variables

Copy `.env.example` to `.env` when Cletus adds it — never commit `.env`.

## Status

**Week 1 (Phase 0)** — git + frontend scaffold done; backend + CI in progress (Cletus).

Next: Phase 1 core loop — see [`docs/phase-1-tickets.md`](docs/phase-1-tickets.md).

## Long-Term Vision

We want Pigeon to become the default archive for over-the-board chess: every section, every board, every game—preserved, searchable, and useful for players, coaches, and tournament organizers worldwide.
