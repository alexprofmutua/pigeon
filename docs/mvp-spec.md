# Pigeon MVP Spec

## MVP Goal

We are building a functional first version by **end of September** that proves the full loop and our **archive story**:

image → recognized moves → human correction → legal chess → saved by event → searchable → dashboard stats → replay → export PGN.

Human correction is expected. Our OCR improves over time; the product must still be usable on messy handwriting from day one.

---

## September Must-Haves (Phase A)

These are what we must ship for a resume-ready, real-world demo.

### 1. Image upload

- Accept scoresheet photos or scans (camera + file upload).
- Restrict file types and size; store securely outside public paths.

### 2. OCR extraction

- Extract move text from the image.
- Mark uncertain text; never pretend perfect recognition.
- Target: faster time-to-first-draft than manual typing.

### 3. Move correction screen

- Show extracted moves editable inline.
- Original image visible for comparison.
- Highlight uncertain moves first.

### 4. Chess validation

- Validate moves with a rules engine.
- Show where the move list breaks.
- Help the user repair invalid notation.

### 5. PGN export

- Export valid games as `.pgn`.
- Include event, site, date, round, White, Black, and result.

### 6. Event-organized game library

- Create events (e.g. NC Opens 2024).
- Save games under events.
- Search by player, date, event, and result.

### 7. Dashboard v1

- Total games played.
- Wins / losses / draws.
- Win rate as White and as Black (basic).
- Most played opening as White and Black (simple classification).

### 8. In-app replay

- Step through moves on a board from saved games.

### 9. User accounts and security basics

- Registration and login.
- Games private to the account by default.
- Secure password storage, HTTPS in deployment, upload hardening.

---

## September Stretch (Phase B — if ahead of schedule)

- Full dashboard: streaks, top competitor, richer opening stats.
- Coach accounts: student permission, star games, comments.
- Organizer bulk upload + desktop review queue + AI legality hints.
- Improved OCR on poor handwriting (iterative, measured on test set).

---

## Post-September (Phase C)

- Optional chess engine analysis in-app.
- Native mobile apps (iOS/Android).
- Cloud sync polish and offline capture.
- Lichess/Chess.com export integrations.
- Subscriptions or organizer pricing.
- FIDE-adjacent or federation export formats if demand exists.

---

## Non-Goals for September

- Perfect handwriting on every impossible sheet.
- Public social network or player feed.
- Live online chess.
- FIDE official integration.
- App store launch.
- Paid subscriptions at launch.

These remain on the roadmap after the archive and core loop prove value.

---

## Success Criteria for September

- [ ] Two founders can scan, correct, save, and replay a game from a real scoresheet.
- [ ] Games grouped by at least two events in the library.
- [ ] Dashboard shows accurate counts from saved games.
- [ ] Staging deployment accessible from phone and laptop.
- [ ] Three external users complete a scan without written instructions.
- [ ] Documented OCR correction rate on 10+ test scoresheets.
- [ ] Both founders can explain architecture and tradeoffs in an interview.

See `master-plan.md` for step-by-step build order.
