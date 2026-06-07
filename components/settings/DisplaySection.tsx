import React from 'react'
import type { Settings } from '../../hooks/useSettings'
import { SettingRow } from './setting-row'
import { SettingSection } from './setting-section'
import { SettingToggle } from './setting-toggle'

import slime1Idle from '../../craftpix/PNG/Slime1/With_shadow/Slime1_Idle_with_shadow.png'
import slime2Idle from '../../craftpix/PNG/Slime2/With_shadow/Slime2_Idle_with_shadow.png'
import slime3Idle from '../../craftpix/PNG/Slime3/With_shadow/Slime3_Idle_with_shadow.png'

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

export default function DisplaySection({
  colorModeLabel,
  petEnabled,
  petVariant,
  onPetEnabledChange,
  onPetVariantChange,
}: {
  colorModeLabel: string
  petEnabled: boolean
  petVariant: Settings['petVariant']
  onPetEnabledChange: (enabled: boolean) => void
  onPetVariantChange: (variant: NonNullable<Settings['petVariant']>) => void
}) {
  return (
    <SettingSection title="显示与陪伴" description="只影响界面外观和陪伴感，不影响收入计算。" tone="quiet">
      <SettingRow label="外观设置" description="当前颜色模式会跟随系统或固定为你选择的状态。" value={colorModeLabel} />

      <SettingRow
        label="宠物"
        description="默认开启。关闭后将不再显示，也不会消耗动画与计时性能。"
        value={petEnabled ? '开启' : '关闭'}
        density="quiet"
      >
        <SettingToggle
          aria-label={petEnabled ? '关闭宠物' : '开启宠物'}
          pressed={petEnabled}
          onClick={() => onPetEnabledChange(!petEnabled)}
        >
          {petEnabled ? '开' : '关'}
        </SettingToggle>
      </SettingRow>

      {petEnabled ? (
        <SettingRow label="陪伴角色" description="选择一个在工作日里安静陪着你的角色。" density="quiet">
          <div className="setting-pet-grid">
            {[
              { key: 'aqua' as const, label: '水蓝史莱姆', sheet: slime1Idle },
              { key: 'undead' as const, label: '幽灵史莱姆', sheet: slime2Idle },
              { key: 'magma' as const, label: '熔岩史莱姆', sheet: slime3Idle },
            ].map((item) => (
              <SettingToggle
                key={item.key}
                className="setting-pet-choice"
                aria-label={item.label}
                pressed={petVariant === item.key}
                onClick={() => onPetVariantChange(item.key)}
              >
                <PetIcon sheet={item.sheet} />
              </SettingToggle>
            ))}
          </div>
        </SettingRow>
      ) : null}
    </SettingSection>
  )
}
