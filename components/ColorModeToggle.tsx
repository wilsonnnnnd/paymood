"use client"
import React from 'react'
import {useSettings} from '../hooks/useSettings'

function nextMode(mode: 'system' | 'light' | 'dark') {
  if (mode === 'system') return 'light'
  if (mode === 'light') return 'dark'
  return 'system'
}

export default function ColorModeToggle() {
  const {settings, updateSettings} = useSettings()
  const mode = settings.colorMode ?? 'system'

  const label = mode === 'system' ? '跟随系统' : mode === 'light' ? '浅色' : '深色'
  const icon = mode === 'system' ? '◐' : mode === 'light' ? '☀' : '☾'

  return (
    <button
      type="button"
      className="hud-icon-button"
      aria-label={`主题模式：${label}，点击切换`}
      onClick={() => updateSettings({colorMode: nextMode(mode)})}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  )
}
