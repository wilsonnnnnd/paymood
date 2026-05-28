export type SalaryType = 'hourly' | 'daily' | 'weekly' | 'fortnightly' | 'monthly' | 'annually'

export function normalizeSalaryToHourly(
  amount: number,
  type: SalaryType,
  opts?: { workDayHours?: number; workDaysPerWeek?: number },
): number {
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

export function convertSalary(
  amount: number,
  from: SalaryType,
  to: SalaryType,
  opts?: { workDayHours?: number; workDaysPerWeek?: number },
): number {
  const workDayHours = opts?.workDayHours ?? 8
  const workDaysPerWeek = opts?.workDaysPerWeek ?? 5

  const hourly = normalizeSalaryToHourly(amount, from, { workDayHours, workDaysPerWeek })
  if (!isFinite(hourly) || hourly <= 0) return 0

  switch (to) {
    case 'hourly':
      return hourly
    case 'daily':
      return hourly * workDayHours
    case 'weekly':
      return hourly * workDayHours * workDaysPerWeek
    case 'fortnightly':
      return hourly * workDayHours * workDaysPerWeek * 2
    case 'monthly': {
      const weeksPerMonth = 52 / 12 // ~4.3333
      return hourly * workDayHours * workDaysPerWeek * weeksPerMonth
    }
    case 'annually':
      return hourly * workDayHours * workDaysPerWeek * 52
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
export function workProgress(
  now: Date | string | number,
  start: Date | string | number,
  end: Date | string | number,
  breakMinutes = 0,
): ProgressResult {
  const nowS = toSeconds(now)
  const startS = toSeconds(start)
  const endS = toSeconds(end)

  const rawTotal = Math.max(0, endS - startS)
  const breakSec = Math.max(0, Math.floor(breakMinutes * 60))
  const totalWorkSec = Math.max(0, rawTotal - breakSec)

  if (rawTotal <= 0 || totalWorkSec <= 0) {
    return { progress: 0, elapsedSeconds: 0, remainingSeconds: 0, totalWorkSeconds: 0 }
  }

  if (nowS <= startS) {
    return { progress: 0, elapsedSeconds: 0, remainingSeconds: totalWorkSec, totalWorkSeconds: totalWorkSec }
  }

  if (nowS >= endS) {
    return { progress: 1, elapsedSeconds: totalWorkSec, remainingSeconds: 0, totalWorkSeconds: totalWorkSec }
  }

  const rawElapsed = Math.max(0, Math.min(rawTotal, nowS - startS))
  // subtract break proportionally from elapsed
  const elapsedAdjusted = Math.max(0, rawElapsed - Math.floor((breakSec * rawElapsed) / rawTotal))
  const progress = Math.min(1, elapsedAdjusted / totalWorkSec)
  const remaining = Math.max(0, totalWorkSec - elapsedAdjusted)

  return { progress, elapsedSeconds: elapsedAdjusted, remainingSeconds: remaining, totalWorkSeconds: totalWorkSec }
}

export function earnedSoFar(
  now: Date | string | number,
  start: Date | string | number,
  end: Date | string | number,
  breakMinutes: number,
  salaryAmount: number,
  salaryType: SalaryType,
  opts?: { workDayHours?: number; workDaysPerWeek?: number },
) {
  const hourly = normalizeSalaryToHourly(salaryAmount, salaryType, opts)
  const prog = workProgress(now, start, end, breakMinutes)
  const earned = hourly * (prog.elapsedSeconds / 3600)
  return { hourly, earned }
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function shouldCountDay(d: Date, workDays?: number[]) {
  if (!workDays || workDays.length === 0) {
    const day = d.getDay()
    return day !== 0 && day !== 6
  }

  return workDays.includes(d.getDay())
}

function startOfWeekMonday(d: Date) {
  const day = d.getDay()
  const daysSinceMonday = (day + 6) % 7
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - daysSinceMonday)
  start.setHours(0, 0, 0, 0)
  return start
}

function startOfMonth(d: Date) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  start.setHours(0, 0, 0, 0)
  return start
}

function startOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 1)
  start.setHours(0, 0, 0, 0)
  return start
}

function startOfNextMonth(d: Date) {
  const start = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  start.setHours(0, 0, 0, 0)
  return start
}

function startOfNextYear(d: Date) {
  const start = new Date(d.getFullYear() + 1, 0, 1)
  start.setHours(0, 0, 0, 0)
  return start
}

