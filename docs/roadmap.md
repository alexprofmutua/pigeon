# Pigeon Roadmap

Our high-level phases, aligned with `master-plan.md`. Detailed steps live in the master plan.

## Phase 0: Project Setup (Week 1)

- Private git repository and GitHub remote.
- Planning documents (this folder).
- Stack decision: FastAPI + React/Vite + SQL database.
- Scaffold backend and frontend.
- CI on pull requests.
- Team roles, equity, and weekly rhythm documented.

## Phase 1: Core Loop Prototype (Weeks 2–4)

**Goal:** One scoresheet → corrected moves → legal PGN.

- Upload image.
- OCR extraction with uncertainty flags.
- Correction UI with image visible.
- Chess validation and PGN export.
- End-to-end wired demo.

## Phase 2: Archive (Weeks 5–7)

**Goal:** Games persist and organize by event.

- Database for users, events, games.
- Event folders (NC Opens 2024, etc.).
- Library browse and search.
- In-app board replay.

## Phase 3: Accounts and Dashboard (Weeks 8–10)

**Goal:** Real users with private libraries and stats.

- Authentication and per-user isolation.
- Security baseline (upload hardening, secrets, HTTPS).
- Dashboard v1: totals, win rates, opening stats.
- Staging deployment.

## Phase 4: Ship Quality (Weeks 11–13)

**Goal:** Internship-ready proof.

- UX polish and onboarding.
- OCR evaluation metrics on test set.
- Automated tests on critical paths.
- Real user testing (3+ players).
- Architecture docs and demo script.

## Phase 5: Coach Workflow (Weeks 14–15, stretch)

**Goal:** Coaches review student games with permission.

- Coach role and student grants.
- Star games and comments.

## Phase 6: Organizer Bulk (Weeks 16–17, stretch)

**Goal:** Phone bulk scan → laptop review → batch export.

- Multi-image upload.
- Review queue with AI legality hints.
- Event batch PGN export.

## Phase 7: Full Analytics and Engines (Post-September)

- Streaks, top competitor, advanced openings.
- Optional in-app engine analysis.
- Native mobile apps if web validates demand.

## Phase 8: Private Beta and Growth (Post-September)

- Invite players, coaches, organizers.
- Measure scan time, correction rate, retention.
- Privacy policy, deletion flow, monetization experiments.

---

## September Target

A **functional, deployed** app that:

- Saves every game from a tournament into event folders.
- Shows basic personal stats and replay.
- Works for real users with human correction.
- Tells a clear story on internship resumes.

**Primary success:** engineering depth + shippable product.  
**Secondary success:** revenue after adoption.

---

## Document Index

See [`README.md`](README.md) in this folder for the full index and reading order.

| File | What it covers |
|------|----------------|
| [`master-plan.md`](master-plan.md) | **Main plan** — every step, week by week |
| [`differentiation.md`](differentiation.md) | Why Pigeon wins (archive, dashboard, coaches, organizers) |
| [`product-features.md`](product-features.md) | Full feature list by player / coach / organizer |
| [`team-and-equity.md`](team-and-equity.md) | Alex / Cletus roles, 60/40 split, internship goals |
| [`vision.md`](vision.md) | Expanded mission (every board, not just top sections) |
| [`mvp-spec.md`](mvp-spec.md) | September must-haves vs stretch vs post-September |
| [`roadmap.md`](roadmap.md) | High-level phases + doc index |
| [`team-workflow.md`](team-workflow.md) | Git, PRs, weekly rhythm, role split |
| [`todos.md`](todos.md) | Weekly JSON todos + `pdone` command |
| [`privacy-security.md`](privacy-security.md) | Our security rules from day one |
| [`what_we_learned.md`](what_we_learned.md) | Weekly log — accomplishments and lessons |
| [`wireframes.md`](wireframes.md) | Screen layout sketches with examples |
| [`ocr-strategy.md`](ocr-strategy.md) | Our OCR engine choice and evaluation plan |
