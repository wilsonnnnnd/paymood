import React from 'react'
import PayCycleProgress from './PayCycleProgress'
import StatusMetricCard from './StatusMetricCard'

function CycleMetric({ label, value, format }: { label: string; value: number; format: Intl.NumberFormat }) {
  return (
    <div className="hud-metric hud-metric--cycle" tabIndex={0}>
      <span className="hud-metric-copy">
        <span className="hud-metric-label">累计收入</span>
        <span className="hud-metric-subtitle">{label}</span>
      </span>
      <span className="hud-metric-value">{format.format(value)}</span>
      <span className="hud-metric-tip" role="tooltip">
        根据你的薪资类型显示当前周期已赚金额；小时/日薪看今日，周薪看本周，双周薪看本双周，月薪看本月，年薪看今年。
      </span>
    </div>
  )
}

export default function SecondaryStatsSection({
  weekEarned,
  cycleLabel,
  cycleEarned,
  cycleProgress,
  format,
}: {
  weekEarned: number
  cycleLabel: string
  cycleEarned: number
  cycleProgress?: number | null
  format: Intl.NumberFormat
}) {
  return (
    <section className="hud-metrics hud-secondary-stats" aria-label="辅助统计">
      {typeof cycleProgress === 'number' ? <PayCycleProgress percent={cycleProgress} /> : null}
      <StatusMetricCard label="本周收入" value={format.format(weekEarned)} />
      <CycleMetric label={cycleLabel} value={cycleEarned} format={format} />
    </section>
  )
}
