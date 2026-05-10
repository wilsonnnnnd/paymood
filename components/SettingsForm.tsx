"use client"
import React from 'react'
import {useSettings} from '../hooks/useSettings'

export default function SettingsForm() {
  const {settings, updateSettings} = useSettings()

  return (
    <form className="grid grid-cols-2 gap-3">
      <label className="flex flex-col text-sm">
        Start time
        <input value={settings.startTime} onChange={e => updateSettings({startTime: e.target.value})} className="border p-2 rounded mt-1" type="time" />
      </label>

      <label className="flex flex-col text-sm">
        End time
        <input value={settings.endTime} onChange={e => updateSettings({endTime: e.target.value})} className="border p-2 rounded mt-1" type="time" />
      </label>

      <label className="flex flex-col text-sm">
        Break minutes
        <input value={String(settings.breakMinutes)} onChange={e => updateSettings({breakMinutes: Number(e.target.value) || 0})} className="border p-2 rounded mt-1" type="number" min={0} />
      </label>

      <label className="flex flex-col text-sm">
        Salary amount
        <input value={String(settings.salaryAmount)} onChange={e => updateSettings({salaryAmount: Number(e.target.value) || 0})} className="border p-2 rounded mt-1" type="number" min={0} />
      </label>

      <label className="flex flex-col text-sm">
        Salary type
        <select value={settings.salaryType} onChange={e => updateSettings({salaryType: e.target.value as any})} className="border p-2 rounded mt-1">
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="fortnightly">Fortnightly</option>
          <option value="monthly">Monthly</option>
          <option value="annually">Annually</option>
        </select>
      </label>

      <label className="flex flex-col text-sm">
        Currency
        <input value={settings.currency} onChange={e => updateSettings({currency: e.target.value})} className="border p-2 rounded mt-1" />
      </label>
    </form>
  )
}
