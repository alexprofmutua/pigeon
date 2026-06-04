# Why We Will Win

## One-Line Pitch

We are building Pigeon as the lifelong chess game archive: scan faster, save every game from every board—not just the top section—and grow from your own history with stats, replay, and coaching tools.

## The Problem We Solve Better Than Others

Existing scoresheet scanners (Chess Scanner, KnightVision, Score Sheet Scanner, CheSScan) focus on **one game at a time**. They help you digitize a sheet, but they do not become the place where your chess life lives.

Most tournament games are never recorded:

- Top boards sometimes get attention; **chessmat and lower-section games are forgotten**.
- Players enter one or two games on Chess.com or Lichess for analysis, but **not the full event**.
- FIDE and public databases mostly reflect rated sections, not every player's full tournament history.
- Handwritten scoresheets get lost; memories fade.

We win by being **the permanent home for every game you ever played**, organized by event, searchable, and useful long after the tournament ends.

## User Validation

I (Alex) spoke with **dozens of players and coaches** during planning. They consistently told us they need a product that saves **all** tournament games by event—not just top-board games or one-off scans. We log ongoing feedback in [`what_we_learned.md`](what_we_learned.md).

## Why Users Should Choose Us

### 1. Faster scanning workflow

- We optimize the full loop: photo → recognition → correction → save.
- Our target: noticeably shorter time from scoresheet to saved game than manual entry or clunky multi-step tools.
- Mobile capture with quick feedback; corrections focused on uncertain moves first.

### 2. Lifelong game library organized by event

- **NC Opens 2024** → all your games from that event.
- **NC Opens 2025** → all your games from that event.
- **Mombasa Opens**, club nights, school tournaments—each event is a folder in your history.
- Every game is preserved regardless of skill level or section.

### 3. Personal dashboard and analytics

- Total games played.
- Most played opening as White and as Black.
- Win percentage as White and as Black.
- Top competitor (most games played against, head-to-head score).
- Games won, longest winning streak, longest losing streak.
- Visual, welcoming design inspired by the clarity of Chess.com analysis—not a copy, but the same feeling of "I want to spend time here."

### 4. Coach workflow

- Students grant permission for a coach to view their games.
- Coach sees student games in their own account view.
- Star important games and leave comments for review.
- Built for coaches who want to track improvement across many events, not just one PGN file at a time.

### 5. Organizer bulk workflow

- After a round or tournament, organizers scan many scoresheets with a phone.
- Images sync to the organizer account on laptop/desktop.
- A second person (or the same person later) makes corrections using:
  - AI legality hints (flag illegal or ambiguous move sequences).
  - Human intuition where AI is uncertain.
- Designed for real tournament ops: fast capture on the floor, careful review at a desk.

### 6. Handwriting at every quality level

- Our goal: handle good handwriting, messy handwriting, and nearly illegible sheets.
- Human correction is always part of our product—not a failure mode.
- We improve recognition over time with consented training data from real scoresheets.

### 7. Replay and analysis in-app

- Step through moves on a board inside Pigeon.
- Optional temporary access to chess engines for position analysis (post-MVP enhancement).
- Export to PGN when users want to analyze elsewhere.

### 8. Zero-explanation UX

- If a user needs a manual to scan their first game, **we** have failed.
- Clear steps, friendly colors, forgiving error messages, and smart defaults.
- Private by default; sharing and coach access are explicit opt-in choices.

## What We Are Not Claiming on Day One

- Perfect OCR on every impossible sheet (we aim for it; correction is the safety net).
- Replacing Chess.com or Lichess for live play or global social features.
- FIDE official integration at launch.

We **are** claiming: the best place to **keep every game you played**, organized and useful for years.

## Competitive Summary

| Capability | Typical scanners | Pigeon |
|------------|------------------|--------|
| Single-game scan to PGN | Yes | Yes |
| Event-organized archive | Limited | **Core** |
| Personal stats dashboard | No | **Yes** |
| Coach review with comments | No | **Yes** |
| Organizer bulk + desktop review | No | **Yes** |
| Every-section player focus | No | **Yes** |
| In-app replay | Some | **Yes** |

## Success Metrics

We will track these from beta onward:

- **Scan time**: median minutes from photo to saved game.
- **Correction rate**: % of moves edited by the user.
- **Retention**: users who save games from 2+ events.
- **Archive depth**: average games saved per active user per tournament.
- **Coach adoption**: students linked per coach account.
- **Organizer throughput**: scoresheets processed per hour in bulk mode.
