# Weekly todos

We track Week 1 (and future weeks) in JSON so either of us can mark tasks done from the terminal and see our own progress.

## Setup (once per laptop)

From the project root:

```bash
chmod +x scripts/done scripts/setup-shell.sh
./scripts/setup-shell.sh    # adds `pdone` to ~/.zshrc (Alex/Cletus: run once each)
exec zsh                      # reload shell
pdone who alex                # or: pdone who cletus
```

### Why `pdone` and not `done`?

In zsh and bash, `done` is a **reserved word** (it closes `for` loops). We can't use it as a command name without breaking shell syntax. Our alias is **`pdone`** (Pigeon done).

## Mark something complete

```bash
pdone git-init
pdone frontend-scaffold
pdone backend-scaffold
```

Partial names work if they're unique:

```bash
pdone git
pdone ci
```

Example output when Cletus finishes his first task:

```
✓ Scaffold FastAPI backend (hello world)
Cletus: 1/5 done
Alex: 0/5 done  |  Cletus: 1/5 done
```

When Alex finishes two:

```
✓ Initialize private git repo + GitHub remote
Alex: 2/5 done
Alex: 2/5 done  |  Cletus: 1/5 done
```

## See everything

```bash
pdone status
pdone list
```

Without the alias, use the script directly:

```bash
./scripts/done who alex
./scripts/done git-init
```

## Files

| File | Purpose |
|------|---------|
| `todos/week-01.json` | Week 1 tasks and done state |
| `todos/current.json` | Points to the active week file |
| `.pigeon-user` | Who this machine is (alex or cletus) — not committed |

We commit the JSON so both of us see the same checklist. When one of us marks a task, we pull, mark, push — same as any other project file.

## New week

1. Copy the previous week file (e.g. `week-01.json` → `week-02.json`).
2. Reset tasks for the new phase — see [`docs/phase-1-tickets.md`](../docs/phase-1-tickets.md) for Week 2+.
3. Update `todos/current.json` to `"week-02.json"`.
4. Both founders run `pdone status` after `git pull`.

| Week | File | Phase |
|------|------|-------|
| 1 | `week-01.json` | Phase 0 — Foundation |
| 2 | `week-02.json` | Phase 1 — Upload + OCR spike |
| 3+ | `week-03.json` … | Phase 1 continued → Phase 2 |
