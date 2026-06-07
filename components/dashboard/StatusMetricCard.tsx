import React from 'react'

export default function StatusMetricCard({
  label,
  value,
  detail,
  metaLabel,
  metaValue,
  emphasis = false,
}: {
  label: string
  value: React.ReactNode
  detail?: React.ReactNode
  metaLabel?: React.ReactNode
  metaValue?: React.ReactNode
  emphasis?: boolean
}) {
  return (
    <div className={emphasis ? 'hud-metric hud-status-card hud-status-card--emphasis' : 'hud-metric hud-status-card'}>
      <span className="hud-metric-copy">
        <span className="hud-metric-label">{label}</span>
        {detail ? <span className="hud-metric-subtitle">{detail}</span> : null}
      </span>
      <span className="hud-metric-value">{value}</span>
      {metaLabel || metaValue ? (
        <span className="hud-status-card-meta">
          {metaLabel ? <span>{metaLabel}</span> : null}
          {metaValue ? <strong>{metaValue}</strong> : null}
        </span>
      ) : null}
    </div>
  )
}
