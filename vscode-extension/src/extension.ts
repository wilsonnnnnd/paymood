import * as vscode from 'vscode'
import {
  earnedSoFar,
  earnedSoFarThisMonth,
  earnedSoFarThisWeek,
  getWorkWindowForNow,
  workProgress,
} from '../../lib/earnings'
import { currencySymbols } from '../../lib/settings'
import { defaultSettings, sanitizeSettings, type Settings } from '../../lib/settingsModel'

const SETTINGS_KEY = 'paymood.settings.v1'
const STATUS_VISIBLE_KEY = 'paymood.statusBar.visible.v1'
const CODING_TIME_KEY = 'paymood.codingTime.v1'
const CODING_ACTIVE_WINDOW_MS = 90_000

type Snapshot = {
  settings: Settings
  now: string
  statusVisible: boolean
  codingTodaySeconds: number
  codingSessionSeconds: number
  isWorkDay: boolean
  percent: number
  earned: number
  hourly: number
  remainingSeconds: number
  weekEarned: number
  monthEarned: number
}

type WebviewIncomingMessage =
  | { type: 'ready' }
  | { type: 'patchSettings'; patch?: unknown }
  | { type: 'toggleStatusBar' }
  | { type: 'resetSettings' }
  | { type: string; [key: string]: unknown }

type CodingTimeState = {
  day: string
  milliseconds: number
}

const WEBVIEW_ALLOWED_SETTING_KEYS = new Set<keyof Settings>([
  'startTime',
  'endTime',
  'breakMinutes',
  'workDays',
  'salaryType',
  'salaryAmount',
  'currency',
])

function currencyCodeToSymbol(code: string | undefined) {
  const normalized = (code ?? '').trim().toUpperCase()
  const key = normalized as keyof typeof currencySymbols
  if (key in currencySymbols) return currencySymbols[key]
  return '$'
}

function formatStatus(snapshot: Snapshot) {
  const currency = currencyCodeToSymbol(snapshot.settings.currency)
  const percentText = `${Math.max(0, Math.min(100, snapshot.percent))}%`
  const moneyText = Number.isFinite(snapshot.earned) ? snapshot.earned.toFixed(2) : '0.00'
  return `${percentText} ${currency}${moneyText}`
}

function readSettings(context: vscode.ExtensionContext) {
  const raw = context.globalState.get<unknown>(SETTINGS_KEY)
  if (!raw) return defaultSettings
  return sanitizeSettings(raw)
}

async function writeSettings(context: vscode.ExtensionContext, next: Settings) {
  await context.globalState.update(SETTINGS_KEY, next)
}

function computeSnapshot(
  now: Date,
  settings: Settings,
  statusVisible: boolean,
  codingTodayMs: number,
  codingSessionMs: number,
): Snapshot {
  const workDaysPerWeek = settings.workDays?.length ? settings.workDays.length : 5
  const { start, end } = getWorkWindowForNow(now, settings.startTime, settings.endTime)
  const isWorkDay = settings.workDays?.includes(start.getDay()) ?? true

  const prog = isWorkDay ? workProgress(now, start, end, settings.breakMinutes) : undefined
  const day = earnedSoFar(now, start, end, settings.breakMinutes, settings.salaryAmount, settings.salaryType, {
    workDaysPerWeek,
  })

  const earned = isWorkDay ? day.earned : 0
  const percent = isWorkDay ? Math.round((prog?.progress ?? 0) * 100) : 0
  const remainingSeconds = isWorkDay ? prog?.remainingSeconds ?? 0 : 0

  const week = earnedSoFarThisWeek(now, {
    startTime: settings.startTime,
    endTime: settings.endTime,
    breakMinutes: settings.breakMinutes,
    workDays: settings.workDays,
    salaryAmount: settings.salaryAmount,
    salaryType: settings.salaryType,
    opts: { workDaysPerWeek },
  })
  const month = earnedSoFarThisMonth(now, {
    startTime: settings.startTime,
    endTime: settings.endTime,
    breakMinutes: settings.breakMinutes,
    workDays: settings.workDays,
    salaryAmount: settings.salaryAmount,
    salaryType: settings.salaryType,
    opts: { workDaysPerWeek },
  })

  return {
    settings,
    now: now.toISOString(),
    statusVisible,
    codingTodaySeconds: Math.floor(Math.max(0, codingTodayMs) / 1000),
    codingSessionSeconds: Math.floor(Math.max(0, codingSessionMs) / 1000),
    isWorkDay,
    percent,
    earned,
    hourly: day.hourly,
    remainingSeconds,
    weekEarned: week.earned,
    monthEarned: month.earned,
  }
}

function formatHM(seconds: number) {
  const totalMinutes = Math.max(0, Math.floor(seconds / 60))
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
}

function getLocalDayKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function readCodingTime(context: vscode.ExtensionContext, now: Date): CodingTimeState {
  const today = getLocalDayKey(now)
  const raw = context.globalState.get<unknown>(CODING_TIME_KEY)
  if (!raw || typeof raw !== 'object') return { day: today, milliseconds: 0 }

  const saved = raw as Partial<CodingTimeState>
  if (saved.day !== today || typeof saved.milliseconds !== 'number' || !Number.isFinite(saved.milliseconds)) {
    return { day: today, milliseconds: 0 }
  }

  return { day: today, milliseconds: Math.max(0, saved.milliseconds) }
}

function createNonce() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let value = ''
  for (let i = 0; i < 32; i++) value += chars.charAt(Math.floor(Math.random() * chars.length))
  return value
}

function pickSettingsPatch(raw: unknown): Partial<Settings> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}

  const patch: Partial<Settings> = {}
  for (const [key, value] of Object.entries(raw)) {
    const settingKey = key as keyof Settings
    if (WEBVIEW_ALLOWED_SETTING_KEYS.has(settingKey)) {
      ;(patch as Record<string, unknown>)[key] = value
    }
  }

  return patch
}

function getWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri, nonce: string) {
  const stylesheetUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'dashboard.css'))
  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'dashboard.js'))
  const csp = [
    `default-src 'none'`,
    `img-src ${webview.cspSource}`,
    `style-src ${webview.cspSource}`,
    `script-src 'nonce-${nonce}'`,
    `font-src ${webview.cspSource}`,
  ].join('; ')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>paymood</title>
    <link rel="stylesheet" href="${stylesheetUri}" />
  </head>
  <body>
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true"></div>
        <div>
          <h1>paymood</h1>
          <div class="sub">VS Code work meter</div>
        </div>
      </div>
      <div class="actions" aria-label="Dashboard actions">
        <button class="ghost-button" id="statusToggle" type="button">Status bar</button>
        <button class="ghost-button danger" id="resetSettings" type="button">Reset</button>
      </div>
    </header>

    <main class="shell">
      <section class="workspace" aria-label="Earnings summary">
        <div class="panel-kicker">
          <span>Live shift</span>
          <span id="progressPill">-</span>
        </div>

        <div class="earnings-block">
          <div>
            <div class="eyebrow">Earned today</div>
            <div class="amount" id="earnedText">-</div>
          </div>
        </div>

        <div class="progress-cluster">
          <div class="progress" aria-label="Workday progress">
            <div id="progressBar"></div>
          </div>
          <div class="status-grid">
            <div>
              <div class="k">Remaining</div>
              <div class="status-value" id="remainingPill">-</div>
            </div>
            <div>
              <div class="k">Hourly rate</div>
              <div class="status-value" id="hourlyPill">-</div>
            </div>
          </div>
        </div>

        <div class="insights-grid" aria-label="Work metrics">
          <div class="metric">
            <div class="k">This week</div>
            <div class="v" id="weekText">-</div>
          </div>
          <div class="metric">
            <div class="k">This month</div>
            <div class="v" id="monthText">-</div>
          </div>
          <div class="metric">
            <div class="k">Coding today</div>
            <div class="v" id="codingTodayText">-</div>
          </div>
          <div class="metric">
            <div class="k">This session</div>
            <div class="v" id="codingSessionText">-</div>
          </div>
        </div>
      </section>

      <section class="settings-panel" aria-label="Settings">
        <div class="section-heading">
          <h2>Settings</h2>
          <span>Auto-saved</span>
        </div>

        <div class="settings-grid">
          <div class="settings-group">
            <div class="group-title">Work schedule</div>
            <div class="field-grid two-col">
              <div class="field">
                <label for="startTime">Start</label>
                <input id="startTime" type="time" step="60" />
              </div>

              <div class="field">
                <label for="endTime">End</label>
                <input id="endTime" type="time" step="60" />
              </div>
            </div>

            <div class="field">
              <label for="breakMinutes">Break</label>
              <input id="breakMinutes" type="number" min="0" max="1440" step="5" />
            </div>

            <div class="field">
              <label>Work days</label>
              <div class="days" id="workDays"></div>
            </div>
          </div>

          <div class="settings-group">
            <div class="group-title">Pay model</div>
            <div class="field-grid two-col">
              <div class="field">
                <label for="salaryType">Type</label>
                <select id="salaryType">
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="monthly">Monthly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>

              <div class="field">
                <label for="currency">Currency</label>
                <select id="currency">
                  <option value="AUD">AUD</option>
                  <option value="CNY">CNY</option>
                </select>
              </div>
            </div>

            <div class="field">
              <label for="salaryAmount">Amount</label>
              <input id="salaryAmount" type="number" min="0" step="0.01" />
            </div>
          </div>
        </div>
      </section>
    </main>

    <script nonce="${nonce}" src="${scriptUri}"></script>
  </body>
