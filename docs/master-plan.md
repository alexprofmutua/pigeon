# Pigeon Master Plan — Step 1 to Last

We work through these steps in order. This is our build plan from first commit to September ship.

**Start date:** Monday  
**Deadline:** End of September  
**Team:** Alex Mutua + Cletus Abumah, ~20 hrs/week each  
**Goal:** Functional app for real use + strong internship portfolio

**Owners in tables:** **Alex** = Alex Mutua · **Cletus** = Cletus Abumah

We track Week 1 tasks in `todos/week-01.json` — run `pdone <task-id>` when something is finished. See [`todos.md`](todos.md).

Work in order. We do not skip Phase 0. Parallel work inside a week is fine when dependencies allow.

---

## Phase 0 — Foundation (Week 1)

| Step | Task | Owner | Done when |
|------|------|-------|-----------|
| 0.1 | Initialize private git repo; create GitHub remote; protect `main` | Both | Repo live, both have access, 2FA on |
| 0.2 | **Stack decision:** Python backend (FastAPI) + web frontend (React/Vite) + SQLite/Postgres for dev | Both | Written in README with one-paragraph rationale |
| 0.3 | Scaffold `backend/` and `frontend/`; both run locally ("hello world") | Alex: frontend, Cletus: backend | `npm run dev` + `uvicorn` both work |
| 0.4 | Add `.env.example`, dev setup section in README, folder layout | Both | New clone runs in under 30 minutes |
| 0.5 | CI: lint + test on pull request (GitHub Actions) | Cletus lead, Alex review | Green check on a test PR |
| 0.6 | Create shared OCR test folder protocol (consent, no real names in repo) | Both | `docs/test-data-protocol.md` or section in privacy doc |
| 0.7 | Week 1 goal written in issues or project board | Alex | 5–10 tickets for Phase 1 |

**Exit criteria:** Repo exists, stack chosen, both apps boot, CI runs, team aligned on September scope (Phase A in `product-features.md`).

---

## Phase 1 — Core loop prototype (Weeks 2–4)

*Prove: one scoresheet → corrected moves → legal PGN.*

| Step | Task | Owner | Done when |
|------|------|-------|-----------|
| 1.1 | Image upload API: accept JPEG/PNG, size limit, safe storage path | Cletus | Postman/curl upload works |
| 1.2 | Upload UI: drag-drop + camera capture on mobile browser | Alex | Image reaches backend from browser |
| 1.3 | OCR spike: integrate one engine; return raw text + line breaks | Cletus | Sample image returns move text |
| 1.4 | Move parser: SAN/algebraic → structured move list | Cletus | Unit tests for common notation |
| 1.5 | Chess validation: python-chess (or equivalent); report first illegal move | Cletus | Invalid games flagged with index |
| 1.6 | Correction screen: move list, inline edit, image beside moves | Alex | User can fix OCR output |
| 1.7 | Uncertainty UI: highlight low-confidence OCR segments | Alex + Cletus | Uncertain moves visually distinct |
| 1.8 | PGN export endpoint + download button | Cletus | Valid `.pgn` downloads |
| 1.9 | Wire full flow in frontend | Alex | End-to-end demo without Postman |
| 1.10 | Manual test notes + 3 fixture scoresheets (synthetic/consented) | Both | Document in `docs/testing.md` |

**Exit criteria:** Demo video of one scoresheet → edit → export PGN.

---

## Phase 2 — Save, events, library (Weeks 5–7)

*Games persist and group by tournament.*

| Step | Task | Owner | Done when |
|------|------|-------|-----------|
| 2.1 | Database schema: users, events, games, images, PGN blob/path | Cletus | Migrations run cleanly |
| 2.2 | Event CRUD: create "NC Opens 2024", attach games | Cletus | API + tests |
| 2.3 | Save game flow: metadata form (event, round, players, result) | Alex | Game appears in DB after scan |
| 2.4 | Library UI: list events → list games in event | Alex | Browse saved games |
| 2.5 | Search: by player name, event, date, result | Cletus | Search API + UI filter |
| 2.6 | Replay board: step through moves from saved PGN | Alex | Board matches saved game |

**Exit criteria:** Multiple games from one event saved, browsed, replayed.

---

## Phase 3 — Accounts, security, dashboard v1 (Weeks 8–10)

*Real users, private libraries, internship-grade security story.*

| Step | Task | Owner | Done when |
|------|------|-------|-----------|
| 3.1 | User registration and login (email + password or OAuth later) | Cletus | Auth endpoints secured |
| 3.2 | Security baseline: HTTPS in prod, bcrypt passwords, JWT/session, rate limits | Alex | Checklist in `privacy-security.md` updated |
| 3.3 | Upload hardening: MIME check, rename files, max size, no public directory listing | Alex | Documented threat mitigations |
| 3.4 | Per-user game isolation; games private by default | Cletus | One account cannot see another's games |
| 3.5 | Dashboard v1: total games, wins/losses/draws, games as White vs Black | Alex + Cletus | Stats match saved data |
| 3.6 | Opening stats v1: most common opening as White and Black (simple classification) | Cletus | Shows top 1–3 openings |
| 3.7 | Deploy to staging (e.g. Railway, Fly.io, or VPS) | Both | Teammate can use from phone |

