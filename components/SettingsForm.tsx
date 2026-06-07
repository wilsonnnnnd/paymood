'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useSettings } from '../hooks/useSettings'
import type { Settings } from '../hooks/useSettings'
import { normalizeSalaryToHourly } from '../lib/earnings'
import { salaryBoundsByType, currencySymbols } from '../lib/settings'
import { formatLocalDate, paydayDayFromDate, validateLastPaydayDate } from '../lib/payCycle'
import { trackEvent } from '../lib/analytics'
import ConfirmModal from './ui/ConfirmModal'
import {
  AdvancedSection,
  DisplaySection,
  PayCycleSection,
  QuickSetupSection,
  type SalaryTypeOption,
  type WeekdayChoice,
} from './settings'

const salaryTypeOptions: SalaryTypeOption[] = [
  { value: 'hourly', label: '时薪' },
  { value: 'daily', label: '日薪' },
  { value: 'weekly', label: '周薪' },
  { value: 'fortnightly', label: '双周薪' },
  { value: 'monthly', label: '月薪' },
  { value: 'annually', label: '年薪' },
]

const weekdayChoices: WeekdayChoice[] = [
  { label: '一', value: 1 },
  { label: '二', value: 2 },
  { label: '三', value: 3 },
  { label: '四', value: 4 },
  { label: '五', value: 5 },
  { label: '六', value: 6 },
  { label: '日', value: 0 },
]

function getCurrencySymbol(code: Settings['currency']) {
  const normalized = (code ?? 'AUD').toUpperCase() as keyof typeof currencySymbols
  return currencySymbols[normalized] ?? '$'
}

export default function SettingsForm() {
  const { settings, updateSettings } = useSettings()
  const [salaryDraft, setSalaryDraft] = useState('')
  const [salaryTypeDraft, setSalaryTypeDraft] = useState<Settings['salaryType']>(() => settings.salaryType ?? 'hourly')
  const [salaryConfirmOpen, setSalaryConfirmOpen] = useState(false)
  const [paydayConfirmOpen, setPaydayConfirmOpen] = useState(false)
  const [paydayDraft, setPaydayDraft] = useState(settings.lastPaydayDate ?? '')
  const [paydayError, setPaydayError] = useState<string | undefined>()
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
  const workDaysPerWeek = workDays.length ? workDays.length : 5

  const paydayStatusLabel = settings.lastPaydayDate ? `已设置：${settings.lastPaydayDate}` : '未设置'

  const estimatedHourly = useMemo(() => {
    if (!payLocked || settings.salaryAmount <= 0) return undefined

    const hourly = normalizeSalaryToHourly(settings.salaryAmount, settings.salaryType, { workDaysPerWeek })
    if (!Number.isFinite(hourly) || hourly <= 0) return undefined

    return `${getCurrencySymbol(settings.currency)}${hourly.toFixed(2)}/h`
  }, [payLocked, settings.currency, settings.salaryAmount, settings.salaryType, workDaysPerWeek])

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
    colorMode === 'system'
      ? prefersDark
        ? '跟随系统（深色）'
        : '跟随系统（浅色）'
      : colorMode === 'light'
      ? '浅色'
      : '深色'

  const saveSalary = () => {
    if (!salaryDraftValid) return
    updateSettings({ salaryType: salaryTypeDraft, salaryAmount: salaryAmountNumber, payLocked: true })
    setSalaryDraft('')
  }

  const resetSalary = () => {
    setSalaryDraft('')
    setSalaryTypeDraft('hourly')
    updateSettings({ salaryAmount: 0, salaryType: 'hourly', payLocked: false })
  }

  const openPaydayModal = () => {
    setPaydayError(undefined)
    setPaydayDraft(settings.lastPaydayDate ?? '')
    setPaydayConfirmOpen(true)
    trackEvent('payday_reset_opened')
  }

  const cancelPaydayModal = () => {
    setPaydayConfirmOpen(false)
    trackEvent('payday_reset_cancelled')
  }

  const submitPaydayDate = async (value?: string) => {
    const payloadValue = value ?? paydayDraft
    trackEvent('payday_reset_submitted', { value: payloadValue })
    const validation = validateLastPaydayDate(payloadValue)
    if (!validation.valid) {
      setPaydayError(validation.reason)
      trackEvent('payday_reset_invalid_date', { value: payloadValue, reason: validation.reason })
      trackEvent('payday_reset_failed', { reason: validation.reason })
      throw new Error(validation.reason)
    }
    const formatted = formatLocalDate(validation.date)
    const paydayDayOfMonth = paydayDayFromDate(validation.date)
    updateSettings({ lastPaydayDate: formatted, paydayDayOfMonth })
    trackEvent('payday_reset_success', { lastPaydayDate: formatted, paydayDayOfMonth })
  }

  const resetPaydayCycle = () => {
    updateSettings({ lastPaydayDate: undefined, paydayDayOfMonth: undefined })
    trackEvent('payday_reset_success', { lastPaydayDate: undefined, paydayDayOfMonth: undefined })
  }

  return (
    <>
      <form className="settings-system" aria-label="设置表单">
        <QuickSetupSection
          payLocked={payLocked}
          salaryDraft={salaryDraft}
          salaryTypeDraft={salaryTypeDraft}
          salaryTypeOptions={salaryTypeOptions}
          salaryDraftValid={salaryDraftValid}
          activeSalaryMax={activeSalaryBounds.max}
          estimatedHourly={estimatedHourly}
          startTime={settings.startTime}
          endTime={settings.endTime}
          onSalaryDraftChange={setSalaryDraft}
          onSalaryTypeDraftChange={setSalaryTypeDraft}
          onSaveSalary={() => setSalaryConfirmOpen(true)}
          onResetSalary={resetSalary}
          onStartTimeChange={(startTime) => updateSettings({ startTime })}
          onEndTimeChange={(endTime) => updateSettings({ endTime })}
        />

        <PayCycleSection
          paydayStatusLabel={paydayStatusLabel}
          hasPayday={Boolean(settings.lastPaydayDate)}
          onOpenPayday={openPaydayModal}
          onResetPayday={resetPaydayCycle}
        />

        <DisplaySection
          colorModeLabel={colorModeLabel}
          petEnabled={petEnabled}
          petVariant={petVariant}
          onPetEnabledChange={(petEnabled) => updateSettings({ petEnabled })}
          onPetVariantChange={(petVariant) => updateSettings({ petVariant })}
        />

        <AdvancedSection
          breakMinutes={settings.breakMinutes}
          workDays={workDays}
          weekdayChoices={weekdayChoices}
          currency={settings.currency}
          onBreakMinutesChange={(breakMinutes) => updateSettings({ breakMinutes })}
          onWorkDaysChange={(workDays) => updateSettings({ workDays })}
          onCurrencyChange={(currency) => updateSettings({ currency })}
        />
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
      <ConfirmModal
        open={paydayConfirmOpen}
        onOpenChange={setPaydayConfirmOpen}
        title="我的发薪日"
        description="使用最近一次实际到账日期校准当前薪资周期。"
        confirmText="保存"
        cancelText="取消"
        variant="success"
        confirmationLabel="最近一次实际工资到账日期"
        confirmationInputType="date"
        confirmationPlaceholder="选择日期"
        errorText={paydayError}
        onConfirm={submitPaydayDate}
        onCancel={cancelPaydayModal}
      />
    </>
  )
}
