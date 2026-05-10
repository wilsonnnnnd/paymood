# T-009 — Build & deployment validation

Goal
- Verify `npm run build` completes and the app is deployable to static hosts (Vercel).

Background
- Ensure no SSR errors and static assets are emitted correctly.

Scope
- Run `npm run build` and fix obvious build-time issues in code/config.

Requirements
- Build exits with code 0 and produces `.next` (or build artifacts).

Acceptance Criteria
- `npm run build` completes successfully locally.

Test Commands
- `npm run build`

Definition of Done
- Build validated and notes added to README.
