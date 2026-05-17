'use client'
import React from 'react'
import Link from 'next/link'
import SettingsForm from '../../components/SettingsForm'
import ColorModeToggle from '../../components/ColorModeToggle'
import { useSettings } from '../../hooks/useSettings'

export default function SettingsPage() {
  const { settings, updateSettings, ready } = useSettings()

  return (
    <main className="app-shell settings-page">
      <section className="settings-shell" aria-label="Settings">
        {/* Top-bar actions — float above the hero */}
        <div className="hud-top-actions" aria-label="顶部操作">
          <ColorModeToggle />
          <Link className="hud-icon-button" href="/" aria-label="返回仪表盘">
            <span aria-hidden="true">←</span>
          </Link>
        </div>

        {/* Hero — big, quiet title */}
        <header className="settings-hero">
          <div className="settings-hero__eyebrow">PayMood</div>
          <h1 className="settings-hero__title">{ready ? 'Settings' : 'Warming up…'}</h1>
          <div className="settings-hero__subtitle" aria-label="域名">
            paymood.work
          </div>
        </header>

        {/* Settings system */}
        <main className="settings-stage" aria-label="设置">
          <SettingsForm settings={settings} updateSettings={updateSettings} />
          <p className="settings-footnote" aria-label="货币提示">
            货币与工作时间会影响你的进度与收入展示。
          </p>
        </main>
      </section>
    </main>
  )
}

