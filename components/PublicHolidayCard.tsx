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

  if (error) return null
  if (!loading && !holiday) return null

  const label = '下次法定节假日'

  if (loading || !holiday) {
    return (
      <div className="hud-metric hud-metric--holiday" aria-label={label}>
        <div className="hud-metric-copy">
          <span className="hud-metric-label">{label}</span>
          <div className="hud-holiday-skeleton-line hud-holiday-skeleton-line--title" />
          <div className="hud-holiday-skeleton-line hud-holiday-skeleton-line--meta" />
        </div>
        <div className="hud-holiday-skeleton-dot" aria-hidden="true" />
      </div>
    )
  }

  const displayName = (holiday.localName?.trim() || holiday.name).trim()
  const date = parseLocalDate(holiday.date)
  const dateText = formatHolidayDateZh(date)
  const copy = holiday.daysLeft <= 14 ? ' · 长周末快到了 ✨' : ''
  const progress = typeof holiday.progress === 'number' ? holiday.progress : null

  return (
    <div className="hud-metric hud-metric--holiday" aria-label={label}>
      <div className="hud-metric-copy">
        <span className="hud-metric-label">{label}</span>
        <div className="hud-holiday-name">{displayName}</div>
        <div className="hud-holiday-meta">
          {dateText} · {holiday.daysLeft}天后{copy}
        </div>
        {progress !== null ? (
          <div className="hud-holiday-progress" aria-hidden="true">
            <span style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        ) : null}
      </div>
      <div className="hud-holiday-icon" aria-hidden="true">
        🎉
      </div>
    </div>
  )
}
