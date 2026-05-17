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

- Files never touch: TODO
- Dangerous operations: TODO
- External side effects: TODO
- Secrets/config rules: TODO

## AI Collaboration Preferences

- Preferred output style: compact by default
- What requires confirmation: TODO
- What AI should avoid: TODO

## AI Runtime Project Design (PDGL) (v1)

<!-- PDGL:v1 START -->

### Project Identity

- Project Name: TODO
- One-line Summary: TODO
- Target Users: TODO
- Non-goals: TODO

### Product / Runtime Intent

- What problem does this project solve?: TODO
- What should AI optimize for?: TODO
- What must AI avoid?: TODO
- What is intentionally out of scope?: TODO

### Stack Decisions

- Language: TODO
- Framework: TODO
- Runtime: TODO
- Package Manager: TODO
- Database: TODO
- Deployment Environment: TODO

### Runtime Constraints

- Files never touch: TODO
- Dangerous operations: TODO
- Deployment boundaries: TODO
- Network restrictions: TODO
- Command restrictions: TODO
- MCP write policy: TODO

### Development Workflow

- Preferred workflow: TODO
- Testing strategy: TODO
- Definition of Done: TODO
- Required verification: TODO
- Snapshot expectations: TODO

### Architecture Notes

- Entry points: TODO
- Directory conventions: TODO
- Config sources: TODO
- Critical modules: TODO
- Shared abstractions: TODO

### Bootstrap Guidance

- Recommended scaffold: TODO
- Manual setup steps: TODO
- Human-required setup: TODO
- Secrets/config setup expectations: TODO

### AI Collaboration Rules

- How AI should propose changes: TODO
- How AI should ask for clarification: TODO
- Preferred output structure: TODO
- What requires confirmation: TODO
<!-- PDGL:v1 END -->

## Stable Human Context (SHC) (v1)

<!-- SHC:v1 START -->

### Project Goal

- TODO

### Target Users

- TODO

### Non-goals

- TODO

### Stack Decisions

- TODO

### Runtime Constraints

- TODO

### Directory Conventions

- TODO

### Config Sources

- TODO

### Testing Strategy

- TODO

### Release Constraints

- TODO

### Files Never Touch

- TODO

### Deployment Boundaries

- TODO
<!-- SHC:v1 END -->
