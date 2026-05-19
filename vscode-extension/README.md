# paymood (VS Code extension)

Status bar work progress + earnings, with a webview settings dashboard.

## Development

From the repo root:

```bash
cd vscode-extension
npm install
npm run build
```

Then in VS Code:

- Open this repo
- Run the `Run Extension` launch config (or start an Extension Development Host pointing to `vscode-extension/`)

## Commands

- `paymood: Open Dashboard`
- `paymood: Toggle Status Bar`
- `paymood: Reset Settings`

## Webview notes

- Webview CSS and JavaScript live in `media/` and are loaded with `webview.asWebviewUri(...)`.
- The webview panel limits `localResourceRoots` to `media/`.
- The HTML uses a strict Content Security Policy with nonce-based script loading.
- UI state that should survive webview reloads is saved with `vscode.getState()` / `vscode.setState()`.
