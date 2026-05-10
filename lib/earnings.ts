export type SalaryType = 'hourly' | 'daily' | 'weekly' | 'fortnightly' | 'monthly' | 'annually'

export function normalizeSalaryToHourly(amount: number, type: SalaryType, opts?: {workDayHours?: number; workDaysPerWeek?: number}): number {
  const workDayHours = opts?.workDayHours ?? 8
  const workDaysPerWeek = opts?.workDaysPerWeek ?? 5

  if (!isFinite(amount) || amount <= 0) return 0

  switch (type) {
    case 'hourly':
      return amount
    case 'daily':
      return amount / workDayHours
    case 'weekly':
      return amount / (workDaysPerWeek * workDayHours)
    case 'fortnightly':
      return amount / (2 * workDaysPerWeek * workDayHours)
    case 'monthly': {
      const weeksPerMonth = 52 / 12 // ~4.3333
      return amount / (workDaysPerWeek * workDayHours * weeksPerMonth)
    }
    case 'annually':
      return amount / (workDaysPerWeek * workDayHours * 52)
  }
}

function toSeconds(d: Date | string | number) {
  if (d instanceof Date) return Math.floor(d.getTime() / 1000)
  return Math.floor(new Date(d).getTime() / 1000)
}

export interface ProgressResult {
  progress: number // 0..1
  elapsedSeconds: number
  remainingSeconds: number
  totalWorkSeconds: number
}

/**
 * Compute work progress with simple proportional break subtraction.
 * - breakMinutes is subtracted from total work time.
 * - during the elapsed portion we subtract break proportionally.
 */
export function workProgress(now: Date | string | number, start: Date | string | number, end: Date | string | number, breakMinutes = 0): ProgressResult {
  const nowS = toSeconds(now)
  const startS = toSeconds(start)
  const endS = toSeconds(end)

  const rawTotal = Math.max(0, endS - startS)
  const breakSec = Math.max(0, Math.floor(breakMinutes * 60))
  const totalWorkSec = Math.max(0, rawTotal - breakSec)

  if (rawTotal <= 0 || totalWorkSec <= 0) {
    return {progress: 0, elapsedSeconds: 0, remainingSeconds: 0, totalWorkSeconds: 0}
  }

  if (nowS <= startS) {
    return {progress: 0, elapsedSeconds: 0, remainingSeconds: totalWorkSec, totalWorkSeconds: totalWorkSec}
  }

  if (nowS >= endS) {
    return {progress: 1, elapsedSeconds: totalWorkSec, remainingSeconds: 0, totalWorkSeconds: totalWorkSec}
  }

  const rawElapsed = Math.max(0, Math.min(rawTotal, nowS - startS))
  // subtract break proportionally from elapsed
  const elapsedAdjusted = Math.max(0, rawElapsed - Math.floor((breakSec * rawElapsed) / rawTotal))
  const progress = Math.min(1, elapsedAdjusted / totalWorkSec)
  const remaining = Math.max(0, totalWorkSec - elapsedAdjusted)

  return {progress, elapsedSeconds: elapsedAdjusted, remainingSeconds: remaining, totalWorkSeconds: totalWorkSec}
}

export function earnedSoFar(now: Date | string | number, start: Date | string | number, end: Date | string | number, breakMinutes: number, salaryAmount: number, salaryType: SalaryType, opts?: {workDayHours?: number; workDaysPerWeek?: number}) {
  const hourly = normalizeSalaryToHourly(salaryAmount, salaryType, opts)
  const prog = workProgress(now, start, end, breakMinutes)
  const earned = hourly * (prog.elapsedSeconds / 3600)
  return {hourly, earned}
}
