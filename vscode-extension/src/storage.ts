import type * as vscode from 'vscode'
import { defaultSettings, sanitizeSettings, type Settings } from '../../lib/settingsModel'

const SETTINGS_KEY = 'paymood.settings.v1'
const STATUS_VISIBLE_KEY = 'paymood.statusBar.visible.v1'
const CODING_TIME_KEY = 'paymood.codingTime.v1'
const DAILY_ACTIVITY_KEY = 'paymood.dailyActivity.v1'
const RUNTIME_STATE_KEY = 'paymood.runtimeState.v1'
const WINDOW_STALE_MS = 20_000

export type TimerStatus = 'start' | 'pause' | 'end'

type LegacyCodingTimeState = {
  day: string
  milliseconds: number
}

type DailyActivityWindowState = {
  codingTodayMs: number
  thinkingTodayMs: number
}

export type DailyActivityState = {
  day: string
  codingTodayMs: number
  thinkingTodayMs: number
  windows?: Record<string, DailyActivityWindowState>
}

export type WindowRuntimeState = {
  day: string
  codingTodayMs: number
  thinkingTodayMs: number
  codingSessionMs: number
  lastSeenMs: number
  timerStatus: TimerStatus
  timerUpdatedAt: number
}

type SharedTimerState = {
  status: TimerStatus
  updatedAt: number
  sourceWindowId: string
}

export type RuntimeState = {
  day: string
  windows: Record<string, WindowRuntimeState>
  timer: SharedTimerState
}

export function getLocalDayKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function readSettings(context: vscode.ExtensionContext) {
  const raw = context.globalState.get<unknown>(SETTINGS_KEY)
  if (!raw) return defaultSettings
  return sanitizeSettings(raw)
}

export async function writeSettings(context: vscode.ExtensionContext, next: Settings) {
  await context.globalState.update(SETTINGS_KEY, next)
}

export function readStatusVisible(context: vscode.ExtensionContext) {
  const savedStatusVisible = context.globalState.get<boolean>(STATUS_VISIBLE_KEY)
  return typeof savedStatusVisible === 'boolean' ? savedStatusVisible : true
}

export async function writeStatusVisible(context: vscode.ExtensionContext, visible: boolean) {
  await context.globalState.update(STATUS_VISIBLE_KEY, visible)
}

function finiteNonNegative(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, number) : 0
}

function readLegacyCodingTime(context: vscode.ExtensionContext, now: Date): LegacyCodingTimeState {
  const today = getLocalDayKey(now)
  const raw = context.globalState.get<unknown>(CODING_TIME_KEY)
  if (!raw || typeof raw !== 'object') return { day: today, milliseconds: 0 }

  const saved = raw as Partial<LegacyCodingTimeState>
  if (saved.day !== today || typeof saved.milliseconds !== 'number' || !Number.isFinite(saved.milliseconds)) {
    return { day: today, milliseconds: 0 }
  }

  return { day: today, milliseconds: finiteNonNegative(saved.milliseconds) }
}

function sanitizeDailyActivityState(raw: unknown, now: Date, context: vscode.ExtensionContext): DailyActivityState {
  const today = getLocalDayKey(now)
  const value = raw && typeof raw === 'object' ? (raw as Partial<DailyActivityState>) : {}
  if (value.day === today) {
    const windows: Record<string, DailyActivityWindowState> = {}
    const windowsRaw = value.windows
    if (windowsRaw && typeof windowsRaw === 'object') {
      for (const [id, entry] of Object.entries(windowsRaw)) {
        if (!id || !entry || typeof entry !== 'object') continue
        const windowEntry = entry as Partial<DailyActivityWindowState>
        windows[id] = {
          codingTodayMs: finiteNonNegative(windowEntry.codingTodayMs),
          thinkingTodayMs: finiteNonNegative(windowEntry.thinkingTodayMs),
        }
      }
    }

    return {
      day: today,
      codingTodayMs: finiteNonNegative(value.codingTodayMs),
      thinkingTodayMs: finiteNonNegative(value.thinkingTodayMs),
      windows,
    }
  }

  const legacy = readLegacyCodingTime(context, now)
  return {
    day: today,
    codingTodayMs: legacy.day === today ? legacy.milliseconds : 0,
    thinkingTodayMs: 0,
  }
}

export function readDailyActivity(context: vscode.ExtensionContext, now: Date): DailyActivityState {
  const raw = context.globalState.get<unknown>(DAILY_ACTIVITY_KEY)
  return sanitizeDailyActivityState(raw, now, context)
}

