# Cozy Earnings Dashboard (MVP)

This repository contains an in-repo prototype of a browser-first dashboard that shows today’s work progress and estimated earnings.

Quick start

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

3. Run tests:

```bash
npm run test
```

Notes
- The UI is in `app/page.tsx` and components live in `components/`.
- Calculation helpers are in `lib/earnings.ts` and have unit tests.
- Settings persist to `localStorage` via `hooks/useSettings.ts`.
- UI style guide: `UI_STYLE_GUIDE.md` (read before adding new UI).
