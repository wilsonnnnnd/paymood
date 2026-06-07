import React from 'react'
import type { Settings } from '../../hooks/useSettings'
import { SettingGroup } from './setting-group'
import { SettingInput } from './setting-input'
import { SettingRow } from './setting-row'
import { SettingSection } from './setting-section'
import { SettingSelect } from './setting-select'
import { SettingToggle } from './setting-toggle'

export type WeekdayChoice = {
  label: string
  value: number
}

export default function AdvancedSection({
  breakMinutes,
  workDays,
  weekdayChoices,
  currency,
  onBreakMinutesChange,
  onWorkDaysChange,
  onCurrencyChange,
}: {
  breakMinutes: number
  workDays: number[]
  weekdayChoices: WeekdayChoice[]
  currency: Settings['currency']
  onBreakMinutesChange: (value: number) => void
  onWorkDaysChange: (value: number[]) => void
  onCurrencyChange: (value: Settings['currency']) => void
}) {
  return (
    <SettingSection title="高级设置" description="用于更精细地校准工作节奏和显示方式。" tone="quiet">
      <SettingGroup>
        <SettingRow label="工作日" description="用于周/月收入估算，不会创建提醒。">
          <div className="setting-weekdays" role="group" aria-label="工作日">
            {weekdayChoices.map((day) => {
              const pressed = workDays.includes(day.value)
              return (
                <SettingToggle
                  key={day.label}
                  pressed={pressed}
                  size="compact"
                  onClick={() => {
                    const next = pressed ? workDays.filter((d) => d !== day.value) : [...workDays, day.value]
                    onWorkDaysChange(next)
                  }}
                >
                  {day.label}
                </SettingToggle>
              )
            })}
          </div>
        </SettingRow>

        <SettingRow
          label="午休 / 不计薪时间"
          description="从收入计算时段中扣除的分钟数。"
          controlId="settings-break-minutes"
        >
          <SettingInput
            id="settings-break-minutes"
            value={String(breakMinutes)}
            onChange={(e) => onBreakMinutesChange(Number(e.target.value) || 0)}
            type="number"
            min={0}
            inputMode="numeric"
          />
        </SettingRow>

        <SettingRow label="币种" description="只影响金额显示方式，不改变你的原始薪资设置。" controlId="settings-currency">
          <SettingSelect
            id="settings-currency"
            value={(currency ?? 'AUD').toUpperCase()}
            onChange={(e) => onCurrencyChange(e.target.value as Settings['currency'])}
          >
            <option value="AUD">澳元（AUD）</option>
            <option value="CNY">人民币（CNY）</option>
          </SettingSelect>
        </SettingRow>
      </SettingGroup>
    </SettingSection>
  )
}
