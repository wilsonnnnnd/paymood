"use client"
import React from 'react'
import CircularProgress from './CircularProgress'
import SettingsForm from './SettingsForm'
import {useSettings} from '../hooks/useSettings'
import {useClock} from '../hooks/useClock'
import {earnedSoFar, workProgress} from '../lib/earnings'

export default function Dashboard() {
  const {settings, updateSettings, ready} = useSettings()
  const now = useClock(1000)
  const isReady = ready && now !== null

  const today = now ?? new Date(0)
  const [y, m, d] = [today.getFullYear(), today.getMonth(), today.getDate()]
  const [sh, sm] = settings.startTime.split(':').map(Number)
  const [eh, em] = settings.endTime.split(':').map(Number)
  const start = new Date(y, m, d, sh, sm)
  const end = new Date(y, m, d, eh, em)

  const prog = isReady ? workProgress(today, start, end, settings.breakMinutes) : {progress: 0, elapsedSeconds: 0, remainingSeconds: 0, totalWorkSeconds: 0}
  const {earned, hourly} = isReady ? earnedSoFar(today, start, end, settings.breakMinutes, settings.salaryAmount, settings.salaryType) : {earned: 0, hourly: 0}
  const percent = Math.round(prog.progress * 100)
  const remainingMinutes = Math.max(0, Math.floor(prog.remainingSeconds / 60))
  const workedMinutes = Math.max(0, Math.floor(prog.elapsedSeconds / 60))

  return (
    <section className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Tiny payday garden</p>
          <h1>Today&apos;s happy little tally</h1>
        </div>
        <div className="live-status" aria-label="Live calculation status">
          <span />
          Ticking
        </div>
      </header>

      <div className="dashboard-grid">
        <section className="progress-panel" aria-label="Workday progress">
          <div className="progress-copy">
            <p className="section-label">Day bloom</p>
            <h2>{percent}% done</h2>
            <p>{isReady ? `${remainingMinutes} cozy minutes until today wraps up.` : 'Warming up your cozy numbers.'}</p>
          </div>
          <CircularProgress value={prog.progress} size={184} />
        </section>

        <section className="earnings-panel" aria-label="Earnings summary">
          <p className="section-label">Money jar</p>
          <div className="money-line">
            {earned.toFixed(2)}
            <span>{settings.currency}</span>
          </div>
          <div className="metric-row">
            <div>
              <span className="metric-label">Per hour</span>
              <strong>{hourly.toFixed(2)}</strong>
            </div>
            <div>
              <span className="metric-label">Time grown</span>
              <strong>{workedMinutes}m</strong>
            </div>
            <div>
              <span className="metric-label">Tiny wait</span>
              <strong>{remainingMinutes}m</strong>
            </div>
          </div>
        </section>

        <section className="settings-panel" aria-label="Settings">
          <details open>
            <summary>
              <span>Little knobs</span>
              <span className="summary-hint">Set your day&apos;s cozy rhythm</span>
            </summary>
            <SettingsForm settings={settings} updateSettings={updateSettings} />
          </details>
        </section>
      </div>
    </section>
  )
}
