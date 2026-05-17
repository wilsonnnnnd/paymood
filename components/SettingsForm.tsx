'use client'
import React, { useEffect, useState } from 'react'
import { useSettings } from '../hooks/useSettings'
import type { Settings } from '../hooks/useSettings'

import slime1Idle from '../craftpix/PNG/Slime1/With_shadow/Slime1_Idle_with_shadow.png'
import slime2Idle from '../craftpix/PNG/Slime2/With_shadow/Slime2_Idle_with_shadow.png'
import slime3Idle from '../craftpix/PNG/Slime3/With_shadow/Slime3_Idle_with_shadow.png'

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
  const [prefersDark, setPrefersDark] = useState(false)
  const colorMode = settings.colorMode ?? 'system'
  const petVariant = settings.petVariant ?? 'aqua'

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setPrefersDark(media.matches)
    handler()
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  const effectiveDark = colorMode === 'dark' || (colorMode === 'system' && prefersDark)
  const colorModeLabel =
    colorMode === 'system'
      ? prefersDark
        ? '跟随系统（深色）'
        : '跟随系统（浅色）'
      : colorMode === 'light'
      ? '浅色'
      : '深色'

  const MetricRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="hud-metric settings-metric">
      <span className="hud-metric-label">{label}</span>
      <div className="settings-metric-control">{children}</div>
    </div>
  )

  const PetIcon = ({ sheet }: { sheet: typeof slime1Idle }) => {
    const rowCount = 4
    const frameSize = Math.floor(sheet.height / rowCount)
    const size = 40
    const scale = size / frameSize
    return (
      <span
        aria-hidden="true"
        className="block"
        style={{
          width: size,
          height: size,
          backgroundImage: `url(${sheet.src})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${sheet.width * scale}px ${sheet.height * scale}px`,
          backgroundPosition: '0px 0px',
        }}
      />
    )
  }

  const weekdayChoices = [
    { label: '一', value: 1 },
    { label: '二', value: 2 },
    { label: '三', value: 3 },
    { label: '四', value: 4 },
    { label: '五', value: 5 },
    { label: '六', value: 6 },
    { label: '日', value: 0 },
  ]

  return (
    <form className="settings-metric-list">
      <MetricRow label="主题模式">
        <span className="settings-metric-value">{colorModeLabel}</span>
      </MetricRow>

      <MetricRow label="宠物">
        <div className="flex items-center gap-2">
          {[
            { key: 'aqua' as const, label: 'Aqua Slime', sheet: slime1Idle },
            { key: 'undead' as const, label: 'Undead Slime', sheet: slime2Idle },
            { key: 'magma' as const, label: 'Magma Slime', sheet: slime3Idle },
          ].map((item) => {
            const selected = petVariant === item.key
            return (
              <button
                key={item.key}
                type="button"
                aria-label={item.label}
                aria-pressed={selected}
                onClick={() => updateSettings({ petVariant: item.key })}
                className={[
                  'grid h-12 w-12 place-items-center rounded-2xl border',
                  'bg-[var(--surface-strong)] backdrop-blur-xl',
                  selected
                    ? 'border-[color:var(--accent)] shadow-[0_0_0_1px_rgba(245,158,11,0.35),_0_16px_36px_var(--accent-glow)]'
                    : 'border-[var(--border)]',
                ].join(' ')}
              >
                <PetIcon sheet={item.sheet} />
              </button>
            )
          })}
        </div>
      </MetricRow>

      <MetricRow label="上班时间">
        <input
          className="hud-control-input"
          value={settings.startTime}
          onChange={(e) => updateSettings({ startTime: e.target.value })}
          type="time"
        />
      </MetricRow>

      <MetricRow label="下班时间">
        <input
          className="hud-control-input"
          value={settings.endTime}
          onChange={(e) => updateSettings({ endTime: e.target.value })}
          type="time"
        />
      </MetricRow>

      <MetricRow label="休息（分钟）">
        <input
          className="hud-control-input"
          value={String(settings.breakMinutes)}
          onChange={(e) => updateSettings({ breakMinutes: Number(e.target.value) || 0 })}
          type="number"
          min={0}
          inputMode="numeric"
        />
      </MetricRow>

      {payLocked ? (
        <MetricRow label="薪资">
          <div className="hud-locked-row">
            <span className="hud-locked-text">已锁定</span>
            <button
              type="button"
              className="hud-reset"
              onClick={() => {
                const ok = window.confirm('要重置薪资吗？这会清空已保存的薪资金额。')
                if (!ok) return
                updateSettings({ salaryAmount: 0, salaryType: 'hourly', payLocked: false })
              }}
            >
              重置薪资
            </button>
          </div>
        </MetricRow>
      ) : (
        <>
          <MetricRow label="薪资金额">
            <div className="hud-sensitive hud-control-input">
              <input
                className="hud-control-input-inner"
                value={String(settings.salaryAmount)}
                onChange={(e) => {
                  const next = Number(e.target.value) || 0
                  updateSettings({ salaryAmount: next, payLocked: next > 0 ? true : false })
                }}
                type={showPaySeed ? 'number' : 'password'}
                inputMode="decimal"
                min={0}
              />
              <button
                type="button"
                className="hud-privacy-toggle"
                onClick={() => setShowPaySeed((current) => !current)}
              >
                {showPaySeed ? '隐藏' : '查看'}
              </button>
            </div>
          </MetricRow>

          <MetricRow label="薪资类型">
            <select
              className="hud-control-input"
              value={settings.salaryType}
              onChange={(e) => updateSettings({ salaryType: e.target.value as any })}
            >
              <option value="hourly">时薪</option>
              <option value="daily">日薪</option>
              <option value="weekly">周薪</option>
              <option value="fortnightly">双周薪</option>
              <option value="monthly">月薪</option>
              <option value="annually">年薪</option>
            </select>
          </MetricRow>
        </>
      )}

      <MetricRow label="货币">
        <select
          className="hud-control-input"
          value={(settings.currency ?? 'AUD').toUpperCase()}
          onChange={(e) => updateSettings({ currency: e.target.value })}
        >
          <option value="AUD">澳元（AUD）</option>
          <option value="CNY">人民币（CNY）</option>
        </select>
      </MetricRow>

      <MetricRow label="工作日">
        <div className="hud-weekdays" role="group" aria-label="工作日">
          {weekdayChoices.map((day) => {
            const pressed = workDays.includes(day.value)
            return (
              <button
                key={day.label}
                type="button"
                className="hud-weekday"
                aria-pressed={pressed}
                onClick={() => {
                  const next = pressed ? workDays.filter((d) => d !== day.value) : [...workDays, day.value]
                  updateSettings({ workDays: next })
                }}
              >
                {day.label}
              </button>
            )
          })}
        </div>
      </MetricRow>
    </form>
  )
}
