# T-010 — Branch & PR preparation

Goal
- Prepare a local branch containing all changes, with clear commit messages and a PR description ready for creation (user chose no PR creation).

Background
- The user requested all changes be made but no Pull Request created.

Scope
- Create a branch locally, commit changes in logical units, and prepare a PR template file `PR.md` under the repo root.

Requirements
- Commits separated by task; `PR.md` contains summary, changed files, and verification steps.

Acceptance Criteria
- Local branch and commits present; `PR.md` created. No remote push or PR created.

Test Commands
- `git status` / `git log` to review commits; `gh` or GitHub web UI to create PR manually if desired.

Definition of Done
- Branch and commits prepared locally, `PR.md` created, task marked done.
