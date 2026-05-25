import * as vscode from 'vscode'
import { randomUUID } from 'crypto'
import { calculateWorkEarnings, getWorkWindowForNow } from '../../lib/earnings'
import { currencySymbols } from '../../lib/settings'
import { defaultSettings, sanitizeSettings, type Settings } from '../../lib/settingsModel'
import {
  addDailyActivity,
  cleanupRuntimeState,
  countActiveWindows,
  getLocalDayKey,
  persistRuntimeState as persistRuntimeStateToStore,
  readDailyActivity,
  readRuntimeState,
  readSettings,
  readStatusVisible,
  resetDailyActivity,
  sanitizeWindowRuntimeState,
  writeSettings,
  writeStatusVisible,
  type RuntimeState,
  type TimerStatus,
  type WindowRuntimeState,
} from './storage'

const CODING_ACTIVE_WINDOW_MS = 90_000
const RUNTIME_HEARTBEAT_MS = 5_000

type Snapshot = {
  settings: Settings
  now: string
  statusVisible: boolean
  codingTodaySeconds: number
  thinkingTodaySeconds: number
  codingSessionSeconds: number
  timerStatus: TimerStatus
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
  | { type: 'resetTodayActivity' }
  | { type: 'resetSettings' }
  | { type: string; [key: string]: unknown }

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
  const salarySet = Number.isFinite(snapshot.settings.salaryAmount) && snapshot.settings.salaryAmount > 0
  if (!salarySet) return '$(gear) Set pay'
  if (!snapshot.isWorkDay) return '$(coffee) Off today'

  const now = new Date(snapshot.now)
  const { start, end } = getWorkWindowForNow(now, snapshot.settings.startTime, snapshot.settings.endTime)
  if (now < start) return `$(clock) Starts ${snapshot.settings.startTime}`
  if (now >= end) return `$(check) Done · ${currency}${moneyText}`
  return `$(pulse) ${percentText} · ${currency}${moneyText}`
}

