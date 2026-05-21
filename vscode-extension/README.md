# PayMood (VS Code extension)

Status bar work progress + earnings, with a webview settings dashboard.

## Runtime behavior

- `Coding today` is aggregated across all active VS Code windows on the same machine.
- `Thinking today` tracks focused-but-not-coding time and is also aggregated across active windows.
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
- `paymood: Reset Settings` — Reset all settings to defaults

## Development notes

- Extension entry point: `src/extension.ts`
- Build output: `dist/extension.js` (esbuild bundle)
- Webview media: CSS and JavaScript live in `media/` and are loaded with `webview.asWebviewUri(...)`
- Webview security: strict Content Security Policy with nonce-based script loading
- Webview state: UI state that should survive reloads is saved with `vscode.getState()` / `vscode.setState()`
- Resource roots: webview `localResourceRoots` is limited to `media/`
