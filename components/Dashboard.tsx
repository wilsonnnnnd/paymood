"use client"
import React from 'react'
import CircularProgress from './CircularProgress'
import SettingsForm from './SettingsForm'
import {useSettings} from '../hooks/useSettings'
import {useClock} from '../hooks/useClock'
import {earnedSoFar, workProgress} from '../lib/earnings'

export default function Dashboard() {
  const {settings} = useSettings()
  const now = useClock(1000)

  const today = new Date()
  const [y, m, d] = [today.getFullYear(), today.getMonth(), today.getDate()]
  const [sh, sm] = settings.startTime.split(':').map(Number)
  const [eh, em] = settings.endTime.split(':').map(Number)
  const start = new Date(y, m, d, sh, sm)
  const end = new Date(y, m, d, eh, em)

  const prog = workProgress(now, start, end, settings.breakMinutes)
  const {earned, hourly} = earnedSoFar(now, start, end, settings.breakMinutes, settings.salaryAmount, settings.salaryType)
  const percent = Math.round(prog.progress * 100)
  const remainingMinutes = Math.max(0, Math.floor(prog.remainingSeconds / 60))
  const workedMinutes = Math.max(0, Math.floor(prog.elapsedSeconds / 60))

  return (
    <section className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Workday earnings</p>
          <h1>Today&apos;s operating view</h1>
        </div>
        <div className="live-status" aria-label="Live calculation status">
          <span />
          Live
        </div>
      </header>

      <div className="dashboard-grid">
        <section className="progress-panel" aria-label="Workday progress">
          <div className="progress-copy">
            <p className="section-label">Progress</p>
            <h2>{percent}% complete</h2>
            <p>{remainingMinutes} minutes remaining in the active work window.</p>
          </div>
          <CircularProgress value={prog.progress} size={184} />
        </section>

        <section className="earnings-panel" aria-label="Earnings summary">
          <p className="section-label">Estimated earned</p>
          <div className="money-line">
            {earned.toFixed(2)}
            <span>{settings.currency}</span>
          </div>
          <div className="metric-row">
            <div>
              <span className="metric-label">Hourly rate</span>
              <strong>{hourly.toFixed(2)}</strong>
            </div>
            <div>
              <span className="metric-label">Worked</span>
              <strong>{workedMinutes}m</strong>
            </div>
            <div>
              <span className="metric-label">Remaining</span>
              <strong>{remainingMinutes}m</strong>
            </div>
          </div>
        </section>

        <section className="settings-panel" aria-label="Settings">
          <details open>
            <summary>
              <span>Settings</span>
              <span className="summary-hint">Schedule and salary inputs</span>
            </summary>
            <SettingsForm />
          </details>
        </section>
      </div>
    </section>
  )
}
