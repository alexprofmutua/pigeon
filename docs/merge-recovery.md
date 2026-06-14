# Merge recovery — Alex + Cletus work

**Created:** after Cletus merged `backend_branch` to `main` on GitHub.

Your work is **not deleted**. It lives on branch `docs/week-1-alex-tasks` (and backup `backup/alex-docs-june13`).  
Cletus's work is on **`origin/main`** (backend + CI). Neither branch had the other's latest commits until we merge.

---

## Where everything lives

| Branch | Commit | What's in it |
|--------|--------|--------------|
| `docs/week-1-alex-tasks` | `dbaf33e` | **Alex:** phase-1 tickets, test-data protocol, week-02 todos, dev README, test-fixtures |
| `origin/main` | `1ea1084` | **Cletus:** full `backend/`, GitHub Actions CI, upload API, OCR mock, tests |
| `backup/alex-docs-june13` | same as Alex branch | Safety copy — do not delete |

---

## Alex-only files (yours)

These exist on your branch but **not** on `origin/main` yet:

- `docs/phase-1-tickets.md`
- `docs/test-data-protocol.md`
- `test-fixtures/README.md`, `test-fixtures/.gitkeep`
- `todos/week-02.json`
- Updated `README.md` (dev setup section)
- Updated `todos/week-01.json`, `todos/current.json`, `docs/todos.md`

---

## Cletus-only files (partner's)

These are on `origin/main` but **not** on your branch yet:

- `backend/` (FastAPI app, upload API, OCR mock, PGN validator, alembic, tests)
- `.github/workflows/ci.yml`
- `backend/storage/*.png` (test uploads — should probably be gitignored later)

---

## Why it felt like you "lost" code

If you checked out **`main`** and ran **`git pull`**, you only got Cletus's backend — not your docs branch (never merged to main).

If you merged on GitHub without merging your PR first, same result: main has backend, not your docs.

**Your branch still has your work.** Git keeps it until you delete the branch.

---

## Safe way to combine both (do this)

Do **not** merge blindly on `main` without a backup. Use this order:

```bash
cd /Users/alexprof/Projects/pigeon

# 1. You should already be on docs/week-1-alex-tasks with your work
git checkout docs/week-1-alex-tasks

# 2. Backup already exists:
#    backup/alex-docs-june13

# 3. Create integration branch
git checkout -b integrate/alex-plus-cletus

# 4. Pull Cletus's main INTO your branch (keeps your commits, adds backend)
git fetch origin
git merge origin/main

# 5. If README conflicts — keep BOTH sections (your dev setup + his backend commands)
#    Edit README.md, then:
#    git add README.md
#    git commit -m "Merge origin/main — combine Alex docs + Cletus backend"

# 6. Push integration branch
git push -u origin integrate/alex-plus-cletus

# 7. Open PR: integrate/alex-plus-cletus → main
#    Cletus reviews → merge
```

After that, `main` has **frontend + backend + your docs + week-02 todos**.

---

## If something still goes wrong

Recover Alex's work from backup:

```bash
git checkout backup/alex-docs-june13
```

Recover from reflog:

```bash
git reflog
git checkout dbaf33e   # your last docs commit
```

---

## After merge — update todos

Mark Cletus Week 1 tasks done on `todos/week-01.json` (he shipped backend + CI):

- `backend-scaffold` ✓
- `ci` ✓
- (check `stack-readme`, `env-example`, `github-access` against his PR)

Keep `todos/current.json` on `week-02.json` for Phase 1 work.

---

## Do not

- Force push `main`
- Delete `docs/week-1-alex-tasks` or `backup/alex-docs-june13` until merge is confirmed
- Commit real scoresheet PNGs from `backend/storage/` long term — move to gitignore in a follow-up PR