function startOfFortnightMonday(d: Date) {
  const weekStart = startOfWeekMonday(d)
  const epochMonday = new Date(1970, 0, 5)
  epochMonday.setHours(0, 0, 0, 0)
  const msPerFortnight = 14 * 24 * 60 * 60 * 1000
  const fortnightsSinceEpoch = Math.floor((weekStart.getTime() - epochMonday.getTime()) / msPerFortnight)
  return new Date(epochMonday.getTime() + fortnightsSinceEpoch * msPerFortnight)
}

export function parseTimeParts(time: string) {
  const [h, m] = time.split(':').map(Number)
  return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 }
}

export function getWorkWindowForNow(now: Date | string | number, startTime: string, endTime: string) {
  const nowDate = now instanceof Date ? now : new Date(now)
  const { h: sh, m: sm } = parseTimeParts(startTime)
  const { h: eh, m: em } = parseTimeParts(endTime)

  const [y, m, d] = [nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()]
  const startMinutes = sh * 60 + sm
  const endMinutes = eh * 60 + em
  const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes()
  const isOvernight = endMinutes <= startMinutes

  if (!isOvernight) {
    return { start: new Date(y, m, d, sh, sm), end: new Date(y, m, d, eh, em), isOvernight: false }
  }

  if (nowMinutes < endMinutes) {
    return { start: new Date(y, m, d - 1, sh, sm), end: new Date(y, m, d, eh, em), isOvernight: true }
  }

  return { start: new Date(y, m, d, sh, sm), end: new Date(y, m, d + 1, eh, em), isOvernight: true }
}

type EarnedPeriodInput = {
  startTime: string
  endTime: string
  breakMinutes: number
  workDays?: number[]
  salaryAmount: number
  salaryType: SalaryType
  opts?: { workDayHours?: number; workDaysPerWeek?: number }
}

export type WorkEarningsInput = EarnedPeriodInput

export type WorkEarningsSnapshot = {
  start: Date
  end: Date
  isWorkDay: boolean
  progress: ProgressResult
  day: {
    hourly: number
    earned: number
  }
  week: {
    hourly: number
    earned: number
  }
  month: {
    hourly: number
    earned: number
  }
  cycle: {
    label: string
    earned: number
  }
  earned: number
  hourly: number
  percent: number
  remainingSeconds: number
}

function getScheduledWorkWindow(cursor: Date, startTime: string, endTime: string) {
  const { h: sh, m: sm } = parseTimeParts(startTime)
  const { h: eh, m: em } = parseTimeParts(endTime)
  const startMinutes = sh * 60 + sm
  const endMinutes = eh * 60 + em
  const isOvernight = endMinutes <= startMinutes

  const start = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), sh, sm)
  const end = isOvernight
    ? new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1, eh, em)
    : new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), eh, em)

  return { start, end }
}

function scheduledWorkSecondsBetween(rangeStart: Date, rangeEnd: Date, input: EarnedPeriodInput) {
  const { startTime, endTime, breakMinutes, workDays } = input
  let totalSeconds = 0

  for (
    let cursor = startOfDay(rangeStart);
    cursor < rangeEnd;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
  ) {
    if (!shouldCountDay(cursor, workDays)) continue

    const { start, end } = getScheduledWorkWindow(cursor, startTime, endTime)
    totalSeconds += workProgress(end, start, end, breakMinutes).elapsedSeconds
  }

  return totalSeconds
}

function earnedBetweenDates(now: Date, rangeStart: Date, input: EarnedPeriodInput, hourlyOverride?: number) {
  const { startTime, endTime, breakMinutes, salaryAmount, salaryType, opts, workDays } = input

  const todayStart = startOfDay(now)
  const hourly = hourlyOverride ?? normalizeSalaryToHourly(salaryAmount, salaryType, opts)
  if (!isFinite(hourly) || hourly <= 0) return { hourly: 0, earned: 0 }

  let earnedTotal = 0
  for (
    let cursor = startOfDay(rangeStart);
    cursor <= todayStart;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
  ) {
    if (!shouldCountDay(cursor, workDays)) continue

    const { start, end } = getScheduledWorkWindow(cursor, startTime, endTime)
    const sliceNow = now.getTime() < end.getTime() ? now : end
    const prog = workProgress(sliceNow, start, end, breakMinutes)
    earnedTotal += hourly * (prog.elapsedSeconds / 3600)
  }

  return { hourly, earned: earnedTotal }
}

export function earnedSoFarThisWeek(now: Date | string | number, input: EarnedPeriodInput) {
  const nowDate = now instanceof Date ? now : new Date(now)
  const rangeStart = startOfWeekMonday(nowDate)
  return earnedBetweenDates(nowDate, rangeStart, input)
}

