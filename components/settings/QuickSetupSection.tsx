import React from 'react'
import type { Settings } from '../../hooks/useSettings'
import { SettingAction } from './setting-action'
import { SettingDescription } from './setting-description'
import { SettingGroup } from './setting-group'
import { SettingInput } from './setting-input'
import { SettingRow } from './setting-row'
import { SettingSection } from './setting-section'
import { SettingSelect } from './setting-select'
import { SettingTimeInput } from './setting-time-input'

export type SalaryTypeOption = {
  value: Settings['salaryType']
  label: string
}

export default function QuickSetupSection({
  payLocked,
  salaryDraft,
  salaryTypeDraft,
  salaryTypeOptions,
  salaryDraftValid,
  activeSalaryMax,
  estimatedHourly,
  startTime,
  endTime,
  onSalaryDraftChange,
  onSalaryTypeDraftChange,
  onSaveSalary,
  onResetSalary,
  onStartTimeChange,
  onEndTimeChange,
}: {
  payLocked: boolean
  salaryDraft: string
  salaryTypeDraft: Settings['salaryType']
  salaryTypeOptions: SalaryTypeOption[]
  salaryDraftValid: boolean
  activeSalaryMax: number
  estimatedHourly?: string
  startTime: string
  endTime: string
  onSalaryDraftChange: (value: string) => void
  onSalaryTypeDraftChange: (value: Settings['salaryType']) => void
  onSaveSalary: () => void
  onResetSalary: () => void
  onStartTimeChange: (value: string) => void
  onEndTimeChange: (value: string) => void
}) {
  return (
    <SettingSection title="快速配置" description="先完成收入计算所需的核心信息。" tone="vault">
      <SettingGroup density="loose">
        {payLocked ? (
          <div className="setting-vault-state">
            <div>
              <div className="setting-vault-state__label">薪资已隐藏</div>
              <SettingDescription tone="quiet">
                根据当前配置，你的估算时薪约为：{estimatedHourly ?? '暂不可用'}
              </SettingDescription>
            </div>
            <SettingAction variant="quiet" onClick={onResetSalary}>
              重置薪资
            </SettingAction>
          </div>
        ) : (
          <>
            <div className="setting-salary-entry">
              <SettingInput
                tone="vault"
                value={salaryDraft}
                onChange={(e) => onSalaryDraftChange(e.target.value)}
                type="number"
                inputMode="decimal"
                min={0}
                max={activeSalaryMax}
                step="any"
                placeholder="金额"
                aria-label="薪资金额"
              />
              <SettingSelect
                tone="vault"
                value={salaryTypeDraft}
                onChange={(e) => onSalaryTypeDraftChange(e.target.value as Settings['salaryType'])}
                aria-label="薪资类型"
              >
                {salaryTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SettingSelect>
              <SettingAction variant="primary" disabled={!salaryDraftValid} onClick={onSaveSalary}>
                保存
              </SettingAction>
            </div>
            <SettingDescription tone="quiet">
              保存后将无法再次查看具体薪资金额，只能重置后重新输入。
            </SettingDescription>
          </>
        )}
        <SettingDescription tone="quiet">数据仅保存在当前设备，不会上传服务器。</SettingDescription>
      </SettingGroup>

      <SettingGroup>
        <SettingRow label="上班时间" controlId="settings-start-time">
          <SettingTimeInput
            id="settings-start-time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
          />
        </SettingRow>

        <SettingRow label="下班时间" controlId="settings-end-time">
          <SettingTimeInput id="settings-end-time" value={endTime} onChange={(e) => onEndTimeChange(e.target.value)} />
        </SettingRow>
      </SettingGroup>
    </SettingSection>
  )
}
