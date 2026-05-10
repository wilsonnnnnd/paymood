"use client"
import React from 'react'
import {useSettings} from '../hooks/useSettings'

export default function SettingsForm() {
  const {settings, updateSettings} = useSettings()

  return (
    <form className="settings-form">
      <label>
        <span>Start time</span>
        <input value={settings.startTime} onChange={e => updateSettings({startTime: e.target.value})} type="time" />
      </label>

      <label>
        <span>End time</span>
        <input value={settings.endTime} onChange={e => updateSettings({endTime: e.target.value})} type="time" />
      </label>

      <label>
        <span>Break minutes</span>
        <input value={String(settings.breakMinutes)} onChange={e => updateSettings({breakMinutes: Number(e.target.value) || 0})} type="number" min={0} />
      </label>

      <label>
        <span>Salary amount</span>
        <input value={String(settings.salaryAmount)} onChange={e => updateSettings({salaryAmount: Number(e.target.value) || 0})} type="number" min={0} />
      </label>

      <label>
        <span>Salary type</span>
        <select value={settings.salaryType} onChange={e => updateSettings({salaryType: e.target.value as any})}>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="fortnightly">Fortnightly</option>
          <option value="monthly">Monthly</option>
          <option value="annually">Annually</option>
        </select>
      </label>

      <label>
        <span>Currency</span>
        <input value={settings.currency} onChange={e => updateSettings({currency: e.target.value})} />
      </label>
    </form>
  )
}
