import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addDailyActivity,
  cleanupRuntimeState,
  readDailyActivity,
  resetDailyActivity,
  type RuntimeState,
} from './storage'

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
