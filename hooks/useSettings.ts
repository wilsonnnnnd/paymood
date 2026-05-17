import {useEffect, useState} from 'react'

export type Settings = {
  startTime: string // ISO time like '09:00'
  endTime: string
  breakMinutes: number
  workDays: number[] // 0..6 (Sun..Sat)
  payLocked?: boolean
  themePreset?: 'cozy' | 'light'
  colorMode?: 'system' | 'light' | 'dark'
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
  salaryType: 'hourly',
  salaryAmount: 0,
  currency: 'AUD',
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [ready, setReady] = useState(false)

  const readFromStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return defaultSettings
      return {...defaultSettings, ...JSON.parse(raw)}
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
      setSettings(readFromStorage())
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
    setSettings(prev => {
      const next = {...prev, ...patch}
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch (e) {
        // ignore
      }
      try {
        window.dispatchEvent(new Event(SETTINGS_EVENT))
      } catch (e) {
        // ignore
      }
      return next
    })

  return {settings, updateSettings: update, ready}
}
