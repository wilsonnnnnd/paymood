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
      <section className="settings-shell" aria-label="设置">
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
          <h1 className="settings-hero__title">{ready ? '设置' : '准备中…'}</h1>
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
          <nav className="settings-footnote" aria-label="站点信息">
            <Link href="/about">关于</Link> <Link href="/privacy">隐私</Link> <Link href="/terms">条款</Link>{' '}
            <Link href="/contact">联系</Link>
          </nav>
        </section>
      </section>
    </main>
  )
}
