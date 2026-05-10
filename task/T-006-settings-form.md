# T-006 — Settings Form UI

Goal
- Implement a user-friendly settings form for schedule and pay inputs.

Background
- The settings form allows users to configure start/end times, break minutes and salary.

Scope
- Create `components/SettingsForm.tsx` with time inputs, numeric inputs, and select for salary type.

Requirements
- Validate inputs, show inline errors, and call `updateSettings` from `useSettings`.

Acceptance Criteria
- Form saves valid settings and shows helpful errors for invalid values.

Test Commands
- Manual form interaction in dev server.

Definition of Done
- Form implemented and integrated with dashboard settings UI.
