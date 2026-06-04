# Team, Equity, and Goals

## Founders

| Name | Role | Equity |
|------|------|--------|
| **Alex Mutua** | Founder, product originator | **60%** |
| **Cletus Abumah** | Co-founder, developer | **40%** |

We're both Computer Science freshmen. Our primary goal: **build internship-grade engineering skills and a shippable product**. Revenue is a bonus after the product works and people use it.

**Product origin:** I (Alex) came up with the Pigeon idea, product vision, and app concept/images. Cletus joined as co-founder and developer to build it with me.

## Equity Split

| Founder | Equity | Rationale |
|---------|--------|-----------|
| **Alex Mutua** | **60%** | Original plan, product vision, and app concept |
| **Cletus Abumah** | **40%** | Co-founder and engineering partner |

We will reflect this split in any future incorporation documents. We revisit it only by mutual written agreement.

## Time Commitment

- **~20 hours per week each** (~40 hours/week combined).
- We set a weekly goal every Monday and demo progress every Sunday.
- Academic deadlines take priority; we communicate blockers early.
- We log weekly learnings in [`what_we_learned.md`](what_we_learned.md).
- We track tasks in [`todos/week-01.json`](../todos/week-01.json) with `pdone`.

## Skills and Ownership

We're both **proficient in Python**.

| Area | Primary owner | Notes |
|------|---------------|-------|
| **Product direction** | Alex | Vision, priorities, user feedback |
| **Frontend** | Alex | UI, correction screen, dashboard, replay |
| **Backend / API** | Both (Cletus lead) | Upload, OCR pipeline, chess engine, PGN, DB |
| **Security** | Alex | Auth, permissions, upload safety, secrets hygiene; summer cybersecurity marathon practice |
| **OCR experiments** | Cletus (Alex supports UI) | Integration, accuracy testing — see `ocr-strategy.md` |
| **Database design** | Cletus | Schema for games, events, users, coach links |
| **DevOps / CI** | Shared | Git, tests, deploy pipeline |

I carry more surface area (frontend + security + product). Cletus focuses depth on backend, data, and OCR pipeline. We both review all pull requests.

## User Validation

Before we write code, I spoke with **dozens of players and coaches**. They consistently told us they need a product that saves all their tournament games by event—not just top-board games or one-off scans. We log ongoing feedback in `what_we_learned.md`.

## Learning Goals (Internship Focus)

What we want recruiters at Microsoft, Meta, and similar programs to see:

- End-to-end system design (mobile/web → API → DB → export).
- Measurable OCR/validation quality (test set, metrics, write-up).
- Authentication and permission model (player / coach / organizer roles).
- Clean git history, tests, CI, and readable documentation.
- User-facing product with real tournament feedback.

## September Deadline

**Target: end of September**

We will deliver a **functional** product that:

- Scans scoresheets through to saved, validated games.
- Organizes games by event.
- Shows a basic dashboard and replay.
- Supports user accounts with solid security basics.
- We can describe confidently on resumes and in internship interviews.

Coach bulk workflow, full dashboard stats, and engine analysis may spill into Phase B if needed—but the core loop and archive story must work.

## Communication

- Private project channel for day-to-day chat.
- Important decisions live in `docs/` (this repo), not lost in DMs.
- Weekly notes: what shipped, what's blocked, next week's goal → `what_we_learned.md`.

## Definition of Done

We call a feature done when:

- It works locally (and on staging when applicable).
- Basic tests or manual test notes exist.
- We've considered privacy and security implications.
- The other founder can demo it without explanation.
- It is merged via pull request with review.
