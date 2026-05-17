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
  const workDays = settings.workDays ?? []
  const payLocked = settings.payLocked === true || (settings.salaryAmount ?? 0) > 0

  return (
    <form className="hud-controls-grid">
      <label className="hud-control">
        <span className="hud-control-label">上班时间</span>
        <input className="hud-control-input" value={settings.startTime} onChange={e => updateSettings({startTime: e.target.value})} type="time" />
      </label>

      <label className="hud-control">
        <span className="hud-control-label">下班时间</span>
        <input className="hud-control-input" value={settings.endTime} onChange={e => updateSettings({endTime: e.target.value})} type="time" />
      </label>

      <label className="hud-control">
        <span className="hud-control-label">休息（分钟）</span>
        <input className="hud-control-input" value={String(settings.breakMinutes)} onChange={e => updateSettings({breakMinutes: Number(e.target.value) || 0})} type="number" min={0} inputMode="numeric" />
      </label>

      {payLocked ? (
        <div className="hud-control hud-control-wide">
          <span className="hud-control-label">薪资</span>
          <div className="hud-locked-row">
            <span className="hud-locked-text">已锁定</span>
            <button
              type="button"
              className="hud-reset"
              onClick={() => {
                const ok = window.confirm('要重置薪资吗？这会清空已保存的薪资金额。')
                if (!ok) return
                updateSettings({salaryAmount: 0, salaryType: 'hourly', payLocked: false})
              }}
            >
              重置薪资
            </button>
          </div>
        </div>
      ) : (
        <>
          <label className="hud-control hud-control-wide">
            <span className="hud-control-label">薪资金额</span>
            <div className="hud-sensitive hud-control-input">
              <input
                className="hud-control-input-inner"
                value={String(settings.salaryAmount)}
                onChange={e => {
                  const next = Number(e.target.value) || 0
                  updateSettings({salaryAmount: next, payLocked: next > 0 ? true : false})
                }}
                type={showPaySeed ? 'number' : 'password'}
                inputMode="decimal"
                min={0}
              />
              <button type="button" className="hud-privacy-toggle" onClick={() => setShowPaySeed(current => !current)}>
                {showPaySeed ? '隐藏' : '查看'}
              </button>
            </div>
          </label>

          <label className="hud-control">
            <span className="hud-control-label">薪资类型</span>
            <select className="hud-control-input" value={settings.salaryType} onChange={e => updateSettings({salaryType: e.target.value as any})}>
              <option value="hourly">时薪</option>
              <option value="daily">日薪</option>
              <option value="weekly">周薪</option>
              <option value="fortnightly">双周薪</option>
              <option value="monthly">月薪</option>
              <option value="annually">年薪</option>
            </select>
          </label>
        </>
      )}

      <label className="hud-control">
        <span className="hud-control-label">货币</span>
        <select className="hud-control-input" value={(settings.currency ?? 'AUD').toUpperCase()} onChange={e => updateSettings({currency: e.target.value})}>
          <option value="AUD">澳元（AUD）</option>
          <option value="CNY">人民币（CNY）</option>
        </select>
      </label>

      <fieldset className="hud-control hud-control-wide">
        <legend className="hud-control-label">工作日</legend>
        <div className="hud-weekdays" role="group" aria-label="工作日">
          {[
            {label: '一', value: 1},
            {label: '二', value: 2},
            {label: '三', value: 3},
            {label: '四', value: 4},
            {label: '五', value: 5},
            {label: '六', value: 6},
            {label: '日', value: 0},
          ].map(day => {
            const pressed = workDays.includes(day.value)
            return (
              <button
                key={day.label}
                type="button"
                className="hud-weekday"
                aria-pressed={pressed}
                onClick={() => {
                  const next = pressed ? workDays.filter(d => d !== day.value) : [...workDays, day.value]
                  updateSettings({workDays: next})
                }}
              >
                {day.label}
              </button>
            )
          })}
        </div>
      </fieldset>
    </form>
  )
}
