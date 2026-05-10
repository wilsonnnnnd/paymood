"use client"
import React, {useState} from 'react'
import {useSettings} from '../hooks/useSettings'
import type {Settings} from '../hooks/useSettings'

type Props = {
  settings?: Settings
  updateSettings?: (patch: Partial<Settings>) => void
}

export default function SettingsForm(props: Props) {
  const localSettings = useSettings()
  const settings = props.settings ?? localSettings.settings
  const updateSettings = props.updateSettings ?? localSettings.updateSettings
  const [showPaySeed, setShowPaySeed] = useState(false)

  return (
    <form className="settings-form">
      <label>
        <span>Start sparkle</span>
        <input value={settings.startTime} onChange={e => updateSettings({startTime: e.target.value})} type="time" />
      </label>

      <label>
        <span>Finish bell</span>
        <input value={settings.endTime} onChange={e => updateSettings({endTime: e.target.value})} type="time" />
      </label>

      <label>
        <span>Snack break</span>
        <input value={String(settings.breakMinutes)} onChange={e => updateSettings({breakMinutes: Number(e.target.value) || 0})} type="number" min={0} />
      </label>

      <label>
        <span>Pay seed</span>
        <div className="sensitive-input">
          <input
            value={String(settings.salaryAmount)}
            onChange={e => updateSettings({salaryAmount: Number(e.target.value) || 0})}
            type={showPaySeed ? 'number' : 'password'}
            inputMode="decimal"
            min={0}
          />
          <button type="button" className="privacy-toggle" onClick={() => setShowPaySeed(current => !current)}>
            {showPaySeed ? 'Hide' : 'Peek'}
          </button>
        </div>
      </label>

      <label>
        <span>Pay rhythm</span>
        <select value={settings.salaryType} onChange={e => updateSettings({salaryType: e.target.value as any})}>
          <option value="hourly">Hourly sprout</option>
          <option value="daily">Daily bundle</option>
          <option value="weekly">Weekly basket</option>
          <option value="fortnightly">Fortnight pouch</option>
          <option value="monthly">Monthly jar</option>
          <option value="annually">Yearly treasure</option>
        </select>
      </label>

      <label>
        <span>Coin tag</span>
        <input value={settings.currency} onChange={e => updateSettings({currency: e.target.value})} />
      </label>
    </form>
  )
}
