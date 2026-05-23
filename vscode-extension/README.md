# PayMood (VS Code extension)

Status bar work progress + earnings, with a webview settings dashboard.

## Runtime behavior

- `Coding today` tracks a full-day total across VS Code windows on the same machine and survives window close/reopen during the same day.
- `Thinking today` tracks a full-day focused-but-not-coding total and also survives window close/reopen during the same day.
- Coding time is counted while a VS Code window is focused and within about 90 seconds of a text edit.
- Thinking time is counted while a VS Code window is focused but outside that recent-coding window.
- A window is treated as active when it has reported heartbeat updates recently (about the last 20 seconds).
- Multi-window timer state (`start` / `pause` / `end`) auto-syncs using last-write-wins.
- Status bar tooltip shows both `Coding today` and `Thinking today`.

## Quick start

From the repo root:

1. Install dependencies:

```bash
cd vscode-extension
npm install
```

2. Build the extension:

```bash
npm run build
```

3. Run in VS Code:

- Open the repo in VS Code
- Run the `Run Extension` launch config (or start an Extension Development Host pointing to `vscode-extension/`)

## Commands

- `paymood: Open Dashboard` — Open the settings dashboard webview
- `paymood: Toggle Status Bar` — Show/hide the status bar
- `paymood: Reset Today Activity` — Reset today's `Coding today` and `Thinking today` totals after confirmation
- `paymood: Reset Settings` — Reset all settings to defaults

## Development notes

- Extension entry point: `src/extension.ts`
- Storage helpers: `src/storage.ts`
- Build output: `dist/extension.js` (esbuild bundle)
- Before publishing, run `npm run build` from `vscode-extension/` so the extension bundle reflects the latest TypeScript source.
- Webview media: CSS and JavaScript live in `media/` and are loaded with `webview.asWebviewUri(...)`
- Webview security: strict Content Security Policy with nonce-based script loading
- Webview state: UI state that should survive reloads is saved with `vscode.getState()` / `vscode.setState()`
- Resource roots: webview `localResourceRoots` is limited to `media/`

## Full-day activity verification

- Close a VS Code window after accumulating coding/thinking time; today's totals should remain visible in another window or after reopening the dashboard.
- Restart the extension host on the same local day; today's totals should restore from persisted daily activity state.
- Move to a new local day; `Coding today` and `Thinking today` should start from zero.
- Upgrade from legacy `paymood.codingTime.v1` state; same-day coding time should seed the new daily activity state.

## Release notes

- `Coding today` and `Thinking today` now persist as full local-day totals instead of disappearing when a VS Code window becomes inactive or closes.
- Added `PayMood: Reset Today Activity` for clearing today's activity totals after confirmation.