export function earnedSoFarThisFortnight(now: Date | string | number, input: EarnedPeriodInput) {
  const nowDate = now instanceof Date ? now : new Date(now)
  const rangeStart = startOfFortnightMonday(nowDate)
  return earnedBetweenDates(nowDate, rangeStart, input)
}

export function earnedSoFarThisMonth(now: Date | string | number, input: EarnedPeriodInput) {
  const nowDate = now instanceof Date ? now : new Date(now)
  const rangeStart = startOfMonth(nowDate)

  if (input.salaryType !== 'monthly') {
    return earnedBetweenDates(nowDate, rangeStart, input)
  }

  const monthWorkSeconds = scheduledWorkSecondsBetween(rangeStart, startOfNextMonth(nowDate), input)
  if (!isFinite(input.salaryAmount) || input.salaryAmount <= 0 || monthWorkSeconds <= 0) {
    return { hourly: 0, earned: 0 }
  }

  const hourly = input.salaryAmount / (monthWorkSeconds / 3600)
  return earnedBetweenDates(nowDate, rangeStart, input, hourly)
}

export function earnedSoFarThisYear(now: Date | string | number, input: EarnedPeriodInput) {
  const nowDate = now instanceof Date ? now : new Date(now)
  const rangeStart = startOfYear(nowDate)

  if (input.salaryType !== 'annually') {
    return earnedBetweenDates(nowDate, rangeStart, input)
  }

  const yearWorkSeconds = scheduledWorkSecondsBetween(rangeStart, startOfNextYear(nowDate), input)
  if (!isFinite(input.salaryAmount) || input.salaryAmount <= 0 || yearWorkSeconds <= 0) {
    return { hourly: 0, earned: 0 }
  }

  const hourly = input.salaryAmount / (yearWorkSeconds / 3600)
  return earnedBetweenDates(nowDate, rangeStart, input, hourly)
}

function selectCycleEarnings(
  salaryType: SalaryType,
  snapshots: {
    day: { earned: number }
    week: { earned: number }
    fortnight: { earned: number }
    month: { earned: number }
    year: { earned: number }
  },
) {
  switch (salaryType) {
    case 'hourly':
      return { label: '工作累计', earned: snapshots.day.earned }
    case 'daily':
      return { label: '今日', earned: snapshots.day.earned }
    case 'weekly':
      return { label: '本周', earned: snapshots.week.earned }
    case 'fortnightly':
      return { label: '本双周', earned: snapshots.fortnight.earned }
    case 'monthly':
      return { label: '本月', earned: snapshots.month.earned }
    case 'annually':
      return { label: '今年', earned: snapshots.year.earned }
  }
}

export function calculateWorkEarnings(now: Date | string | number, input: WorkEarningsInput): WorkEarningsSnapshot {
  const nowDate = now instanceof Date ? now : new Date(now)
  const workDaysPerWeek = input.opts?.workDaysPerWeek ?? (input.workDays?.length ? input.workDays.length : 5)
  const periodInput = {
    ...input,
    opts: {
      ...input.opts,
      workDaysPerWeek,
    },
  }

  const { start, end } = getWorkWindowForNow(nowDate, input.startTime, input.endTime)
  const isWorkDay = input.workDays?.includes(start.getDay()) ?? true
  const progress = isWorkDay
    ? workProgress(nowDate, start, end, input.breakMinutes)
    : { progress: 0, elapsedSeconds: 0, remainingSeconds: 0, totalWorkSeconds: 0 }
  const day = earnedSoFar(
    nowDate,
    start,
    end,
    input.breakMinutes,
    input.salaryAmount,
    input.salaryType,
    periodInput.opts,
  )
  const week = earnedSoFarThisWeek(nowDate, periodInput)
  const fortnight = earnedSoFarThisFortnight(nowDate, periodInput)
  const month = earnedSoFarThisMonth(nowDate, periodInput)
  const year = earnedSoFarThisYear(nowDate, periodInput)
  const earned = isWorkDay ? day.earned : 0
  const cycle = selectCycleEarnings(input.salaryType, {
    day: { earned },
    week,
    fortnight,
    month,
    year,
  })

  return {
    start,
    end,
    isWorkDay,
    progress,
    day,
    week,
    month,
    cycle,
    earned,
    hourly: day.hourly,
    percent: isWorkDay ? Math.round(progress.progress * 100) : 0,
    remainingSeconds: isWorkDay ? progress.remainingSeconds : 0,
  }
}
