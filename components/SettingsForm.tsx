'use client'
import React, { useEffect, useState } from 'react'
import { useSettings } from '../hooks/useSettings'
import type { Settings } from '../hooks/useSettings'
import { salaryBoundsByType } from '../lib/settings'
import ConfirmModal from './ui/ConfirmModal'
import {
  SettingAction,
  SettingDescription,
  SettingGroup,
  SettingInput,
  SettingRow,
  SettingSection,
  SettingSelect,
  SettingTimeInput,
  SettingToggle,
} from './settings'

import slime1Idle from '../craftpix/PNG/Slime1/With_shadow/Slime1_Idle_with_shadow.png'
import slime2Idle from '../craftpix/PNG/Slime2/With_shadow/Slime2_Idle_with_shadow.png'
import slime3Idle from '../craftpix/PNG/Slime3/With_shadow/Slime3_Idle_with_shadow.png'

const salaryTypeOptions: Array<{ value: Settings['salaryType']; label: string }> = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annually', label: 'Annually' },
]

function PetIcon({ sheet }: { sheet: { height: number; width: number; src: string } }) {
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

export default function SettingsForm() {
  const { settings, updateSettings } = useSettings()
  const [salaryDraft, setSalaryDraft] = useState('')
  const [salaryTypeDraft, setSalaryTypeDraft] = useState<Settings['salaryType']>(() => settings.salaryType ?? 'hourly')
  const [salaryConfirmOpen, setSalaryConfirmOpen] = useState(false)
  const [prefersDark, setPrefersDark] = useState(false)

  const workDays = settings.workDays ?? []
  const payLocked = settings.payLocked === true
  const colorMode = settings.colorMode ?? 'system'
  const petEnabled = settings.petEnabled !== false
  const petVariant = settings.petVariant ?? 'aqua'
  const salaryAmountNumber = Number(salaryDraft)
  const activeSalaryBounds = salaryBoundsByType[salaryTypeDraft]
  const salaryDraftValid =
    Number.isFinite(salaryAmountNumber) && salaryAmountNumber > 0 && salaryAmountNumber <= activeSalaryBounds.max

  useEffect(() => {
    if (payLocked) return
    setSalaryDraft('')
    setSalaryTypeDraft(settings.salaryType ?? 'hourly')
  }, [payLocked, settings.salaryType])

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setPrefersDark(media.matches)
    handler()
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  const colorModeLabel =
    colorMode === 'system' ? (prefersDark ? '跟随系统（深色）' : '跟随系统（浅色）') : colorMode === 'light' ? '浅色' : '深色'

  const weekdayChoices = [
    { label: '一', value: 1 },
    { label: '二', value: 2 },
    { label: '三', value: 3 },
    { label: '四', value: 4 },
    { label: '五', value: 5 },
    { label: '六', value: 6 },
    { label: '日', value: 0 },
  ]

  const saveSalary = () => {
    if (!salaryDraftValid) return
    updateSettings({ salaryType: salaryTypeDraft, salaryAmount: salaryAmountNumber, payLocked: true })
    setSalaryDraft('')
  }

  return (
    <>
      <form className="settings-system" aria-label="设置表单">
        <div className="settings-overview" aria-label="设置摘要">
          <div>
            <span>Stored locally</span>
            <strong>Saved on this device only</strong>
          </div>
          <div>
            <span>Live estimate</span>
            <strong>Used for progress and earnings</strong>
          </div>
          <div>
            <span>Quiet companion</span>
            <strong>{petEnabled ? '桌宠已开启' : '桌宠已关闭'}</strong>
          </div>
        </div>

        <SettingSection title="Workspace" description="界面偏好和陪伴感放在这里，不影响收入计算。" tone="quiet">
          <SettingRow label="主题模式" description="当前颜色模式会跟随系统或固定为你选择的状态。" value={colorModeLabel} />

          <SettingRow
            label="桌宠"
            description="默认开启。关闭后将不再显示，也不会消耗动画与计时性能。"
            value={petEnabled ? '开启' : '关闭'}
            density="quiet"
          >
            <SettingToggle
              aria-label={petEnabled ? '关闭桌宠' : '开启桌宠'}
              pressed={petEnabled}
              onClick={() => updateSettings({ petEnabled: !petEnabled })}
            >
              {petEnabled ? '开' : '关'}
            </SettingToggle>
          </SettingRow>

          {petEnabled ? (
            <SettingRow label="陪伴角色" description="选择一个在工作日里安静陪着你的角色。" density="quiet">
              <div className="setting-pet-grid">
                {[
                  { key: 'aqua' as const, label: 'Aqua Slime', sheet: slime1Idle },
                  { key: 'undead' as const, label: 'Undead Slime', sheet: slime2Idle },
                  { key: 'magma' as const, label: 'Magma Slime', sheet: slime3Idle },
                ].map((item) => (
                  <SettingToggle
                    key={item.key}
                    className="setting-pet-choice"
                    aria-label={item.label}
                    pressed={petVariant === item.key}
                    onClick={() => updateSettings({ petVariant: item.key })}
                  >
                    <PetIcon sheet={item.sheet} />
                  </SettingToggle>
                ))}
              </div>
            </SettingRow>
          ) : null}
        </SettingSection>

        <SettingSection title="Work schedule" description="Used for progress, time remaining, and earning estimates." tone="default">
          <SettingGroup>
            <SettingRow label="Start" controlId="settings-start-time">
              <SettingTimeInput
                id="settings-start-time"
                value={settings.startTime}
                onChange={(e) => updateSettings({ startTime: e.target.value })}
              />
            </SettingRow>

            <SettingRow label="End" controlId="settings-end-time">
              <SettingTimeInput
                id="settings-end-time"
                value={settings.endTime}
                onChange={(e) => updateSettings({ endTime: e.target.value })}
              />
            </SettingRow>

            <SettingRow label="Break" description="Minutes removed from the earning window." controlId="settings-break-minutes">
              <SettingInput
                id="settings-break-minutes"
                value={String(settings.breakMinutes)}
                onChange={(e) => updateSettings({ breakMinutes: Number(e.target.value) || 0 })}
                type="number"
                min={0}
                inputMode="numeric"
              />
            </SettingRow>
          </SettingGroup>

          <SettingRow label="Work days" description="Used for week and month estimates; no reminders are created.">
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
                      updateSettings({ workDays: next })
                    }}
                  >
                    {day.label}
                  </SettingToggle>
                )
              })}
            </div>
          </SettingRow>
        </SettingSection>

        <SettingSection title="Pay model" description="Stored locally and used only for estimates." tone="vault">
          {payLocked ? (
            <SettingGroup density="loose">
              <div className="setting-vault-state">
                <div>
                  <div className="setting-vault-state__label">薪资已保存</div>
                  <SettingDescription tone="quiet">具体金额已隐藏。若要修改，需要先重置后重新输入。</SettingDescription>
                </div>
                <SettingAction
                  variant="quiet"
                  onClick={() => {
                    setSalaryDraft('')
                    setSalaryTypeDraft('hourly')
                    updateSettings({ salaryAmount: 0, salaryType: 'hourly', payLocked: false })
                  }}
                >
                  重置薪资
                </SettingAction>
              </div>
              <SettingDescription tone="quiet">数据仅保存在当前设备，不会上传服务器。</SettingDescription>
              <SettingDescription tone="quiet">清除缓存、隐身模式或更换设备会导致数据丢失。</SettingDescription>
            </SettingGroup>
          ) : (
            <SettingGroup density="loose">
              <div className="setting-salary-entry">
                <SettingInput
                  tone="vault"
                  value={salaryDraft}
                  onChange={(e) => setSalaryDraft(e.target.value)}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={activeSalaryBounds.max}
                  step="any"
                  placeholder="Amount"
                  aria-label="Amount"
                />
                <SettingSelect
                  tone="vault"
                  value={salaryTypeDraft}
                  onChange={(e) => setSalaryTypeDraft(e.target.value as Settings['salaryType'])}
                  aria-label="Type"
                >
                  {salaryTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SettingSelect>
                <SettingAction variant="primary" disabled={!salaryDraftValid} onClick={() => setSalaryConfirmOpen(true)}>
                  保存
                </SettingAction>
              </div>
              <SettingDescription tone="quiet">保存后将无法再次查看具体薪资金额，只能重置后重新输入。</SettingDescription>
            </SettingGroup>
          )}
        </SettingSection>

        <SettingSection title="Display" description="只影响金额显示方式，不改变你的原始薪资设置。" tone="quiet">
          <SettingRow label="Currency" controlId="settings-currency">
            <SettingSelect
              id="settings-currency"
              value={(settings.currency ?? 'AUD').toUpperCase()}
              onChange={(e) => updateSettings({ currency: e.target.value as Settings['currency'] })}
            >
              <option value="AUD">澳元（AUD）</option>
              <option value="CNY">人民币（CNY）</option>
            </SettingSelect>
          </SettingRow>
        </SettingSection>
      </form>

      <ConfirmModal
        open={salaryConfirmOpen}
        onOpenChange={setSalaryConfirmOpen}
        title="保存薪资到本机"
        description="保存后具体金额不会在设置页再次显示。之后如需修改，请先重置再重新输入。"
        confirmText="保存"
        cancelText="再想想"
        variant="success"
        onConfirm={saveSalary}
      />
    </>
  )
}
