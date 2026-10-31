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

薪资设置：快速修改薪资类型和金额会合并保存；定时刷新不会覆盖正在编辑的输入框。收入按当前薪资和排班时间重新估算，重复保存不会额外增加一笔收入。

修改发薪日期会更新计算周期，Clear 会清除周期校准。重置设置会取消页面尚未发送的修改。

计时按刷新间隔分别计算编码与思考时间；开始打字前先结算此前的思考时间。刷新中断超过 20 秒的整段间隔不计入活动时间，以避免把休眠时间记为工作时间；该规则也会略去长时间卡顿期间的活动。

- **Coding time** — counted while a VS Code window is focused and you've made a text edit within the last ~90 seconds.
- **Thinking time** — counted while a window is focused but outside that recent-coding window. (Yes, planning counts.)

在 VS Code 内使用 Chat、Codex、Claude 面板或集成终端时，只要 VS Code 窗口保持焦点，时间就会继续计入工作时长（Coding time + Thinking time）。最近一次代码编辑后的约 90 秒归入 Coding time，其余归入 Thinking time；无需在 AI 工具里额外开启计时。切到外部网页或桌面应用后不计时。插件依据窗口焦点和代码编辑事件计时，不读取聊天内容，也不单独识别正在使用哪种 AI 工具。预估收入仍按薪资和排班计算，与活动时长分开。

- Both totals persist for the full local day and reset at midnight.
- Multi-window sync uses last-write-wins, so your totals stay consistent no matter how many windows you have open.

---

## 🛠️ Development

From the repo root:

```bash
pnpm install
pnpm --filter paymood build
```

Then open the repo in VS Code and run the **Run Extension** launch config to start an Extension Development Host.

- Entry point: `src/extension.ts`
- Storage helpers: `src/storage.ts`
- Build output: `dist/extension.js` (esbuild via `pnpm --filter paymood build`)
- Webview assets (CSS/JS): `media/`
- Webview security: strict CSP with nonce-based script loading

---

## 📝 Release notes

- **v0.1.10** — Clarified settings semantics: dashboard now explicitly labels settings as globally shared across workspaces.

- **v0.1.9** — `Coding today` and `Thinking today` now persist as full local-day totals and no longer reset when a window goes inactive or closes. Added `PayMood: Reset Today Activity` command.
