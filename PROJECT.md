# Project Brief

Human-owned project context for AI coding tools.

Edit this file directly. repo-context-kit reads it during `scan` and summarizes it into `.aidw/AI_project.md`.

## Project Purpose

- Build PayMood (paymood.work): a calm, cozy workday progress + earned income progress dashboard with subtle “salary mood”.

## Tech Stack

- Language: TypeScript
- Framework: Next.js (App Router)
- Runtime: Browser-first (no backend)
- Package manager: npm
- Database: None (localStorage for settings)
- Deployment: Static-compatible Next.js deploy (e.g. Vercel)

## Product / Domain Requirements

- Show work time progress, remaining time, and estimated earned amount based on user schedule and pay settings.
- Keep UI calm, ambient, soft; Apple-like breathing motion; avoid enterprise dashboard tone.
- Not a game, not a pet-raising product, not an enterprise admin or finance tool.
- China-friendly: avoid Google fonts/analytics and fragile external resources.

## Architecture Notes

- Entry points: `app/page.tsx` (dashboard), `app/settings/page.tsx` (settings)
- Important directories: `components/`, `hooks/`, `lib/`, `styles/`
- Shared abstractions: pure calculation helpers in `lib/`, persistent settings in `hooks/useSettings.ts`
- Integration boundaries: no external APIs; local-only persistence

## Development Requirements

- Testing strategy: vitest for calculation helpers and critical UI logic; keep build green.
- Definition of done: user can set schedule/pay and see live progress + earned amount; design matches PayMood direction.
- Review expectations: keep changes minimal, tokenized, responsive, accessible, production-ready.

## Safety / Boundaries

- Files never touch without explicit scope: `.env*`, deployment config, release workflows, generated build output, and third-party asset files.
- Dangerous operations: destructive filesystem commands, dependency changes, deployment changes, and broad generated-file rewrites require explicit confirmation.
- External side effects: do not add network calls, analytics, external APIs, or remote persistence unless the task explicitly expands the local-first model.
- Secrets/config rules: keep salary settings local-only; never expose env values, tokens, or private user data.

## AI Collaboration Preferences

- Preferred output style: compact by default
- What requires confirmation: implementation tasks, test/build runs when gated, dependency changes, generated context refreshes, and protected-area edits.
- What AI should avoid: unrelated refactors, enterprise dashboard tone, pet-raising/game mechanics, fragile external resources, and manual edits to generated context when a scan can refresh it.

## AI Runtime Project Design (PDGL) (v1)

<!-- PDGL:v1 START -->

### Project Identity

- Project Name: PayMood
- One-line Summary: A calm workday progress and earned-income dashboard for personal salary awareness.
- Target Users: Individual workers who want a cozy, local-only view of work time, remaining time, and estimated earned income.
- Non-goals: Payroll accounting, tax/legal/finance advice, enterprise admin reporting, task management, pet raising, game progression, or remote data sync.

### Product / Runtime Intent

- What problem does this project solve?: It helps users feel the workday moving by turning their schedule and salary settings into live progress and estimated earnings.
- What should AI optimize for?: Trustworthy calculations, calm ambient UI, local-first privacy, responsive interaction, accessibility, and minimal product-scope drift.
- What must AI avoid?: Changing salary semantics casually, adding external dependencies/APIs, cluttering the dashboard, or turning the product into an enterprise finance tool or pet game.
- What is intentionally out of scope?: Real payroll integration, public holiday data from external providers, analytics tracking, cloud accounts, notifications, and multi-user collaboration.

### Stack Decisions

- Language: TypeScript
- Framework: Next.js App Router with React
- Runtime: Browser-first static-compatible web app
- Package Manager: npm
- Database: None; settings persist in localStorage
- Deployment Environment: Static-compatible Next.js hosting such as Vercel

### Runtime Constraints

- Files never touch: `.env*`, release workflow files, deployment config, generated build output, and third-party image assets unless explicitly scoped.
- Dangerous operations: no destructive filesystem or git operations without direct confirmation.
- Deployment boundaries: keep deploy output static-compatible and do not introduce server/database requirements.
- Network restrictions: avoid Google fonts/analytics and fragile external resources; no new runtime API dependency without explicit scope.
- Command restrictions: prefer `rck scan`, `rck scan --check`, `npm test`, `npm run lint`, and `npm run build` as relevant verification commands.
- MCP write policy: read connectors/resources when helpful; write through MCP or external systems only with explicit user confirmation.

