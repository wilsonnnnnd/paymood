import {useEffect, useState} from 'react'

export type Settings = {
  startTime: string // ISO time like '09:00'
  endTime: string
  breakMinutes: number
  salaryType: 'hourly' | 'daily' | 'weekly' | 'fortnightly' | 'monthly' | 'annually'
  salaryAmount: number
  currency?: string
}

const STORAGE_KEY = 'workday-settings-v1'

const defaultSettings: Settings = {
  startTime: '09:00',
  endTime: '17:00',
  breakMinutes: 0,
  salaryType: 'hourly',
  salaryAmount: 0,
  currency: 'AUD',
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      if (typeof window === 'undefined') return defaultSettings
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : defaultSettings
    } catch (e) {
      return defaultSettings
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (e) {
      // ignore
    }
  }, [settings])

  const update = (patch: Partial<Settings>) => setSettings(prev => ({...prev, ...patch}))

  return {settings, updateSettings: update}
}
