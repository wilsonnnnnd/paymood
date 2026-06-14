'use client'

import React from 'react'
import { usePublicHoliday } from '../hooks/usePublicHoliday'

function parseLocalDate(input: string) {
  const [y, m, d] = input.split('-').map((part) => Number(part))
  return new Date(y, m - 1, d)
}

function formatHolidayDateZh(date: Date) {
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export default function PublicHolidayCard() {
  const { holiday, loading, error } = usePublicHoliday()
  const label = '距离下次假期'

  if (error) return null
  if (!loading && !holiday) return null

  if (loading || !holiday) {
    return (
      <div className="hud-metric hud-metric--holiday" aria-label={label}>
        <span className="hud-metric-copy">
          <span className="hud-metric-label">{label}</span>
          <span className="hud-holiday-skeleton-line hud-holiday-skeleton-line--title" />
          <span className="hud-holiday-skeleton-line hud-holiday-skeleton-line--meta" />
        </span>
      </div>
    )
  }

  const displayName = (holiday.localName?.trim() || holiday.name).trim()
  const date = parseLocalDate(holiday.date)
  const dateText = formatHolidayDateZh(date)
  const progress = typeof holiday.progress === 'number' ? holiday.progress : null

  return (
    <div className="hud-metric hud-metric--holiday" aria-label={label}>
      <span className="hud-metric-copy">
        <span className="hud-metric-label">{label}</span>
        <span className="hud-holiday-name">{holiday.daysLeft}天</span>
        <span className="hud-holiday-meta">
          {dateText} · {displayName}
        </span>
        {progress !== null ? (
          <span className="hud-holiday-progress" aria-hidden="true">
            <span style={{ width: `${Math.round(progress * 100)}%` }} />
          </span>
        ) : null}
      </span>
    </div>
  )
}
