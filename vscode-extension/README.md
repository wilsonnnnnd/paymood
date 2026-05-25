# 💰 PayMood — Know What Your Coding Time Is Worth

> Ever wonder how much money you've made while fixing that one annoying bug? Now you'll know.

**PayMood** turns your VS Code status bar into a real-time earnings ticker. Set your hourly rate, hit the timer, and watch your income grow — one keystroke at a time.

---

## ✨ What it does

- **💵 Live earnings** — See your running total right in the status bar as you code.
- **⏱️ Smart time tracking** — Separately tracks _Coding_ time (active edits) and _Thinking_ time (focused but not typing), because staring at the screen counts too.
- **📊 Dashboard** — Open the PayMood panel to see today's breakdown: time spent, money earned, and your settings at a glance.
- **🌐 Shared preferences** — Schedule/pay settings are saved globally and shared across your workspaces.
- **🔄 Persists across windows** — Close a window, open another — your daily totals stay intact until midnight.
- **🪟 Multi-window aware** — Running multiple VS Code windows? PayMood syncs timer state automatically.

---

## 🚀 Quick start

1. Install the extension from the VS Code Marketplace.
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run **PayMood: Open Dashboard**.
3. Enter your hourly rate and work hours, then start the timer.
4. Watch the money roll in. 🤑

---

## 🎮 Commands

| Command                         | What it does                           |
| ------------------------------- | -------------------------------------- |
| `PayMood: Open Dashboard`       | Open the earnings & settings panel     |
| `PayMood: Toggle Status Bar`    | Show or hide the status bar ticker     |
| `PayMood: Reset Today Activity` | Clear today's coding & thinking totals |
| `PayMood: Reset Settings`       | Restore all settings to defaults       |

---

## 🧠 How time tracking works

- **Coding time** — counted while a VS Code window is focused and you've made a text edit within the last ~90 seconds.
- **Thinking time** — counted while a window is focused but outside that recent-coding window. (Yes, planning counts.)
- Both totals persist for the full local day and reset at midnight.
- Multi-window sync uses last-write-wins, so your totals stay consistent no matter how many windows you have open.

---

## 🛠️ Development

From the repo root:

```bash
cd vscode-extension
npm install
npm run build
```

Then open the repo in VS Code and run the **Run Extension** launch config to start an Extension Development Host.

- Entry point: `src/extension.ts`
- Storage helpers: `src/storage.ts`
- Build output: `dist/extension.js` (esbuild via `npm run build`)
- Webview assets (CSS/JS): `media/`
- Webview security: strict CSP with nonce-based script loading

---

## 📝 Release notes

- **v0.1.10** — Clarified settings semantics: dashboard now explicitly labels settings as globally shared across workspaces.

- **v0.1.9** — `Coding today` and `Thinking today` now persist as full local-day totals and no longer reset when a window goes inactive or closes. Added `PayMood: Reset Today Activity` command.
