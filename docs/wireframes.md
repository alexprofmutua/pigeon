# Wireframes

## What is a wireframe?

A **wireframe** is a **simple sketch of a screen** — boxes, labels, and arrows — showing **where things go** before you write code or pick colors.

It is **not**:

- A finished design
- Working software
- A logo or branding exercise

It **is**:

- A blueprint for layout and user flow
- A way for us to agree on layout and test ideas with users quickly
- Cheap to change (paper, Excalidraw, Figma, or even ASCII in a doc)

**Why we use them:** We promise “zero explanation UX.” Wireframes force us to decide: What does the user see first? What do they tap next? Where is the scoresheet image while they edit moves?

---

## Example: Correction screen (core Pigeon flow)

After OCR runs, the user fixes wrong moves while looking at their scoresheet photo.  
Below is a **low-fidelity wireframe** — the kind you could draw on paper in 10 minutes.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back          Correct moves          NC Opens 2024 · Round 3         │
├──────────────────────────────┬──────────────────────────────────────────┤
│                              │                                          │
│   SCORESHEET IMAGE           │   MOVES                                  │
│   ┌────────────────────┐     │                                          │
│   │                    │     │   White: Alex          Black: Opponent    │
│   │  [ photo of paper  │     │   Result: [ 1-0 ▼ ]                      │
│   │   scoresheet here ]│     │                                          │
│   │                    │     │   1. e4      e5                          │
│   │  pinch to zoom     │     │   2. Nf3     Nc6                         │
│   │                    │     │   3. Bb5  ⚠ a6    ← yellow = uncertain   │
│   └────────────────────┘     │   4. Ba4     Nf6                         │
│                              │   5. O-O     Be7                         │
│                              │   ...                                      │
│                              │   [ + Add move ]                           │
│                              │                                          │
│                              │   ✓ All moves legal                      │
│                              │   (or: ✗ Illegal at move 12 — fix below) │
├──────────────────────────────┴──────────────────────────────────────────┤
│              [ Save to library ]     [ Export PGN ]                     │
└─────────────────────────────────────────────────────────────────────────┘
```

**What this wireframe decides:**

| Element | Purpose |
|---------|---------|
| Image on left, moves on right | User compares paper to extracted text |
| ⚠ on move 3 | Uncertain OCR — user checks that move first |
| Metadata at top of move list | Event, round, players, result before save |
| Validation message at bottom | Chess engine feedback before export |
| Two primary buttons | Save (archive) vs download (PGN) |

---

## Example: Event library (archive home)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Pigeon          Library          Dashboard          [ Upload + ]     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   MY EVENTS                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  📁  NC Opens 2025          9 games    Last played: Jun 1     │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  📁  NC Opens 2024          7 games    Last played: Mar 2024    │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  📁  Mombasa Opens 2024     5 games                             │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   [ + New event ]                                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

Tap an event → list of games → tap a game → replay or re-export PGN.

---

## Example: Upload flow (first screen)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Scan a scoresheet                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                    ┌─────────────────────────┐                          │
│                    │                         │                          │
│                    │    📷  Take photo       │                          │
│                    │                         │                          │
│                    └─────────────────────────┘                          │
│                                                                         │
│                    or drag & drop image here                            │
│                                                                         │
│                    Event: [ NC Opens 2025 ▼ ]  [ + New ]                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tools you can use

| Tool | Cost | Best for |
|------|------|----------|
| Paper + phone photo | Free | Fastest; tournament hallway feedback |
| [Excalidraw](https://excalidraw.com) | Free | Simple boxes online; share link with Cletus |
| Figma | Free tier | Polished mockups later |
| This doc (ASCII) | Free | Version-controlled wireframes in git |

---

## Our next steps

1. Cletus and I review these three screens and agree on layout.
2. We show the correction screen sketch to 2–3 players — ask: “Would you know what to do?”
3. When we build Phase 1, we match the React UI to the correction wireframe first (highest-risk screen).

We update this file when layouts change and link major UX decisions in `what_we_learned.md` each week.
