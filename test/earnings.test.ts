import {describe, it, expect} from 'vitest'
import {normalizeSalaryToHourly, workProgress, earnedSoFar} from '../lib/earnings'

describe('normalizeSalaryToHourly', () => {
  it('converts hourly unchanged', () => {
    expect(normalizeSalaryToHourly(20, 'hourly')).toBe(20)
  })

  it('converts daily correctly', () => {
    expect(normalizeSalaryToHourly(160, 'daily', {workDayHours: 8})).toBeCloseTo(20)
  })

  it('converts weekly correctly', () => {
    expect(normalizeSalaryToHourly(1000, 'weekly', {workDayHours: 8, workDaysPerWeek: 5})).toBeCloseTo(25)
  })
})

describe('workProgress', () => {
  it('before start returns zero', () => {
    const start = new Date('2026-05-10T09:00:00')
    const end = new Date('2026-05-10T17:00:00')
    const now = new Date('2026-05-10T08:00:00')
    const p = workProgress(now, start, end, 0)
    expect(p.progress).toBe(0)
  })

  it('after end returns one', () => {
    const start = new Date('2026-05-10T09:00:00')
    const end = new Date('2026-05-10T17:00:00')
    const now = new Date('2026-05-10T18:00:00')
    const p = workProgress(now, start, end, 0)
    expect(p.progress).toBe(1)
  })
})

describe('earnedSoFar', () => {
  it('computes earned correctly for partial day', () => {
    const start = new Date('2026-05-10T09:00:00')
    const end = new Date('2026-05-10T17:00:00')
    const now = new Date('2026-05-10T13:00:00')
    const {hourly, earned} = earnedSoFar(now, start, end, 0, 200, 'daily', {workDayHours: 8})
    expect(hourly).toBeCloseTo(25)
    // 4 hours elapsed -> 4 * 25 = 100
    expect(Math.round(earned)).toBe(100)
  })
})
