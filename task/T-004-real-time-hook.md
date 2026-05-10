# T-004 — Real-time update hook (`hooks/useClock`)

Goal
- Provide a lightweight hook that emits current time on an interval suitable for the dashboard (1s or 1min).

Background
- The dashboard requires live updates for progress and earned amount.

Scope
- Create `hooks/useClock.ts` with optional `intervalMs` parameter; ensure cleanup and low CPU usage.

Requirements
- Works in browser only; safe no-op on SSR.

Acceptance Criteria
- Hook emits Date objects at requested cadence and cleans up on unmount.

Test Commands
- Manual integration verification with dashboard component.

Definition of Done
- Hook added and documented.