</html>`
}

export function activate(context: vscode.ExtensionContext) {
  const savedStatusVisible = context.globalState.get<boolean>(STATUS_VISIBLE_KEY)
  let statusVisible = typeof savedStatusVisible === 'boolean' ? savedStatusVisible : true
  let codingToday = readCodingTime(context, new Date())
  let codingSessionMs = 0
  let lastCodingTickMs = Date.now()
  let codingActiveUntilMs = 0

  let statusItem: vscode.StatusBarItem | null = null
  let panel: vscode.WebviewPanel | null = null
  let timer: NodeJS.Timeout | null = null

  const persistCodingTime = () => {
    void context.globalState.update(CODING_TIME_KEY, codingToday)
  }

  const collectCodingTime = () => {
    const now = new Date()
    const today = getLocalDayKey(now)
    if (codingToday.day !== today) codingToday = { day: today, milliseconds: 0 }

    const nowMs = now.getTime()
    const activeThroughMs = Math.min(nowMs, codingActiveUntilMs)
    if (activeThroughMs > lastCodingTickMs) {
      const deltaMs = activeThroughMs - lastCodingTickMs
      codingToday.milliseconds += deltaMs
      codingSessionMs += deltaMs
      persistCodingTime()
    }

    lastCodingTickMs = nowMs
  }

  const markCodingActivity = () => {
    const nowMs = Date.now()
    if (nowMs > codingActiveUntilMs) lastCodingTickMs = nowMs
    codingActiveUntilMs = nowMs + CODING_ACTIVE_WINDOW_MS
    refresh()
  }

  const ensureStatusBar = () => {
    if (!statusItem) {
      statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
      statusItem.command = 'paymood.openDashboard'
      statusItem.name = 'paymood'
      context.subscriptions.push(statusItem)
    }

    if (statusVisible) statusItem.show()
    else statusItem.hide()
  }

  const postSnapshotToWebview = (snapshot: Snapshot) => {
    if (!panel) return
    void panel.webview.postMessage({
      type: 'snapshot',
      snapshot: {
        ...snapshot,
        remainingHuman: formatHM(snapshot.remainingSeconds),
      },
    })
  }

  const refresh = () => {
    collectCodingTime()
    const settings = readSettings(context)
    const now = new Date()
    const snapshot = computeSnapshot(now, settings, statusVisible, codingToday.milliseconds, codingSessionMs)
    ensureStatusBar()
    if (statusItem) {
      statusItem.text = `$(pulse) ${formatStatus(snapshot)}`
      statusItem.tooltip = `Work progress\n${snapshot.percent}% - ${currencyCodeToSymbol(settings.currency)}${snapshot.earned.toFixed(
        2,
      )}\nRemaining ${formatHM(snapshot.remainingSeconds)}`
    }
    postSnapshotToWebview(snapshot)
  }

  const openDashboard = () => {
    if (panel) {
      panel.reveal(panel.viewColumn ?? vscode.ViewColumn.One)
      refresh()
      return
    }

    panel = vscode.window.createWebviewPanel('paymoodDashboard', 'paymood', vscode.ViewColumn.One, {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')],
    })

    const nonce = createNonce()
    const panelDisposables: vscode.Disposable[] = []
    panel.webview.html = getWebviewHtml(panel.webview, context.extensionUri, nonce)

    panel.webview.onDidReceiveMessage(
      async (message: WebviewIncomingMessage) => {
        if (!message || typeof message !== 'object' || typeof message.type !== 'string') return

        switch (message.type) {
          case 'ready':
            refresh()
            return
          case 'patchSettings': {
            const patch = pickSettingsPatch(message.patch)
            if (Object.keys(patch).length === 0) return
            const current = readSettings(context)
            const next = sanitizeSettings({ ...current, ...patch })
            await writeSettings(context, next)
            refresh()
            return
          }
          case 'toggleStatusBar':
            await toggleStatusBar()
            refresh()
            return
          case 'resetSettings':
            await resetSettings()
            return
          default:
            console.warn(`paymood webview ignored unknown message: ${message.type}`)
        }
      },
      undefined,
      panelDisposables,
    )

    panel.onDidDispose(
      () => {
        panelDisposables.forEach((disposable) => disposable.dispose())
        panel = null
      },
      undefined,
      context.subscriptions,
    )

    refresh()
  }

  const toggleStatusBar = async () => {
    statusVisible = !statusVisible
    await context.globalState.update(STATUS_VISIBLE_KEY, statusVisible)
    ensureStatusBar()
  }

  const resetSettings = async () => {
    await writeSettings(context, defaultSettings)
    refresh()
  }

  context.subscriptions.push(vscode.commands.registerCommand('paymood.openDashboard', openDashboard))
  context.subscriptions.push(vscode.commands.registerCommand('paymood.toggleStatusBar', toggleStatusBar))
  context.subscriptions.push(vscode.commands.registerCommand('paymood.resetSettings', resetSettings))
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(markCodingActivity))

  ensureStatusBar()
  refresh()

  timer = setInterval(refresh, 30_000)
  context.subscriptions.push({
    dispose: () => {
      if (timer) clearInterval(timer)
    },
  })
}

export function deactivate() {}
