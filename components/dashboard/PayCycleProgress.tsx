import React from 'react'

export default function PayCycleProgress({
  percent,
  paydayCountdownLabel,
}: {
  percent: number
  rangeLabel?: string
  paydayCountdownLabel?: string
}) {
  return (
    <div className="hud-metric hud-cycle-progress" aria-label="薪资周期进度">
      <span className="hud-metric-copy">
        <span className="hud-metric-label">本期进度</span>
      </span>
      <span className="hud-cycle-progress-side">
        <span className="hud-metric-value">{percent}%</span>
        {paydayCountdownLabel ? <span className="hud-cycle-countdown">{paydayCountdownLabel}</span> : null}
      </span>
      <span className="hud-cycle-progress-bar" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </span>
    </div>
  )
}
