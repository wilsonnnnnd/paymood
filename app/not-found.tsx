import React from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="app-shell">
      <section className="hud-shell" aria-label="Not Found">
        <div className="hud-top-actions" aria-label="顶部操作">
          <Link className="hud-icon-button" href="/" aria-label="返回仪表盘">
            <span aria-hidden="true">←</span>
          </Link>
        </div>
        <header className="hud-header">
          <div className="hud-title">Cozy Earnings Dashboard</div>
          <div className="hud-mood" aria-label="状态">
            404
          </div>
        </header>
        <main className="hud-main hud-rest" aria-label="内容">
          <div className="hud-rest-panel">
            <div className="hud-rest-title">页面不在这里。</div>
            <div className="hud-rest-sub">点右上角返回仪表盘。</div>
          </div>
        </main>
      </section>
    </main>
  )
}
