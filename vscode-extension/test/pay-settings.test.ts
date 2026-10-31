import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { afterEach, expect, it, vi } from 'vitest'
import { calculateWorkEarnings } from '../../lib/earnings'
import { defaultSettings } from '../../lib/settingsModel'

const source = readFileSync(new URL('../media/dashboard.js', import.meta.url), 'utf8')

function dashboard() {
  vi.useFakeTimers()
  const elements = new Map<string, any>()
  const element = () => ({
    value: '', textContent: '', innerHTML: '', dataset: {}, style: {},
    handlers: {} as Record<string, () => void>,
    addEventListener(name: string, callback: () => void) { this.handlers[name] = callback },
    setAttribute() {}, appendChild() {},
  })
  const document = {
    activeElement: null as any,
    getElementById(id: string) {
      if (!elements.has(id)) elements.set(id, element())
      return elements.get(id)
    },
    createElement: element,
  }
  let receive: (event: any) => void = () => {}
  const postMessage = vi.fn()
  runInNewContext(source, {
    document, console, setTimeout, clearTimeout,
    acquireVsCodeApi: () => ({ getState: () => null, setState() {}, postMessage }),
    window: { addEventListener: (_: string, callback: typeof receive) => { receive = callback } },
  })
  const snapshot = (salaryAmount: number, salaryType = 'hourly') => {
    const settings = { ...defaultSettings, salaryAmount, salaryType, publicHolidayEnabled: false }
    const earnings = calculateWorkEarnings(new Date(2026, 9, 30, 13), settings as typeof defaultSettings)
    receive({ data: { type: 'snapshot', snapshot: {
      ...earnings, settings, cycleEarned: earnings.cycle.earned,
    } } })
  }
  snapshot(20)
  return { document, elements, postMessage, snapshot }
}

afterEach(() => vi.useRealTimers())

it('cancels a pending salary save when settings are reset', () => {
  const { elements, postMessage, snapshot } = dashboard()
  elements.get('salaryAmount').value = '999'
  elements.get('salaryAmount').handlers.input()
  elements.get('resetSettings').handlers.click()
  snapshot(0)
  vi.advanceTimersByTime(120)
  expect(postMessage.mock.calls.map(([message]) => message.type)).toEqual(['ready', 'resetSettings'])
  expect(elements.get('salaryAmount').value).toBe('0')
})

it('saves salary type and amount together when edited within the debounce window', () => {
  const { elements, postMessage, snapshot } = dashboard()
  elements.get('salaryType').value = 'monthly'
  elements.get('salaryType').handlers.change()
  elements.get('salaryAmount').value = '8000'
  elements.get('salaryAmount').handlers.input()
  snapshot(20) // A heartbeat arrives before the save.
  expect(elements.get('salaryAmount').value).toBe('8000')
  vi.advanceTimersByTime(120)
  expect(postMessage).toHaveBeenLastCalledWith({
    type: 'patchSettings', patch: { salaryType: 'monthly', salaryAmount: 8000 },
  })
})

it('preserves the active salary edit across heartbeat and delayed save responses', () => {
  const { document, elements, snapshot } = dashboard()
  const amount = elements.get('salaryAmount')
  document.activeElement = amount
  amount.value = '35'
  amount.handlers.input()
  vi.advanceTimersByTime(120)
  snapshot(20)
  expect(amount.value).toBe('35')
  document.activeElement = null
  snapshot(35)
  expect(amount.value).toBe('35')
})

it('replaces displayed earnings after repeated salary edits instead of adding previous amounts', () => {
  const { elements, snapshot } = dashboard()
  for (const rate of [40, 10, 40, 20, 20]) {
    const amount = elements.get('salaryAmount')
    amount.value = String(rate)
    amount.handlers.input()
    vi.advanceTimersByTime(120)
    snapshot(rate)
    expect(elements.get('earnedText').textContent).toBe(`A$${(rate * 4).toFixed(2)}`)
    expect(elements.get('cycleText').textContent).toBe(`A$${rate * 4}`)
  }
})
