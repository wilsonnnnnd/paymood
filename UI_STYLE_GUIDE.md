# PayMood — UI Style Guide

This document is the source of truth for the product UI system.
Use it before adding or changing visuals on both Dashboard and Settings pages.

## Product Universe

PayMood is one coherent "emotional productivity OS" with two views:

- Dashboard: live progress + earnings focus.
- Settings: calm system-control panel.

They must feel like the same product universe, not two separate themes.

## Brand Positioning

- Product name: `PayMood`
- Domain label: `paymood.work`
- Positioning: a calm workday companion that visualizes time flow and income growth.

## Product Intent

This product is intentionally not:

- a KPI tool
- an enterprise admin dashboard
- a dense analytics surface
- a game-centric UI

It should quietly reflect:

- time passing
- earned income progression
- remaining time to offwork

## Core Experience Principles

1. Time is the first signal

- Progress and remaining time are instantly readable.
- Secondary modules cannot compete with the ring + money center.

2. Numbers carry emotion

- Earnings should feel "alive" and gradually growing.
- Avoid accounting/table-like visual language.

3. Ambient motion, never flashy

- Breathing glow and soft fades are preferred.
- No jumpy, playful, or noisy transitions.

4. Sparse hierarchy

- Fewer surfaces, more intentional spacing.
- New UI must justify its existence.

## Unified Visual Language

### Layout

- Single centered shell as the core stage.
- Circular progress and money value remain the hero.
- Supporting metrics are compact and restrained.
- Controls and settings are service layers, not visual heroes.

### Shape and Density

- Rounded, soft geometry.
- Large radius for shells, medium radius for controls.
- Avoid grid-heavy dashboards, dense cards, complex charts.

## Theme Strategy

### Light mode (morning workspace)

- airy white glass surfaces
- cool daylight gradients
- soft ambient glow

### Dark mode (midnight workspace)

- deep navy background
- cool blue glow hierarchy
- sky-blue accent
- no amber as primary accent

Amber is reserved only for semantic warning states.

## Token System (Mandatory)

All component colors must come from CSS variables in `styles/globals.css`.
Do not hardcode brand colors in TSX components.

### Semantic token groups

- Surface: `--surface-base`, `--surface-raised`, `--surface-floating`, `--surface-overlay`
- Text: `--text-primary`, `--text-secondary`, `--text-muted`
- Border: `--border-ghost`, `--border-soft`, `--border-active`
- Glow: `--glow-ambient`, `--glow-accent`, `--glow-ring`, `--glow-focus`, `--glow-success`, `--glow-danger`, `--glow-warning`
- State: `--state-hover`, `--state-active`
- Motion: `--ease`, `--ease-spring`, `--dur`, `--dur-fast`, `--dur-slow`

### Compatibility aliases

Legacy aliases still exist (`--surface`, `--surface-strong`, `--border`, `--text`, `--muted`, `--focus`) but new styles should prefer semantic tokens above.

### Settings tokens

`--s-*` tokens are now semantic wrappers over the same shared token layer.
Do not add separate dark-mode-only `--s-*` override blocks unless there is a clear exception.

## Component Rules

### Shells and cards

- Use surface hierarchy:
  - base: everyday sections
  - raised: elevated controls / bubbles
  - floating: modals and top-layer panels
- Use ghost/soft borders instead of high-contrast lines.

### Ring and hero center

- Ring uses `--ring-track`, `--ring-ink`, `--ring-glow`.
- Keep the ring clean: no ticks, no chart overlays.
- Money readout remains center anchor.

### Interactive states

- pressed/selected states use `--state-active` + `--border-active`.
- hover states use `--state-hover`.
- avoid hardcoded yellow/orange state backgrounds.

### Pet UI (ambient layer)

- Mood tinting must use semantic glows (`--glow-warning`, `--glow-ambient`, `--glow-danger`, etc.).
- Bubble backgrounds and borders must use semantic surface/border tokens.
- No hardcoded amber utility classes for positive states.

## Typography

- Key numeric values use `var(--font-mono)`.
- Numeric alignment uses `font-variant-numeric: tabular-nums`.
- Label tone is calm and compact, not enterprise-reporting style.

## Motion and Accessibility

Allowed:

- slow breathing glow
- soft opacity/blur transitions
- restrained ambient looping

Avoid:

- bouncy spring-heavy UI motion as dominant behavior
- playful wobble animation language
- high-frequency micro-interaction noise

Accessibility:

- Respect `prefers-reduced-motion` for non-essential animation.

## Tailwind v4 Conventions

Use Tailwind v4 variable syntax for arbitrary values:

- Prefer `border-(--token)` over `border-[var(--token)]`
- Prefer `bg-(--token)` over `bg-[var(--token)]`
- Prefer utility scale equivalents (for example `max-w-70`) where available

## Copy Tone

- calm, supportive, human
- no productivity guilt or performance pressure language
- short and emotionally stable phrasing

## UI Change Checklist

- Uses semantic tokens from `styles/globals.css`
- Keeps Dashboard and Settings in one visual universe
- Preserves ring + money as dashboard primary hierarchy
- Uses blue-cool dark mode accenting (no amber primary accent)
- Maintains low-density, whitespace-first layout
- Motion is subtle and reduced-motion safe
- Copy remains supportive and non-judgmental
