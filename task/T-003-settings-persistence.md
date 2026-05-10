# T-003 — Settings persistence (`hooks/useSettings`)

Goal
- Implement a React hook to persist and restore user settings in `localStorage`.

Background
- Settings include start/end time, break minutes, salary type, salary amount, currency.

Scope
- Add `hooks/useSettings.ts` and TypeScript types. Provide defaults and simple validation.

Requirements
- Read/write to `localStorage`, expose `settings` and `updateSettings` API, and be safe in SSR contexts.

Acceptance Criteria
- Settings persist across page reloads and are typed.

Test Commands
- Manual UI verification; unit tests for serialization.

Definition of Done
- Hook implemented and documented in task file.
