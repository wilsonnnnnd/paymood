import React from 'react'
import { SettingAction } from './setting-action'
import { SettingRow } from './setting-row'
import { SettingSection } from './setting-section'

export default function PayCycleSection({
  paydayStatusLabel,
  hasPayday,
  onOpenPayday,
  onResetPayday,
}: {
  paydayStatusLabel: string
  hasPayday: boolean
  onOpenPayday: () => void
  onResetPayday: () => void
}) {
  return (
    <SettingSection title="薪资周期" description="用于计算距离发薪和当前薪资周期进度。" tone="default">
      <SettingRow
        label="我的发薪日"
        description="输入最近一次实际到账日期，用于校准当前薪资周期。"
        value={paydayStatusLabel}
        controlLayout="stacked"
      >
        <div className="flex flex-wrap gap-2">
          <SettingAction variant="primary" onClick={onOpenPayday}>
            设置发薪日
          </SettingAction>
          {hasPayday ? (
            <SettingAction variant="quiet" onClick={onResetPayday}>
              取消发薪日
            </SettingAction>
          ) : null}
        </div>
      </SettingRow>
    </SettingSection>
  )
}
