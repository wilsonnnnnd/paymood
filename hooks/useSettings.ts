import { createContext, useContext, useEffect, useState } from 'react'
import type { SalaryType } from '../lib/earnings'
import { salaryBoundsByType, supportedCurrencies, type SupportedCurrency } from '../lib/settings'

export type Settings = {
  startTime: string // ISO time like '09:00'
  endTime: string
  breakMinutes: number
  workDays: number[] // 0..6 (Sun..Sat)
  payLocked?: boolean
  themePreset?: 'cozy' | 'light'
  colorMode?: 'system' | 'light' | 'dark'
  petEnabled?: boolean
  petVariant?: 'aqua' | 'undead' | 'magma'
  salaryType: SalaryType
  salaryAmount: number
  currency?: SupportedCurrency
}

export const STORAGE_KEY = 'workday-settings-v1'
export const SETTINGS_EVENT = 'cozy-earnings-settings'

export const defaultSettings: Settings = {
  startTime: '09:00',
  endTime: '17:00',
  breakMinutes: 0,
  workDays: [1, 2, 3, 4, 5],
  payLocked: false,
  themePreset: 'cozy',
  colorMode: 'system',
  petEnabled: true,
  petVariant: 'aqua',
  salaryType: 'hourly',
  salaryAmount: 0,
  currency: 'AUD',
}

const salaryTypes: SalaryType[] = ['hourly', 'daily', 'weekly', 'fortnightly', 'monthly', 'annually']
const themePresets: NonNullable<Settings['themePreset']>[] = ['cozy', 'light']
const colorModes: NonNullable<Settings['colorMode']>[] = ['system', 'light', 'dark']
const petVariants: NonNullable<Settings['petVariant']>[] = ['aqua', 'undead', 'magma']

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

export function sanitizeSettings(input: unknown): Settings {
  const raw = (input ?? {}) as any
  const salaryType: SalaryType = salaryTypes.includes(raw.salaryType)
    ? (raw.salaryType as SalaryType)
    : defaultSettings.salaryType
  const salaryBounds = salaryBoundsByType[salaryType] ?? salaryBoundsByType[defaultSettings.salaryType]
  const salaryAmount = normalizeNumber(raw.salaryAmount, defaultSettings.salaryAmount, salaryBounds)
  const currencyValue = String(raw.currency ?? '').toUpperCase()
  const currency = (supportedCurrencies as readonly string[]).includes(currencyValue)
    ? (currencyValue as SupportedCurrency)
    : defaultSettings.currency

  const payLocked =
    typeof raw.payLocked === 'boolean' ? raw.payLocked : raw.payLocked == null ? salaryAmount > 0 : defaultSettings.payLocked
  const petEnabled = typeof raw.petEnabled === 'boolean' ? raw.petEnabled : defaultSettings.petEnabled

  return {
    ...defaultSettings,
    startTime: normalizeTime(raw.startTime, defaultSettings.startTime),
    endTime: normalizeTime(raw.endTime, defaultSettings.endTime),
    breakMinutes: normalizeNumber(raw.breakMinutes, defaultSettings.breakMinutes, { min: 0, max: 24 * 60 }),
    workDays: normalizeWorkDays(raw.workDays, defaultSettings.workDays),
    payLocked,
    themePreset: themePresets.includes(raw.themePreset) ? raw.themePreset : defaultSettings.themePreset,
    colorMode: colorModes.includes(raw.colorMode) ? raw.colorMode : defaultSettings.colorMode,
    petEnabled,
    petVariant: petVariants.includes(raw.petVariant) ? raw.petVariant : defaultSettings.petVariant,
    salaryType,
    salaryAmount,
    currency,
  }
}

export type SettingsContextValue = {
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void
  ready: boolean
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)

export function readSettingsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSettings
    return sanitizeSettings(JSON.parse(raw))
  } catch {
    return defaultSettings
  }
}

export function writeSettingsToStorage(next: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {}
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (ctx) return ctx

  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setSettings(readSettingsFromStorage())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      setSettings(readSettingsFromStorage())
    }

    const onCustom = () => {
      setTimeout(() => {
        setSettings(readSettingsFromStorage())
      }, 0)
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener(SETTINGS_EVENT, onCustom as any)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(SETTINGS_EVENT, onCustom as any)
    }
  }, [ready])

  const update = (patch: Partial<Settings>) =>
    setSettings((prev) => {
      const next = sanitizeSettings({ ...prev, ...patch })
      writeSettingsToStorage(next)
      try {
        setTimeout(() => {
          window.dispatchEvent(new Event(SETTINGS_EVENT))
        }, 0)
      } catch {}
      return next
    })

  return { settings, updateSettings: update, ready }
}
