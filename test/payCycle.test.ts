import { describe, expect, it } from 'vitest'
import { getCurrentPayCycle, validateLastPaydayDate } from '../lib/payCycle'

describe('pay cycle utilities', () => {
  it('validates payday dates within 60 days and not in the future', () => {
    const today = new Date(2026, 5, 10) // 2026-06-10
    expect(validateLastPaydayDate('', today).valid).toBe(false)
    expect(validateLastPaydayDate('2026-06-11', today)).toEqual({ valid: false, reason: '工资日期不能晚于今天。' })
    expect(validateLastPaydayDate('2026-03-01', today)).toEqual({ valid: false, reason: '工资日期必须在最近 60 天内。' })
    const result = validateLastPaydayDate('2026-06-08', today)
    expect(result.valid).toBe(true)
    expect(result).toHaveProperty('date')
  })

  it('calculates current pay cycle boundaries correctly', () => {
    const today = new Date(2026, 5, 10) // 2026-06-10
    const cycle = getCurrentPayCycle(today, 15)
    expect(cycle.previousPayday).toEqual(new Date(2026, 4, 15))
    expect(cycle.nextPayday).toEqual(new Date(2026, 5, 15))

    const lateJune = new Date(2026, 5, 16)
    const lateCycle = getCurrentPayCycle(lateJune, 15)
    expect(lateCycle.previousPayday).toEqual(new Date(2026, 5, 15))
    expect(lateCycle.nextPayday).toEqual(new Date(2026, 6, 15))
  })
})
