# PayMood

PayMood is a calm workday progress and estimated earnings dashboard for everyday
workers. It runs as a browser-first Next.js app and also includes a VS Code
extension dashboard/status bar experience.

## What It Does

- Shows today's work progress, remaining time, and estimated earnings so far.
- Shows this week's and this month's estimated earned totals.
- Stores schedule, pay, currency, color mode, and pet settings locally.
- Includes a small desktop pet that wanders, reacts to work state, pauses on
  hover, and moves toward empty-page clicks without hijacking cards or controls.
- Provides a VS Code extension that reuses the same schedule/pay calculations.

PayMood is intentionally simple. It is not payroll software, tax advice, HR
software, or a source of official pay records.

## Calculation Model

Core calculations live in `lib/earnings.ts`.

The website, pet UI, and VS Code extension all use the shared
`calculateWorkEarnings()` entry point for:

- today's earned amount
- workday progress
- remaining work time
- this week's earned total
- this month's earned total
- normalized hourly rate

For monthly salary, the monthly total uses the current calendar month's actual
scheduled work hours. A full completed work month should add up to the entered
monthly salary, instead of using a fixed average month such as `52 / 12` weeks.

## Project Structure

- `app/` - Next.js App Router pages.
- `components/` - dashboard, settings, legal pages, and pet UI.
- `hooks/` - browser state, clock, settings, and pet behavior hooks.
- `lib/` - shared calculation, settings, and pet mood/message logic.
- `styles/` - global styles and design tokens.
- `test/` - Vitest coverage for calculation helpers and pet mood rules.
- `vscode-extension/` - PayMood VS Code extension source and webview assets.

## Quick Start

Install dependencies:

```bash
npm install
```

Run the website locally:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Build the website:

```bash
npm run build
```

## AdSense Deployment Switch

AdSense is disabled by default. Enable it only for overseas deployments.

- `NEXT_PUBLIC_ADSENSE_ENABLED=true` to enable AdSense rendering.
- `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT` and `NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT` must also be set.
- If `NEXT_PUBLIC_ADSENSE_ENABLED` is missing or not `true`, no AdSense script or meta tag is injected.

## VS Code Extension

The extension lives in `vscode-extension/` and imports shared project code from
`lib/`.

Useful commands:

```bash
cd vscode-extension
npm install
npm run typecheck
npm run build
npm test
```

## Development Notes

- Read `AGENTS.md` and `.aidw/AI_project.md` before making AI-assisted changes.
- Reuse existing components, hooks, utilities, and design tokens first.
- Keep calculation changes in shared helpers so the website and VS Code
  extension stay consistent.
- Read `UI_STYLE_GUIDE.md` before adding or changing UI.
