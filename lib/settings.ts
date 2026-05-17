import type { SalaryType } from './earnings'

export const salaryBoundsByType: Record<SalaryType, { min: number; max: number }> = {
  hourly: { min: 0, max: 10_000 },
  daily: { min: 0, max: 100_000 },
  weekly: { min: 0, max: 500_000 },
  fortnightly: { min: 0, max: 1_000_000 },
  monthly: { min: 0, max: 2_000_000 },
  annually: { min: 0, max: 10_000_000 },
}

export const supportedCurrencies = ['AUD', 'CNY'] as const
export type SupportedCurrency = (typeof supportedCurrencies)[number]

export const currencySymbols: Record<SupportedCurrency, string> = {
  AUD: 'A$',
  CNY: '¥',
}
