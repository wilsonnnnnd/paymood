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

  it('keeps the workday dashboard focused and does not render the holiday card in the main workday view', async () => {
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
    expect(screen.queryByText('下次法定节假日')).toBeNull()
  })
})
