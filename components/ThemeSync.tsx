"use client"
import {useEffect} from 'react'
import {useSettings} from '../hooks/useSettings'

export default function ThemeSync() {
  const {settings, ready} = useSettings()

  useEffect(() => {
    if (!ready) return

    const root = document.documentElement
    const theme = settings.themePreset ?? 'cozy'
    const mode = settings.colorMode ?? 'system'

    root.dataset.theme = theme
    root.dataset.colorMode = mode
  }, [ready, settings.colorMode, settings.themePreset])

  return null
}

