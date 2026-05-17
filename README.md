# PayMood (paymood.work)

PayMood is a browser-first, calm dashboard for everyday workers: workday progress + earned income progress + a soft “salary mood”.

Quick start

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npx next dev
```

3. Run tests:

```bash
npx vitest --run
```

Notes

- The UI is in `app/page.tsx` and components live in `components/`.
- Calculation helpers are in `lib/earnings.ts` and have unit tests.
- Settings persist to `localStorage` via `hooks/useSettings.ts`.
- UI style guide: `UI_STYLE_GUIDE.md` (read before adding new UI).
