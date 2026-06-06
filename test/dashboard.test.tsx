import React from 'react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

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
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
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

    const { container } = render(<Dashboard />)

    await screen.findByText('PayMood')
    expect(screen.getByText('今日收入')).toBeTruthy()
    expect(screen.getByText('本月')).toBeTruthy()
    expect(screen.queryByText('下次法定节假日')).toBeNull()
    expect(container).toMatchSnapshot()
  })
})
