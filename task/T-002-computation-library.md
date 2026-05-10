# T-002 — Computation library (`lib/earnings`)

Goal
- Implement pure calculation helpers for time normalization, work progress percentage, and earned amount across salary types.

Background
- Calculation functions must be deterministic and unit-testable; downstream UI will consume them.

Scope
- Create `lib/earnings.ts` with functions: `normalizeSalary`, `workProgress`, `earnedSoFar`.
- Add unit tests exercising hourly, daily, weekly, fortnightly, monthly, and annual salaries and break handling.

Requirements
- Pure functions, TypeScript types, and test coverage for edge cases (before start, after end, zero-length day, large breaks).

Acceptance Criteria
- `lib/earnings.ts` exports the functions and tests pass locally.

Test Commands
- `npm run test`

Definition of Done
- Library added, tests covering core cases, task marked done.
