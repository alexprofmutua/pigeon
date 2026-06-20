# GitHub access checklist

Security baseline before we merge to `main` in production. **Cletus** owns this ticket; **Alex** (repo admin) completes the org/repo settings.

## Per person (both founders)

- [ ] **GitHub account** on the private `pigeon` repo with push access
- [ ] **Two-factor authentication (2FA)** enabled on GitHub ([settings](https://github.com/settings/security))
- [ ] **SSH or HTTPS** auth working locally (`git fetch`, `git push`)

## Repo admin (Alex)

- [ ] **Branch protection on `main`**
  - Require a pull request before merging
  - Require status checks to pass (CI workflow)
  - Do not allow force pushes
  - Optional: require review from the other founder
- [ ] Confirm **both founders** are collaborators with appropriate roles

## Verify locally

```bash
git remote -v
git fetch origin
git push origin HEAD   # on a feature branch, not main
```

When branch protection is on, direct pushes to `main` should fail and PRs should wait for green CI.
