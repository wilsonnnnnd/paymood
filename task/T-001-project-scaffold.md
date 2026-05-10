# T-001 — Project scaffold

Goal
- Initialize a frontend scaffold compatible with the PDGL: Next.js + TypeScript + Tailwind CSS.

Background
- PDGL/SHC specify a Next.js + TypeScript + Tailwind MVP. This task creates the minimal app structure and npm scripts required by downstream tasks.

Scope
- Add project files under `app/`, `pages/` placeholders, `tsconfig.json`, Tailwind config, and npm scripts. Do not perform remote pushes or create PRs.

Requirements
- `npm run dev`, `npm run build`, and `npm run lint` scripts present. Minimal placeholder `app/page.tsx` showing a dashboard placeholder.

Acceptance Criteria
- `app/page.tsx` exists and displays a placeholder message.
- `package.json` contains dev scripts for `dev`, `build`, `lint`, `test`.

Test Commands
- `npm run dev`
- `npm run build`

Definition of Done
- Files added, local scripts present, task marked done in registry.
