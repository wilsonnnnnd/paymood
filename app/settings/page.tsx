"use client"
import React from 'react'
import Link from 'next/link'
import SettingsForm from '../../components/SettingsForm'
import {useSettings} from '../../hooks/useSettings'

export default function SettingsPage() {
  const {settings, updateSettings, ready} = useSettings()

  return (
    <main className="app-shell">
      <section className="hud-shell" aria-label="Settings">
        <Link className="hud-icon-button" href="/" aria-label="返回仪表盘">
          <span aria-hidden="true">←</span>
        </Link>
        <header className="hud-header">
          <div className="hud-title">Cozy Earnings Dashboard</div>
          <div className="hud-mood" aria-label="设置状态">
            {ready ? '设置' : '热身中…'}
          </div>
        </header>

        <main className="hud-controls" aria-label="Controls">
          <SettingsForm settings={settings} updateSettings={updateSettings} />
          <div className="hud-footnote" aria-label="货币提示">
            货币从下拉选择（AUD / CNY）。
          </div>
        </main>
      </section>
    </main>
  )
}
