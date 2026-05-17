# PayMood — UI Style Guide

This document is the source of truth for the product’s UI direction. Read this before adding new UI or changing visuals.

## Brand

- Product name: `PayMood`
- Domain label: `paymood.work`
- Positioning: a calm workday progress + earned income progress dashboard with a soft “salary mood”.

## Product Intent

This is a “salary mood dashboard” for everyday workers.

- Not a KPI tool.
- Not an enterprise dashboard.
- Not an admin system.
- Not a dense analytics product.
- Not a game.
- Not a pet-raising product.

The UI should feel like a calm digital companion that quietly reflects:

- time passing
- money earned so far
- time remaining until finish

## Core Principles

1. Time is the main character

   - Progress and remaining time must be immediately legible.
   - Avoid secondary widgets that compete with the core readout.

2. Numbers must have emotion

   - Money should feel like it’s “growing” rather than being “reported”.
   - Avoid accounting-style layouts, tables, and heavy dividers.

3. The page should feel alive (ambient, not flashy)

   - Use subtle breathing / glow / slow fades.
   - Prefer gentle, constant motion over reactive bouncy transitions.

4. Extreme focus and whitespace
   - Fewer surfaces, fewer labels, bigger hierarchy gaps.
   - If a new feature adds UI, it must earn its place.

## Visual Language

### Layout

- Centered single view, “hangable” like a widget.
- Primary focus is a large circular progress ring with a centered readout.
- Secondary info uses a simple vertical stack (Remaining / Week / Month / Rate).
- Controls live at the bottom as a light control strip.

### Shapes

- Round and soft, but not playful.
- Prefer large radius for main container and medium radius for controls.

### Density

- Avoid multi-column dashboards, card grids, or many boxed sections.
- No complex charts.

## Color & Theme

### Non-negotiables

- No enterprise “dashboard” palettes.
- No harsh neon, no RGB glow, no cyberpunk.
- Dark theme must stay calm and airy, not heavy “tech black”.

### Token System

All colors must come from CSS variables in `styles/globals.css`. Do not hardcode new colors in components.

- Background gradients are subtle and soft.
- Glass surfaces are translucent with blur.
- Borders are light, low-contrast.
- Rings use a calm cyan/blue ink with a softer glow layer.

### Light Theme Targets

- ultra soft white background
- cool daylight gradient
- ambient light (subtle, slow)
- minimal glass (avoid strong glassmorphism)

### Dark Theme Targets

- dim, calm background
- soft cyan accent
- muted warm glow as secondary

## Typography

### Numbers

- Use mono font for key numbers: `var(--font-mono)`.
- Use tabular numerals for alignment: `font-variant-numeric: tabular-nums`.
- Money is huge; everything else is smaller and calmer.

### Labels

- Small, uppercase, airy tracking.
- Emotion-first copy; avoid “business dashboard” tone.

## Motion

### Allowed

- breathing animation (slow)
- ambient glow / soft light movement
- slow fades

### Not allowed

- spring animation
- overshoot / bounce
- playful wobble

### Accessibility

- Must respect `prefers-reduced-motion` by disabling non-essential animation.

## Components

### Circular Progress Ring

- Large circle, calm track + ink stroke, soft glow behind ink.
- The ring is the hero; it should frame the money readout.
- Keep it minimal: no tick marks, no charts, no extra labels on the ring.

### Money Readout

- Centered inside the ring.
- Large mono number with gentle “alive” breathing.
- Currency is smaller, subdued, and aligned to the number.

### Metrics (Remaining / Week / Month / Rate)

- Simple stacked lines or a minimal list.
- Use light glass surface; no “metric cards” grid feeling.
- Avoid heavy separators and strong borders.

### Controls

- Feels like a compact control strip, not a settings panel.
- Inputs are translucent, softly bordered, mono numerals.
- Avoid exposing too many controls; prefer the minimum required.

## Copy Tone

- Calm, supportive, human.
- Never imply pressure, productivity guilt, KPI, or performance evaluation.
- Short phrases. Low drama. Friendly.

## Adding New UI: Checklist

- Uses existing tokens and CSS variables (no new hardcoded colors)
- Keeps the page single-focus (does not turn into a multi-panel dashboard)
- Maintains big money + ring as the primary hierarchy
- Adds minimal text, preserves whitespace
- Motion is subtle and respects reduced-motion
- Copy stays supportive and non-judgmental
- Dark and light themes both look coherent
