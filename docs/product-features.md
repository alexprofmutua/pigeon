# Our Product Features

Features we are building, grouped by user type and delivery phase. **September target** = functional core for internships and real tournament use with human correction expected.

---

## Core Promise (All Users)

Photo or scan → recognized moves → quick correction → legal chess → saved forever → searchable, replayable, exportable.

---

## Player Features

### Scanning and saving

- Upload or capture scoresheet photos (camera or gallery).
- OCR extraction with uncertainty markers on low-confidence moves.
- Correction screen: edit moves with original image visible.
- Chess legality validation with clear break points and repair hints.
- Save game with metadata: event, site, date, round, White, Black, result.
- Export valid games as `.pgn`.

### Event-organized library

- Games grouped by tournament/event (e.g. NC Opens 2024, Mombasa Opens).
- Browse all games from an event in one place.
- Search by player, date, event, result, opening.
- Lifetime archive: every game from every section, not just top boards.

### Personal dashboard

- Total games played.
- Most played opening as White and as Black.
- Win percentage as White and as Black.
- Top competitor (most games vs. same opponent, head-to-head record).
- Games won (total and over time).
- Longest winning streak.
- Longest losing streak.
- Welcoming visual design; stats that encourage return visits.

### Replay and analysis

- In-app board replay move by move.
- *(Later)* Temporary engine analysis for positions (not required for September MVP).

---

## Coach Features

### Access and permissions

- Coach account type.
- Student grants permission for coach to view their games.
- Coach sees permitted student games inside their own account.
- Students keep ownership of their data; coach access is revocable.

### Review tools

- Star games worth revisiting.
- Leave comments on specific games for student feedback.
- Filter by student, event, or date.
- *(Later)* Assign review tasks or tagged lesson plans.

---

## Organizer Features

### Bulk capture

- Scan many scoresheets with phone after a round or tournament end.
- Batch upload with progress indicator.
- Images appear on organizer account on laptop/desktop (synced workflow).

### Review queue

- Second reviewer (or same user on desktop) corrects moves.
- AI legality hints flag suspicious or illegal sequences.
- Human reviewer confirms or overrides.
- Assign games to players where possible.
- Batch PGN export for an event.

### Event management

- Create event folders (name, date, location).
- *(Later)* CSV import for player lists and pairing cross-check.

---

## Platform and UX

### Design

- Welcoming color palette and clear typography.
- Chess.com-analysis-level polish as a **feel** target: users enjoy staying in the app.
- Mobile-friendly capture; desktop-friendly review and dashboard.

### Usability

- No manual required for first scan.
- Obvious next step at every screen.
- Forgiving errors (bad photo, illegal game, OCR failure) with recovery paths.

### Privacy and security

- Games private by default.
- Explicit sharing for coaches and exports.
- Secure uploads, auth, and permission checks (see `privacy-security.md`).
- No secrets or real user data in the repository.

---

## Feature Phases

### Phase A — September target (resume-ready, functional)

1. Image upload and local/cloud storage.
2. OCR with uncertainty flags.
3. Correction UI with image side-by-side.
4. Chess validation and PGN export.
5. Save games with event metadata.
6. Event-grouped library and basic search.
7. Basic dashboard (total games, win/loss counts, simple opening stats).
8. In-app board replay.
9. User accounts and authentication.
10. Basic security: HTTPS, upload limits, file type checks, env-based secrets.

### Phase B — Post-September (differentiation)

1. Full dashboard (streaks, top competitor, opening breakdowns).
2. Coach accounts, student permissions, stars, comments.
3. Organizer bulk upload and review queue.
4. AI legality hints in review workflow.
5. Improved OCR across handwriting quality levels.
6. Optional engine analysis (temporary use).

### Phase C — Growth (bonus / business)

1. Mobile apps (iOS/Android).
2. Cloud sync polish and offline capture.
3. Subscriptions or organizer pricing.
4. Lichess/Chess.com export integrations.
5. FIDE or federation-adjacent exports (if demand exists).

---

## Non-Goals (Still)

- Public social network or feed.
- Live online chess play.
- Replacing FIDE rating systems.
- Promising 100% OCR accuracy without human review.
