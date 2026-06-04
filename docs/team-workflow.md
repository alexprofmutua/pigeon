# Team Workflow

## How We Work

We run Pigeon like a serious product from day one. Each of us owns clear areas, hits weekly goals, and ships visible progress. Our primary outcome: **internship-grade skills and a functional app by September**. Revenue comes after the product works.

See [`team-and-equity.md`](team-and-equity.md) for equity, hours, and roles.

## Us

| Name | Equity | Focus |
|------|--------|-------|
| **Alex Mutua** | 60% | Product, frontend, security, user testing |
| **Cletus Abumah** | 40% | Backend, OCR, database, tests, CI |

## Ownership

### Alex (~60%)

- Product direction and priorities (I originated the idea and app vision).
- Frontend: upload, correction screen, library, dashboard, replay UI.
- Security: auth hardening, upload safety, secrets, permission checks.
- User testing and feedback collection.
- Backend support where Cletus needs it.

### Cletus (~40%)

- Backend lead: API, database, chess logic, PGN, OCR pipeline.
- OCR integration and accuracy experiments (`ocr-strategy.md`).
- Automated tests on parser, validation, and API.
- DevOps support: CI, deployment.

We both review each other's pull requests and can demo the full app.

## Git Workflow

- `main` stays stable and deployable.
- All work on feature branches (`feat/upload-api`, `feat/correction-ui`).
- Pull requests describe **what** and **why**.
- At least one of us reviews before merge.
- We never commit secrets, `.env`, API keys, or real private scoresheets.

## Weekly Rhythm

| Day | What we do |
|-----|------------|
| **Monday** | Set weekly goal from `master-plan.md`; create 3–5 tickets; sync `todos/week-XX.json` |
| **Mon–Sat** | Work on branches; post blockers same day; `pdone <task>` when finished |
| **Sunday** | Demo progress; update [`what_we_learned.md`](what_we_learned.md) |

~20 hours per week each. We communicate early if school deadlines reduce capacity.

## Definition of Done

We call a feature done when:

- It works locally (and on staging when applicable).
- Basic tests or manual test notes exist.
- We've considered privacy and security.
- The other founder can use it without a walkthrough.
- It is merged via reviewed pull request.

## Communication

- Day-to-day: private project channel.
- Decisions and specs: `docs/` in this repository.
- We don't scatter architecture or equity decisions across casual chat only.

## Internship Narrative

Each of us maintains a short write-up (update monthly):

- What we built technically.
- One hard problem we solved.
- Metrics or user feedback we can cite.
- Link to staging demo or architecture doc.

We pull weekly bullets from `what_we_learned.md`.
