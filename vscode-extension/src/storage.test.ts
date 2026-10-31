import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addDailyActivity,
  activityDelta,
  applySettingsPatch,
  cleanupRuntimeState,
  readDailyActivity,
  resetDailyActivity,
  type RuntimeState,
} from './storage'
import { defaultSettings } from '../../lib/settingsModel'

test('changing and clearing payday replaces the derived cycle day', () => {
  const initial = applySettingsPatch(defaultSettings, { lastPaydayDate: '2026-10-15' })
  assert.equal(initial.paydayDayOfMonth, 15)
  const changed = applySettingsPatch(initial, { lastPaydayDate: '2026-10-25' })
  assert.equal(changed.paydayDayOfMonth, 25)
  assert.equal(applySettingsPatch(changed, { salaryAmount: 100 }).paydayDayOfMonth, 25)
  const cleared = applySettingsPatch(changed, { lastPaydayDate: '' })
  assert.equal(cleared.lastPaydayDate, undefined)
  assert.equal(cleared.paydayDayOfMonth, undefined)
})

test('suspension and backwards clock changes do not add activity', () => {
  const start = new Date(2026, 9, 30, 12).getTime()
  assert.deepEqual(activityDelta(start, start + 3_600_000, start + 90_000, true), {
    codingTodayMs: 0, thinkingTodayMs: 0,
  })
  assert.deepEqual(activityDelta(start, start - 1000, start + 90_000, true), {
    codingTodayMs: 0, thinkingTodayMs: 0,
  })
})

test('accounts for thinking time before a new coding event and splits expiry intervals', () => {
  const start = new Date(2026, 9, 30, 12).getTime()
  assert.deepEqual(activityDelta(start, start + 3000, start - 1000, true), {
    codingTodayMs: 0, thinkingTodayMs: 3000,
  })
  assert.deepEqual(activityDelta(start, start + 5000, start + 2000, true), {
    codingTodayMs: 2000, thinkingTodayMs: 3000,
  })
  assert.deepEqual(activityDelta(start, start + 5000, start + 90000, false), {
    codingTodayMs: 0, thinkingTodayMs: 0,
  })
})

test('only attributes the part after midnight to the new day', () => {
  const midnight = new Date(2026, 9, 31).getTime()
  assert.deepEqual(activityDelta(midnight - 2000, midnight + 3000, midnight + 1000, true), {
    codingTodayMs: 1000, thinkingTodayMs: 2000,
  })
})

test('focused AI panel or terminal work keeps counting without document edits', () => {
  const start = new Date(2026, 9, 30, 12).getTime()
  const codingUntil = start + 90_000
  let codingMs = 0
  let thinkingMs = 0
  // Three minutes in an AI panel: expiry changes the category, not total work time.
  for (let offset = 5000; offset <= 180_000; offset += 5000) {
    const delta = activityDelta(start + offset - 5000, start + offset, codingUntil, true)
    codingMs += delta.codingTodayMs
    thinkingMs += delta.thinkingTodayMs
  }
  assert.equal(codingMs, 90_000)
  assert.equal(thinkingMs, 90_000)
  assert.equal(codingMs + thinkingMs, 180_000)
  assert.deepEqual(activityDelta(start + 180_000, start + 185_000, codingUntil, false), {
    codingTodayMs: 0, thinkingTodayMs: 0,
  })
})

type Store = Map<string, unknown>

function createContext(seed: Record<string, unknown> = {}) {
  const store: Store = new Map(Object.entries(seed))
  return {
    store,
    context: {
      globalState: {
        get<T>(key: string) {
          return store.get(key) as T
        },
        update(key: string, value: unknown) {
          store.set(key, value)
          return Promise.resolve()
        },
      },
    },
  }
}

test('migrates same-day legacy coding time into daily activity', () => {
  const now = new Date(2026, 4, 23, 10)
  const { context } = createContext({
    'paymood.codingTime.v1': {
      day: '2026-05-23',
      milliseconds: 42_000,
    },
  })

  const activity = readDailyActivity(context as never, now)

  assert.equal(activity.day, '2026-05-23')
  assert.equal(activity.codingTodayMs, 42_000)
  assert.equal(activity.thinkingTodayMs, 0)
})

test('resets daily activity on local day rollover', () => {
  const now = new Date(2026, 4, 24, 9)
  const { context } = createContext({
    'paymood.dailyActivity.v1': {
      day: '2026-05-23',
      codingTodayMs: 60_000,
      thinkingTodayMs: 30_000,
    },
  })

  const activity = readDailyActivity(context as never, now)

  assert.equal(activity.day, '2026-05-24')
  assert.equal(activity.codingTodayMs, 0)
  assert.equal(activity.thinkingTodayMs, 0)
})

test('ignores negative and invalid daily activity deltas', () => {
  const now = new Date(2026, 4, 23, 12)
  const { context } = createContext()

  const activity = addDailyActivity(
    context as never,
    now,
    {
      codingTodayMs: -10 as never,
      thinkingTodayMs: Number.NaN as never,
    },
    'window-a',
  )

  assert.equal(activity.codingTodayMs, 0)
  assert.equal(activity.thinkingTodayMs, 0)
})

test('runtime stale cleanup does not clear persisted daily totals', () => {
  const now = new Date(2026, 4, 23, 15)
  const { context } = createContext({
    'paymood.dailyActivity.v1': {
      day: '2026-05-23',
      codingTodayMs: 90_000,
      thinkingTodayMs: 15_000,
    },
  })
  const runtime: RuntimeState = {
    day: '2026-05-23',
    windows: {
      stale: {
        day: '2026-05-23',
        codingTodayMs: 90_000,
        thinkingTodayMs: 15_000,
        codingSessionMs: 90_000,
        lastSeenMs: now.getTime() - 30_000,
        timerStatus: 'start',
        timerUpdatedAt: now.getTime() - 30_000,
      },
    },
    timer: {
      status: 'start',
      updatedAt: now.getTime() - 30_000,
      sourceWindowId: 'stale',
    },
  }

  cleanupRuntimeState(runtime, now.getTime(), '2026-05-23')
  const activity = readDailyActivity(context as never, now)

  assert.deepEqual(runtime.windows, {})
  assert.equal(activity.codingTodayMs, 90_000)
  assert.equal(activity.thinkingTodayMs, 15_000)
})

test('resetDailyActivity clears today totals', () => {
  const now = new Date(2026, 4, 23, 16)
  const { context } = createContext({
    'paymood.dailyActivity.v1': {
      day: '2026-05-23',
      codingTodayMs: 90_000,
      thinkingTodayMs: 15_000,
    },
  })

  const activity = resetDailyActivity(context as never, now)

  assert.equal(activity.day, '2026-05-23')
  assert.equal(activity.codingTodayMs, 0)
  assert.equal(activity.thinkingTodayMs, 0)
})
