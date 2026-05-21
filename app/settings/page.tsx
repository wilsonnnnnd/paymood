'use client'
import React from 'react'
import Link from 'next/link'
import SettingsForm from '../../components/SettingsForm'
import ColorModeToggle from '../../components/ColorModeToggle'
import { useSettings } from '../../hooks/useSettings'

export default function SettingsPage() {
  const { ready } = useSettings()

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
        <section className="settings-stage" aria-label="设置">
          <SettingsForm />
          <p className="settings-footnote" aria-label="货币提示">
            货币与工作时间会影响你的进度与收入展示。
          </p>
          <nav className="settings-footnote" aria-label="Site information">
            <Link href="/about">About</Link> <Link href="/privacy">Privacy</Link>{' '}
            <Link href="/terms">Terms</Link> <Link href="/contact">Contact</Link>
          </nav>
        </section>
      </section>
    </main>
  )
}
