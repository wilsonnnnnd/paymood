// @vitest-environment jsdom

import React from 'react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href?: string }) => (
    <a href={href ?? '#'} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('../hooks/usePublicHoliday', () => ({
  usePublicHoliday: () => ({
    holiday: {
      name: 'Labour Day',
      localName: 'Labour Day',
      date: '2026-06-08',
      daysLeft: 5,
      progress: 0.72,
    },
    loading: false,
    error: null,
  }),
}))

import Dashboard from '../components/Dashboard'

describe('Dashboard UI', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 3, 10, 30, 0))
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('shows the next holiday before the secondary income metrics', async () => {
    window.localStorage.setItem(
      'workday-settings-v1',
      JSON.stringify({
        startTime: '09:00',
        endTime: '17:00',
        breakMinutes: 0,
        workDays: [1, 2, 3, 4, 5],
        payLocked: true,
        salaryType: 'monthly',
        salaryAmount: 8800,
        currency: 'AUD',
        petEnabled: true,
      }),
    )

    render(<Dashboard />)
    act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(screen.getByText('PayMood')).toBeTruthy()
    expect(screen.getByText('Today Earned')).toBeTruthy()
    expect(screen.getAllByText('本月').length).toBeGreaterThan(0)
    expect(screen.getByText('距离下次假期')).toBeTruthy()
    expect(screen.getByText('5天')).toBeTruthy()

    const labels = Array.from(document.querySelectorAll('.hud-secondary-stats .hud-metric-label')).map(
      (node) => node.textContent,
    )

    expect(labels.indexOf('距离下次假期')).toBeLessThan(labels.indexOf('本周收入'))
    expect(labels.indexOf('距离下次假期')).toBeLessThan(labels.indexOf('累计收入'))
  })

  it('shows localized public product context for first-time visitors and crawlers', async () => {
    render(<Dashboard adsenseEnabled={false} />)
    act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(screen.getByText('PayMood 如何工作')).toBeTruthy()
    expect(screen.getByText(/本机浏览器存储/)).toBeTruthy()
    expect(screen.getByText(/不是 payroll 软件/)).toBeTruthy()
  })
  it('explains the active pay cycle when a payday is configured', async () => {
    window.localStorage.setItem(
      'workday-settings-v1',
      JSON.stringify({
        startTime: '09:00',
        endTime: '17:00',
        breakMinutes: 0,
        workDays: [1, 2, 3, 4, 5],
        payLocked: true,
        salaryType: 'monthly',
        salaryAmount: 8800,
        currency: 'AUD',
        petEnabled: true,
        lastPaydayDate: '2026-05-15',
        paydayDayOfMonth: 15,
      }),
    )

    render(<Dashboard adsenseEnabled={false} />)
    act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(screen.getByText('本期进度')).toBeTruthy()
    expect(screen.queryByText('5/15 - 6/15')).toBeNull()
    expect(screen.getAllByText('距离发薪 12天').length).toBeGreaterThan(0)
  })

  it('keeps post-shift wrap-up tied to the current pay cycle', async () => {
    vi.setSystemTime(new Date(2026, 5, 3, 18, 30, 0))
    window.localStorage.setItem(
      'workday-settings-v1',
      JSON.stringify({
        startTime: '09:00',
        endTime: '17:00',
        breakMinutes: 0,
        workDays: [1, 2, 3, 4, 5],
        payLocked: true,
        salaryType: 'monthly',
        salaryAmount: 8800,
        currency: 'AUD',
        petEnabled: true,
        lastPaydayDate: '2026-05-15',
        paydayDayOfMonth: 15,
      }),
    )

    render(<Dashboard adsenseEnabled={false} />)
    act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(screen.getByText('本周期已累计')).toBeTruthy()
    expect(screen.getAllByText('距离发薪 12天').length).toBeGreaterThan(0)
  })
})
