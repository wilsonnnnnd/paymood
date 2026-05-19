import { createContext, useContext, useEffect, useState } from 'react'
import { defaultSettings, sanitizeSettings, type Settings } from '../lib/settingsModel'

export const STORAGE_KEY = 'workday-settings-v1'
export const SETTINGS_EVENT = 'cozy-earnings-settings'
export { defaultSettings, sanitizeSettings, type Settings } from '../lib/settingsModel'

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
