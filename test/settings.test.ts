import { beforeEach, describe, expect, it } from 'vitest'
import { defaultSettings, sanitizeSettings } from '../lib/settingsModel'
import { readSettingsFromStorage, writeSettingsToStorage } from '../hooks/useSettings'

describe('settings persistence', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('reads default settings when localStorage is empty', () => {
    expect(readSettingsFromStorage()).toEqual(defaultSettings)
  })

  it('persists settings to localStorage and reads them back', () => {
    const nextSettings = sanitizeSettings({
      ...defaultSettings,
      salaryAmount: 120,
      salaryType: 'daily',
      payLocked: true,
      currency: 'CNY',
    })

    writeSettingsToStorage(nextSettings)
    expect(readSettingsFromStorage()).toEqual(nextSettings)
  })

  it('enables payLocked when a salary amount is provided and payLocked is omitted', () => {
    const nextSettings = sanitizeSettings({
      ...defaultSettings,
      salaryAmount: 120,
      salaryType: 'daily',
      payLocked: undefined,
    })

    expect(nextSettings.payLocked).toBe(true)
  })
})
