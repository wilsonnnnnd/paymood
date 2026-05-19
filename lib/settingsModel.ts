import type { SalaryType } from './earnings'
import { salaryBoundsByType, supportedCurrencies, type SupportedCurrency } from './settings'

export type Settings = {
  startTime: string
  endTime: string
  breakMinutes: number
  workDays: number[]
  payLocked?: boolean
  themePreset?: 'cozy' | 'light'
  colorMode?: 'system' | 'light' | 'dark'
  petEnabled?: boolean
  petVariant?: 'aqua' | 'undead' | 'magma'
  salaryType: SalaryType
  salaryAmount: number
  currency?: SupportedCurrency
}

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

