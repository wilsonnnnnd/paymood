import React from 'react'

export default function PayCycleProgress({ percent }: { percent: number }) {
  return (
    <div className="hud-metric hud-cycle-progress" aria-label="薪资周期进度">
      <span className="hud-metric-copy">
        <span className="hud-metric-label">本周期进度</span>
        <span className="hud-metric-subtitle">当前薪资周期</span>
      </span>
      <span className="hud-metric-value">{percent}%</span>
      <span className="hud-cycle-progress-bar" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </span>
    </div>
  )
}