**Exit criteria:** Two accounts, each with private event libraries and working dashboard.

---

## Phase 4 — Polish, metrics, internship package (Weeks 11–13)

*Ship quality and proof for recruiters.*

| Step | Task | Owner | Done when |
|------|------|-------|-----------|
| 4.1 | UX pass: onboarding, empty states, error copy, color system | Alex | Non-chess friend completes one scan |
| 4.2 | OCR evaluation: 10+ test sheets, measure correction rate | Cletus | Metrics doc with numbers |
| 4.3 | Automated tests: parser, validation, PGN round-trip, auth | Cletus | CI coverage on critical paths |
| 4.4 | Performance: scan-to-save under target time on median sheet | Both | Record median in docs |
| 4.5 | README + architecture diagram + demo script | Both | Ready for resume link |
| 4.6 | User test: 3 real players at a club or tournament | Alex | Feedback notes in `docs/` |
| 4.7 | Competitor comparison: same scoresheets vs Chess Scanner / KnightVision | Both | Results in `what_we_learned.md` |

**Exit criteria:** Staging app used by real users; metrics and architecture documented.

---

## Phase 5 — Coach workflow (Weeks 14–15, stretch)

| Step | Task | Owner | Done when |
|------|------|-------|-----------|
| 5.1 | Coach role type on user account | Cletus | Role in DB |
| 5.2 | Student invites coach / grants view permission | Cletus | Permission table + API |
| 5.3 | Coach view: list permitted students' games | Alex | Read-only coach UI |
| 5.4 | Star game + comment on game | Alex + Cletus | Comments persist and display |

**Exit criteria:** One coach sees one student's games and leaves a comment.

---

## Phase 6 — Organizer bulk workflow (Weeks 16–17, stretch)

| Step | Task | Owner | Done when |
|------|------|-------|-----------|
| 6.1 | Bulk upload from phone (multi-select images) | Alex | 10+ images in one batch |
| 6.2 | Sync batch to organizer account on desktop | Cletus | Same login, images appear on laptop |
| 6.3 | Review queue UI: next game, correct, mark done | Alex | Queue drains correctly |
| 6.4 | AI legality hints in queue (flag illegal sequences) | Cletus | Hints show on suspicious moves |
| 6.5 | Batch export PGN zip for event | Cletus | Download all games for one event |

**Exit criteria:** Organizer scans on phone, reviews on laptop, exports event PGNs.

---

## Phase 7 — Dashboard full + engines (Post-September)

| Step | Task | Notes |
|------|------|-------|
| 7.1 | Top competitor stats | Head-to-head by opponent name |
| 7.2 | Winning/losing streaks | Computed from chronological results |
| 7.3 | Advanced opening analytics | Deeper classification |
| 7.4 | Optional Stockfish (or similar) analysis | Temporary in-app engine use |
| 7.5 | Mobile native apps | iOS/Android if web proves demand |
| 7.6 | Monetization experiments | After retention proof |

---

## Phase 8 — Private beta and launch prep (Post-September)

| Step | Task |
|------|------|
| 8.1 | Invite players, coaches, organizers |
| 8.2 | Track scan time, correction rate, retention |
| 8.3 | Privacy policy and data deletion flow |
| 8.4 | Fix top 5 workflow pain points from feedback |
| 8.5 | Decide incorporation, equity paperwork, and domain |

---

## Weekly rhythm (every Monday)

1. Pick **one** weekly goal from the phase above.
2. Split into 3–5 tickets assigned to Alex or Cletus.
3. Work on feature branches; PR review before merge.
4. Sunday demo (even if rough).
5. Log blockers in project channel + update ticket status.

---

## September minimum vs stretch

| Must ship by September | Stretch if ahead of schedule |
|------------------------|------------------------------|
| Upload → OCR → correct → validate → PGN | Coach stars and comments |
| Event-grouped library + search | Full bulk organizer queue |
| User accounts + security basics | All dashboard stats |
| Dashboard v1 + replay | Engine analysis |
| Staging deploy + 3 user tests | Native mobile app |

---

## First week checklist (start Monday)

- [ ] 0.1 Git repo + GitHub
- [ ] 0.2 Stack written down
- [ ] 0.3 Backend + frontend scaffold
- [ ] 0.4 Dev setup documented
- [ ] 0.5 CI pipeline
- [ ] Read `differentiation.md`, `product-features.md`, `team-and-equity.md`
- [ ] Schedule weekly Sunday demo time

**Next step after Week 1:** Step 1.1 — image upload API.