### Development Workflow

- Preferred workflow: read project context, draft task for clear implementation requests, wait for confirmation, implement the smallest safe change, then verify.
- Testing strategy: Vitest for calculation helpers and critical UI logic; lint/build for broader UI or routing changes.
- Definition of Done: changed behavior matches the task, settings and earnings remain correct, UI stays responsive/accessibile, and verification is reported.
- Required verification: run the task's agreed command; for context maintenance run `rck scan` then `rck scan --check`.
- Snapshot expectations: if `PROJECT.md` or repo structure changes, refresh `.aidw` generated context before final reporting.

### Architecture Notes

- Entry points: `app/page.tsx` for dashboard and `app/settings/page.tsx` for settings.
- Directory conventions: `components/` for UI, `components/ui/` for primitives, `hooks/` for client state, `lib/` for pure helpers, `styles/` for global tokens and HUD styling.
- Config sources: localStorage via `hooks/useSettings.ts`; public ad flags through `NEXT_PUBLIC_*` env values.
- Critical modules: `lib/earnings.ts`, `lib/settingsModel.ts`, `hooks/useSettings.ts`, `components/Dashboard.tsx`, and pet mood/message modules under `lib/pet/` and `content/pet/`.
- Shared abstractions: keep earnings calculations in pure `lib/` helpers and reuse settings/pet routing rather than duplicating logic across surfaces.

### Bootstrap Guidance

- Recommended scaffold: use the existing Next.js app structure; do not re-scaffold.
- Manual setup steps: install dependencies with npm, run the app with `npm run dev`, and verify calculations with `npm test`.
- Human-required setup: optional AdSense public env values and deployment settings are provided by the project owner.
- Secrets/config setup expectations: keep env files private; runtime salary data remains in browser localStorage only.

### AI Collaboration Rules

- How AI should propose changes: keep tasks compact with Goal, Scope, Requirements, Acceptance Criteria, Test Command, and Definition of Done.
- How AI should ask for clarification: ask only focused boundary questions when scope is vague or protected areas are involved.
- Preferred output structure: compact Chinese-facing explanation by default, with paths/commands/flags kept literal.
- What requires confirmation: file edits, dependency changes, generated context refreshes, tests/builds when gated, external side effects, and destructive operations.
<!-- PDGL:v1 END -->

## Stable Human Context (SHC) (v1)

<!-- SHC:v1 START -->

### Project Goal

- PayMood helps a person see workday progress, remaining time, and estimated earned income in a calm local-first dashboard.

### Target Users

- Individual workers and developers who want salary-progress awareness without enterprise reporting or cloud accounts.

### Non-goals

- Not payroll, accounting, tax/legal guidance, task tracking, employee monitoring, pet raising, or a game.

### Stack Decisions

- TypeScript, React, Next.js App Router, npm, Tailwind/PostCSS styling, Vitest, localStorage persistence, static-compatible deployment.

### Runtime Constraints

- Browser-first, local-only settings, no backend/database requirement, no fragile external runtime resources, and no new network dependency without explicit scope.

### Directory Conventions

- `app/` contains routes, `components/` contains feature UI, `components/ui/` contains primitives, `hooks/` contains client state hooks, `lib/` contains pure logic, `styles/` contains shared visual system, and `test/` contains regression coverage.

### Config Sources

- `hooks/useSettings.ts` reads/writes browser localStorage; `lib/settingsModel.ts` owns defaults and sanitization; public ad configuration uses `NEXT_PUBLIC_*` env values.

### Testing Strategy

- Use Vitest for earnings and pet logic; use lint/build when routing, UI composition, or shared components change.

### Release Constraints

- Keep the app static-compatible and China-friendly; do not introduce server-only runtime requirements or analytics/fonts that depend on fragile external resources.

### Files Never Touch

- Do not touch `.env*`, deployment/release workflows, generated build output, or third-party asset files unless the current task explicitly includes them.

### Deployment Boundaries

- Deployment may rely on public env flags for optional ads, but salary/settings data must stay client-side and private.
<!-- SHC:v1 END -->