function computeSnapshot(
  now: Date,
  settings: Settings,
  statusVisible: boolean,
  codingTodayMs: number,
  thinkingTodayMs: number,
  codingSessionMs: number,
  timerStatus: TimerStatus,
): Snapshot {
  const workDaysPerWeek = settings.workDays?.length ? settings.workDays.length : 5
  const earnings = calculateWorkEarnings(now, {
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
    thinkingTodaySeconds: Math.floor(Math.max(0, thinkingTodayMs) / 1000),
    codingSessionSeconds: Math.floor(Math.max(0, codingSessionMs) / 1000),
    timerStatus,
    isWorkDay: earnings.isWorkDay,
    percent: earnings.percent,
    earned: earnings.earned,
    hourly: earnings.hourly,
    remainingSeconds: earnings.remainingSeconds,
    weekEarned: earnings.week.earned,
    monthEarned: earnings.month.earned,
  }
}

function formatHM(seconds: number) {
  const totalMinutes = Math.max(0, Math.floor(seconds / 60))
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
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
    <title>PayMood</title>
    <link rel="stylesheet" href="${stylesheetUri}" />
  </head>
  <body>
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true"></div>
        <div>
          <h1>PayMood</h1>
          <div class="sub">VS Code work meter</div>
        </div>
      </div>
      <div class="actions" aria-label="Dashboard actions">
        <button class="ghost-button" id="statusToggle" type="button">Status bar</button>
        <button class="ghost-button" id="resetTodayActivity" type="button">Reset today</button>
        <button class="ghost-button danger" id="resetSettings" type="button">Reset</button>
      </div>
    </header>

    <main class="shell">
      <section class="workspace" aria-label="Earnings summary">
        <div class="live-card">
          <div class="panel-kicker">
            <span>Live shift</span>
            <span class="progress-chip" id="progressPill">-</span>
          </div>

          <div class="earnings-block">
            <div>
              <div class="eyebrow">Earned today</div>
              <div class="amount" id="earnedText">-</div>
              <div class="live-status" id="liveStatusText">-</div>
              <div class="live-caption">Estimated from your schedule and pay model.</div>
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
        </div>

        <div class="insights-panel">
          <div class="panel-kicker">
            <span>Rollups</span>
            <span>Today</span>
          </div>
          <div class="rollups-note">Coding tracks recent edits. Thinking tracks focused idle time.</div>
          <div class="insights-grid" aria-label="Work metrics">
            <div class="metric">
              <div class="k">This week</div>
              <div class="v" id="weekText">-</div>
            </div>
            <div class="metric">
              <div class="k">This month</div>
              <div class="v" id="monthText">-</div>
            </div>
            <div class="metric" title="Coding time is counted while this VS Code window is focused and within 90 seconds of a text edit.">
              <div class="k">Coding today</div>
              <div class="v" id="codingTodayText">-</div>
            </div>
            <div class="metric" title="Thinking time is counted while this VS Code window is focused but outside the recent coding window.">
              <div class="k">Thinking today</div>
              <div class="v" id="thinkingTodayText">-</div>
            </div>
            <div class="metric metric-wide">
              <div class="k">This session</div>
              <div class="v" id="codingSessionText">-</div>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-panel" aria-label="Settings">
        <div class="section-heading">
          <div>
            <h2>Settings</h2>
            <span>Global preferences shared across workspaces</span>
          </div>
          <span class="save-chip">Auto-saved</span>
        </div>

        <div class="settings-grid">
          <div class="settings-group">
            <div class="group-title">
              <div>Work schedule</div>
              <span>Used for progress and time remaining.</span>
            </div>
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
              <div class="field-hint">Minutes removed from the earning window.</div>
            </div>

            <div class="field">
              <label>Work days</label>
              <div class="days" id="workDays"></div>
            </div>
          </div>

          <div class="settings-group">
            <div class="group-title">
              <div>Pay model</div>
              <span>Stored locally on this machine and used only for estimates.</span>
            </div>
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
  const windowId = `${Date.now().toString(36)}-${randomUUID()}`

  let statusVisible = readStatusVisible(context)
  let runtimeState = readRuntimeState(context, new Date())
  let dailyActivityState = readDailyActivity(context, new Date())
  let localWindowState: WindowRuntimeState
  let lastRuntimeSerialized = JSON.stringify(runtimeState)

  const now = new Date()
  const today = getLocalDayKey(now)
  localWindowState = {
    day: today,
    codingTodayMs: 0,
    thinkingTodayMs: 0,
    codingSessionMs: 0,
    lastSeenMs: now.getTime(),
    timerStatus: runtimeState.timer.status,
    timerUpdatedAt: runtimeState.timer.updatedAt,
  }

  let codingActiveUntilMs = 0
  let lastTickMs = Date.now()
  let wasWindowFocused = vscode.window.state.focused
  let statusItem: vscode.StatusBarItem | null = null
  let panel: vscode.WebviewPanel | null = null
  let timer: NodeJS.Timeout | null = null

  const persistRuntimeState = () => {
    runtimeState.windows[windowId] = localWindowState
    const serialized = JSON.stringify(runtimeState)
    if (serialized === lastRuntimeSerialized) return
    lastRuntimeSerialized = serialized
    persistRuntimeStateToStore(context, runtimeState)
  }

  const syncRuntimeFromStore = (nowDate: Date) => {
    const incoming = readRuntimeState(context, nowDate)
    const incomingSerialized = JSON.stringify(incoming)
    if (incomingSerialized === lastRuntimeSerialized) return

    runtimeState = incoming
    const incomingLocal = runtimeState.windows[windowId]
    if (incomingLocal) {
      localWindowState = sanitizeWindowRuntimeState(incomingLocal, getLocalDayKey(nowDate), nowDate.getTime())
    } else {
      runtimeState.windows[windowId] = localWindowState
    }
    lastRuntimeSerialized = incomingSerialized
  }

  const determineTimerStatus = (nowMs: number): TimerStatus => {
    if (vscode.window.state.focused) return 'start'
    const activeWindows = countActiveWindows(runtimeState, nowMs)
    return activeWindows > 0 ? 'pause' : 'end'
  }

  const applySharedTimerLww = (desiredStatus: TimerStatus, nowMs: number) => {
    if (localWindowState.timerStatus !== desiredStatus) {
      localWindowState.timerStatus = desiredStatus
      localWindowState.timerUpdatedAt = nowMs
    }

    if (localWindowState.timerUpdatedAt >= runtimeState.timer.updatedAt) {
      runtimeState.timer = {
        status: localWindowState.timerStatus,
        updatedAt: localWindowState.timerUpdatedAt,
        sourceWindowId: windowId,
      }
    } else {
      localWindowState.timerStatus = runtimeState.timer.status
      localWindowState.timerUpdatedAt = runtimeState.timer.updatedAt
    }
  }

  const collectTime = () => {
    const nowDate = new Date()
    const nowMs = nowDate.getTime()
    const todayKey = getLocalDayKey(nowDate)
    syncRuntimeFromStore(nowDate)
    dailyActivityState = readDailyActivity(context, nowDate)
    const focusStateAtLastTick = wasWindowFocused

    if (localWindowState.day !== todayKey) {
      localWindowState = {
        day: todayKey,
        codingTodayMs: 0,
        thinkingTodayMs: 0,
        codingSessionMs: 0,
        lastSeenMs: nowMs,
        timerStatus: localWindowState.timerStatus,
        timerUpdatedAt: localWindowState.timerUpdatedAt,
      }
    }

    const deltaMs = nowMs - lastTickMs
    let codingDeltaMs = 0
    let thinkingDeltaMs = 0
    if (deltaMs > 0 && focusStateAtLastTick) {
      if (nowMs <= codingActiveUntilMs) {
        codingDeltaMs = deltaMs
        localWindowState.codingTodayMs += codingDeltaMs
        localWindowState.codingSessionMs += deltaMs
      } else {
        thinkingDeltaMs = deltaMs
        localWindowState.thinkingTodayMs += thinkingDeltaMs
      }
    }
    if (codingDeltaMs > 0 || thinkingDeltaMs > 0) {
      dailyActivityState = addDailyActivity(
        context,
        nowDate,
        {
          codingTodayMs: codingDeltaMs,
          thinkingTodayMs: thinkingDeltaMs,
        },
        windowId,
        dailyActivityState,
      )
    }

    localWindowState.lastSeenMs = nowMs
    cleanupRuntimeState(runtimeState, nowMs, todayKey)
    const desiredStatus = determineTimerStatus(nowMs)
    applySharedTimerLww(desiredStatus, nowMs)

    runtimeState.windows[windowId] = localWindowState
    persistRuntimeState()
    lastTickMs = nowMs
    wasWindowFocused = vscode.window.state.focused
  }

  const markCodingActivity = () => {
    const nowMs = Date.now()
    if (nowMs > codingActiveUntilMs) lastTickMs = nowMs
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
    collectTime()
    const settings = readSettings(context)
    const nowDate = new Date()
    const totals =
      dailyActivityState.day === getLocalDayKey(nowDate) ? dailyActivityState : readDailyActivity(context, nowDate)

    const snapshot = computeSnapshot(
      nowDate,
      settings,
      statusVisible,
      totals.codingTodayMs,
      totals.thinkingTodayMs,
      localWindowState.codingSessionMs,
      runtimeState.timer.status,
    )

    ensureStatusBar()
    if (statusItem) {
      statusItem.text = formatStatus(snapshot)
      const tooltipLines = [
        'Work progress',
        `${Math.max(0, Math.min(100, snapshot.percent))}% · ${currencyCodeToSymbol(
          settings.currency,
        )}${snapshot.earned.toFixed(2)} earned`,
        `Remaining ${formatHM(snapshot.remainingSeconds)}`,
        `Coding today ${formatHM(snapshot.codingTodaySeconds)}`,
        `Thinking today ${formatHM(snapshot.thinkingTodaySeconds)}`,
        'Click to open PayMood',
      ]
      statusItem.tooltip = tooltipLines.join('\n')
    }

    postSnapshotToWebview(snapshot)
  }

  const openDashboard = () => {
    if (panel) {
      panel.reveal(panel.viewColumn ?? vscode.ViewColumn.One)
      refresh()
      return
    }

    panel = vscode.window.createWebviewPanel('paymoodDashboard', 'PayMood', vscode.ViewColumn.One, {
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
          case 'resetTodayActivity':
            await resetTodayActivityWithConfirmation()
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
    await writeStatusVisible(context, statusVisible)
    ensureStatusBar()
  }

  const resetSettings = async () => {
    await writeSettings(context, defaultSettings)
    refresh()
  }

  const resetTodayActivityWithConfirmation = async () => {
    const choice = await vscode.window.showWarningMessage(
      "Reset today's Coding today and Thinking today totals?",
      { modal: true },
      'Reset today',
    )
    if (choice !== 'Reset today') return
    dailyActivityState = resetDailyActivity(context, new Date())
    refresh()
  }

  context.subscriptions.push(vscode.commands.registerCommand('paymood.openDashboard', openDashboard))
  context.subscriptions.push(vscode.commands.registerCommand('paymood.toggleStatusBar', toggleStatusBar))
  context.subscriptions.push(
    vscode.commands.registerCommand('paymood.resetTodayActivity', resetTodayActivityWithConfirmation),
  )
  context.subscriptions.push(vscode.commands.registerCommand('paymood.resetSettings', resetSettings))
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(markCodingActivity))
  context.subscriptions.push(
    vscode.window.onDidChangeWindowState(() => {
      collectTime()
      refresh()
    }),
  )

  ensureStatusBar()
  refresh()

  timer = setInterval(refresh, RUNTIME_HEARTBEAT_MS)
  context.subscriptions.push({
    dispose: () => {
      if (timer) clearInterval(timer)
      const now = new Date()
      const nowMs = now.getTime()
      const current = readRuntimeState(context, now)
      delete current.windows[windowId]
      cleanupRuntimeState(current, nowMs, getLocalDayKey(now))
      if (countActiveWindows(current, nowMs) === 0) {
        current.timer = {
          status: 'end',
          updatedAt: nowMs,
          sourceWindowId: windowId,
        }
      }
      persistRuntimeStateToStore(context, current)
    },
  })
}

export function deactivate() {}