export function addDailyActivity(
  context: vscode.ExtensionContext,
  now: Date,
  patch: Pick<DailyActivityState, 'codingTodayMs' | 'thinkingTodayMs'>,
  sourceWindowId: string,
  base?: DailyActivityState,
) {
  const current = readDailyActivity(context, now)
  const currentWindows = current.windows ?? {}
  const baseWindows = base?.day === current.day ? base.windows ?? {} : {}
  const windows = { ...baseWindows, ...currentWindows }
  const previousSource = windows[sourceWindowId] ?? { codingTodayMs: 0, thinkingTodayMs: 0 }
  windows[sourceWindowId] = {
    codingTodayMs: previousSource.codingTodayMs + finiteNonNegative(patch.codingTodayMs),
    thinkingTodayMs: previousSource.thinkingTodayMs + finiteNonNegative(patch.thinkingTodayMs),
  }

  const sourceCodingTotal = Object.values(windows).reduce((total, entry) => total + entry.codingTodayMs, 0)
  const sourceThinkingTotal = Object.values(windows).reduce((total, entry) => total + entry.thinkingTodayMs, 0)
  const merged =
    base?.day === current.day
      ? {
          day: current.day,
          codingTodayMs: Math.max(current.codingTodayMs, base.codingTodayMs),
          thinkingTodayMs: Math.max(current.thinkingTodayMs, base.thinkingTodayMs),
        }
      : current
  const next: DailyActivityState = {
    day: getLocalDayKey(now),
    codingTodayMs: Math.max(sourceCodingTotal, merged.codingTodayMs + finiteNonNegative(patch.codingTodayMs)),
    thinkingTodayMs: Math.max(sourceThinkingTotal, merged.thinkingTodayMs + finiteNonNegative(patch.thinkingTodayMs)),
    windows,
  }
  void context.globalState.update(DAILY_ACTIVITY_KEY, next)
  return next
}

export function resetDailyActivity(context: vscode.ExtensionContext, now: Date): DailyActivityState {
  const next: DailyActivityState = {
    day: getLocalDayKey(now),
    codingTodayMs: 0,
    thinkingTodayMs: 0,
    windows: {},
  }
  void context.globalState.update(DAILY_ACTIVITY_KEY, next)
  return next
}

function defaultRuntimeState(now: Date): RuntimeState {
  const nowMs = now.getTime()
  return {
    day: getLocalDayKey(now),
    windows: {},
    timer: {
      status: 'end',
      updatedAt: nowMs,
      sourceWindowId: '',
    },
  }
}

function coerceTimerStatus(value: unknown): TimerStatus {
  if (value === 'start' || value === 'pause' || value === 'end') return value
  return 'end'
}

export function sanitizeWindowRuntimeState(raw: unknown, fallbackDay: string, nowMs: number): WindowRuntimeState {
  const value = raw && typeof raw === 'object' ? (raw as Partial<WindowRuntimeState>) : {}
  return {
    day: typeof value.day === 'string' ? value.day : fallbackDay,
    codingTodayMs: finiteNonNegative(value.codingTodayMs),
    thinkingTodayMs: finiteNonNegative(value.thinkingTodayMs),
    codingSessionMs: finiteNonNegative(value.codingSessionMs),
    lastSeenMs: Number.isFinite(value.lastSeenMs) ? Math.max(0, Number(value.lastSeenMs)) : nowMs,
    timerStatus: coerceTimerStatus(value.timerStatus),
    timerUpdatedAt: Number.isFinite(value.timerUpdatedAt) ? Math.max(0, Number(value.timerUpdatedAt)) : nowMs,
  }
}

function sanitizeRuntimeState(raw: unknown, now: Date): RuntimeState {
  const fallback = defaultRuntimeState(now)
  if (!raw || typeof raw !== 'object') return fallback

  const nowMs = now.getTime()
  const value = raw as Partial<RuntimeState>
  const day = typeof value.day === 'string' ? value.day : fallback.day

  const windowsRaw = value.windows
  const windows: Record<string, WindowRuntimeState> = {}
  if (windowsRaw && typeof windowsRaw === 'object') {
    for (const [id, entry] of Object.entries(windowsRaw)) {
      if (!id) continue
      windows[id] = sanitizeWindowRuntimeState(entry, day, nowMs)
    }
  }

  const timerRaw = value.timer && typeof value.timer === 'object' ? (value.timer as Partial<SharedTimerState>) : {}
  const timer: SharedTimerState = {
    status: coerceTimerStatus(timerRaw.status),
    updatedAt: Number.isFinite(timerRaw.updatedAt) ? Math.max(0, Number(timerRaw.updatedAt)) : nowMs,
    sourceWindowId: typeof timerRaw.sourceWindowId === 'string' ? timerRaw.sourceWindowId : '',
  }

  return { day, windows, timer }
}

export function readRuntimeState(context: vscode.ExtensionContext, now: Date): RuntimeState {
  const raw = context.globalState.get<unknown>(RUNTIME_STATE_KEY)
  return sanitizeRuntimeState(raw, now)
}

export function persistRuntimeState(context: vscode.ExtensionContext, runtime: RuntimeState) {
  void context.globalState.update(RUNTIME_STATE_KEY, runtime)
}

export function cleanupRuntimeState(runtime: RuntimeState, nowMs: number, today: string) {
  runtime.day = today
  for (const [windowId, entry] of Object.entries(runtime.windows)) {
    const stale = nowMs - entry.lastSeenMs > WINDOW_STALE_MS
    if (stale || entry.day !== today) {
      delete runtime.windows[windowId]
    }
  }
}

export function countActiveWindows(runtime: RuntimeState, nowMs: number) {
  let count = 0
  for (const entry of Object.values(runtime.windows)) {
    if (nowMs - entry.lastSeenMs <= WINDOW_STALE_MS) count += 1
  }
  return count
}
