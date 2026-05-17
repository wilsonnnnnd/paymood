import { useEffect, useState } from 'react'

export type Settings = {
  startTime: string // ISO time like '09:00'
  endTime: string
  breakMinutes: number
  workDays: number[] // 0..6 (Sun..Sat)
  payLocked?: boolean
  themePreset?: 'cozy' | 'light'
  colorMode?: 'system' | 'light' | 'dark'
  petVariant?: 'aqua' | 'undead' | 'magma'
  salaryType: 'hourly' | 'daily' | 'weekly' | 'fortnightly' | 'monthly' | 'annually'
  salaryAmount: number
  currency?: string
}

const STORAGE_KEY = 'workday-settings-v1'
const SETTINGS_EVENT = 'cozy-earnings-settings'

const defaultSettings: Settings = {
  startTime: '09:00',
  endTime: '17:00',
  breakMinutes: 0,
  workDays: [1, 2, 3, 4, 5],
  payLocked: false,
  themePreset: 'cozy',
  colorMode: 'system',
  petVariant: 'aqua',
  salaryType: 'hourly',
  salaryAmount: 0,
  currency: 'AUD',
}

const salaryTypes: Settings['salaryType'][] = ['hourly', 'daily', 'weekly', 'fortnightly', 'monthly', 'annually']
const themePresets: NonNullable<Settings['themePreset']>[] = ['cozy', 'light']
const colorModes: NonNullable<Settings['colorMode']>[] = ['system', 'light', 'dark']
const petVariants: NonNullable<Settings['petVariant']>[] = ['aqua', 'undead', 'magma']
const currencies = ['AUD', 'CNY']

const salaryBoundsByType: Record<Settings['salaryType'], { min: number; max: number }> = {
  hourly: { min: 0, max: 10_000 },
  daily: { min: 0, max: 100_000 },
  weekly: { min: 0, max: 500_000 },
  fortnightly: { min: 0, max: 1_000_000 },
  monthly: { min: 0, max: 2_000_000 },
  annually: { min: 0, max: 10_000_000 },
}

function normalizeTime(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback
  const parts = value.split(':')
  if (parts.length < 2) return fallback
  const h = Number(parts[0])
  const m = Number(parts[1])
  if (!Number.isFinite(h) || !Number.isFinite(m)) return fallback
  if (h < 0 || h > 23 || m < 0 || m > 59) return fallback
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function normalizeNumber(value: unknown, fallback: number, opts?: { min?: number; max?: number }) {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isFinite(n)) return fallback
  const min = opts?.min
  const max = opts?.max
  if (typeof min === 'number' && n < min) return min
  if (typeof max === 'number' && n > max) return max
  return n
}

function normalizeWorkDays(value: unknown, fallback: number[]) {
  if (!Array.isArray(value)) return fallback
  const filtered = value
    .map((v) => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN))
    .filter((v) => Number.isFinite(v) && v >= 0 && v <= 6)
  const unique = Array.from(new Set(filtered.map((v) => Math.floor(v))))
  return unique.length ? unique : fallback
}

function sanitizeSettings(input: unknown): Settings {
  const raw = (input ?? {}) as any
  const salaryType: Settings['salaryType'] = salaryTypes.includes(raw.salaryType)
    ? (raw.salaryType as Settings['salaryType'])
    : defaultSettings.salaryType
  const salaryBounds = salaryBoundsByType[salaryType] ?? salaryBoundsByType[defaultSettings.salaryType]
  const salaryAmount = normalizeNumber(raw.salaryAmount, defaultSettings.salaryAmount, salaryBounds)
  const currency = currencies.includes(String(raw.currency ?? '').toUpperCase())
    ? String(raw.currency).toUpperCase()
    : defaultSettings.currency
  const payLocked =
    typeof raw.payLocked === 'boolean' ? raw.payLocked : typeof raw.payLocked === 'undefined' ? salaryAmount > 0 : false

  return {
    ...defaultSettings,
    startTime: normalizeTime(raw.startTime, defaultSettings.startTime),
    endTime: normalizeTime(raw.endTime, defaultSettings.endTime),
    breakMinutes: normalizeNumber(raw.breakMinutes, defaultSettings.breakMinutes, { min: 0, max: 24 * 60 }),
    workDays: normalizeWorkDays(raw.workDays, defaultSettings.workDays),
    payLocked,
    themePreset: themePresets.includes(raw.themePreset) ? raw.themePreset : defaultSettings.themePreset,
    colorMode: colorModes.includes(raw.colorMode) ? raw.colorMode : defaultSettings.colorMode,
    petVariant: petVariants.includes(raw.petVariant) ? raw.petVariant : defaultSettings.petVariant,
    salaryType,
    salaryAmount,
    currency,
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [ready, setReady] = useState(false)

  const readFromStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return defaultSettings
      return sanitizeSettings(JSON.parse(raw))
    } catch (e) {
      return defaultSettings
    }
  }

  useEffect(() => {
    setSettings(readFromStorage())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      setSettings(readFromStorage())
    }

    const onCustom = () => {
      setTimeout(() => {
        setSettings(readFromStorage())
      }, 0)
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener(SETTINGS_EVENT, onCustom as any)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(SETTINGS_EVENT, onCustom as any)
    }
  }, [ready])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (e) {
      // ignore
    }
  }, [ready, settings])

  const update = (patch: Partial<Settings>) =>
    setSettings((prev) => {
      const next = sanitizeSettings({ ...prev, ...patch })
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch (e) {
        // ignore
      }
      try {
        setTimeout(() => {
          window.dispatchEvent(new Event(SETTINGS_EVENT))
        }, 0)
      } catch (e) {
        // ignore
      }
      return next
    })

  return { settings, updateSettings: update, ready }
}
