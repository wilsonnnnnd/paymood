import {describe, it, expect} from 'vitest'
import {earnedSoFar, earnedSoFarThisMonth, earnedSoFarThisWeek, normalizeSalaryToHourly, workProgress} from '../lib/earnings'

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

describe('earnedSoFarThisWeek', () => {
  it('accumulates prior weekdays plus today slice', () => {
    const now = new Date('2026-05-13T13:00:00') // Wed
    const {earned} = earnedSoFarThisWeek(now, {
      startTime: '09:00',
      endTime: '17:00',
      breakMinutes: 0,
      salaryAmount: 20,
      salaryType: 'hourly',
    })

    // Mon 8h + Tue 8h + Wed 4h => 20 * 20h = 400
    expect(Math.round(earned)).toBe(400)
  })

  it('respects custom work days', () => {
    const now = new Date('2026-05-13T13:00:00') // Wed
    const {earned} = earnedSoFarThisWeek(now, {
      startTime: '09:00',
      endTime: '17:00',
      breakMinutes: 0,
      workDays: [1, 3], // Mon + Wed
      salaryAmount: 20,
      salaryType: 'hourly',
    })

    // Mon 8h + Wed 4h => 20 * 12h = 240
    expect(Math.round(earned)).toBe(240)
  })
})

describe('earnedSoFarThisMonth', () => {
  it('includes weekdays from month start', () => {
    const now = new Date('2026-06-03T13:00:00') // Wed
    const {earned} = earnedSoFarThisMonth(now, {
      startTime: '09:00',
      endTime: '17:00',
      breakMinutes: 0,
      salaryAmount: 20,
      salaryType: 'hourly',
    })

    // 2026-06-01 Mon 8h + 06-02 Tue 8h + 06-03 Wed 4h => 20 * 20h = 400
    expect(Math.round(earned)).toBe(400)
  })
})
