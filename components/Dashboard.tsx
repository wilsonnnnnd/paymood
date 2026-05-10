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

  // parse times from settings
  const today = new Date()
  const [y, m, d] = [today.getFullYear(), today.getMonth(), today.getDate()]
  const [sh, sm] = settings.startTime.split(':').map(Number)
  const [eh, em] = settings.endTime.split(':').map(Number)
  const start = new Date(y, m, d, sh, sm)
  const end = new Date(y, m, d, eh, em)

  const prog = workProgress(now, start, end, settings.breakMinutes)
  const {earned, hourly} = earnedSoFar(now, start, end, settings.breakMinutes, settings.salaryAmount, settings.salaryType)

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex gap-6 items-center">
        <CircularProgress value={prog.progress} />
        <div className="flex-1">
          <h2 className="text-2xl font-semibold">Workday Progress</h2>
          <p className="text-sm text-slate-500">{Math.round(prog.progress * 100)}% — {Math.max(0, Math.floor(prog.remainingSeconds / 60))} minutes remaining</p>
          <div className="mt-4 text-lg">
            <div>Hourly rate: {hourly.toFixed(2)}</div>
            <div className="text-2xl font-bold">Earned so far: {earned.toFixed(2)} {settings.currency}</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <details>
          <summary className="cursor-pointer text-sm text-slate-600">Settings</summary>
          <div className="mt-3">
            <SettingsForm />
          </div>
        </details>
      </div>
    </div>
  )
}
