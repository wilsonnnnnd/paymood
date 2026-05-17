'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  defaultSettings,
  readSettingsFromStorage,
  sanitizeSettings,
  SETTINGS_EVENT,
  STORAGE_KEY,
  SettingsContext,
  writeSettingsToStorage,
  type Settings,
} from '../hooks/useSettings'

export default function SettingsProvider({ children }: { children: React.ReactNode }) {
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

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [ready])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
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
  }, [])

  const value = useMemo(() => ({ settings, updateSettings, ready }), [ready, settings, updateSettings])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
