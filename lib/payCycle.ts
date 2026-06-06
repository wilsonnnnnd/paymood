export type PayCycle = {
  paydayDayOfMonth: number
  lastPaydayDate: string
}

export function pad2(value: number) {
  return String(value).padStart(2, '0')
}

export function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function parseLocalDate(value: string) {
  if (typeof value !== 'string') return null
  // Allow common separators (hyphen, slash, dot) and some localized formats
  const cleaned = value
    .trim()
    .replace(/[\/\.，、]/g, '-') // normalize separators to '-'
    .replace(/[年月日\s]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const parts = cleaned.split('-')
  if (parts.length !== 3) return null
  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return null
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

export function isValidLocalDate(value: string) {
  return parseLocalDate(value) !== null
}

export function normalizeLocalDateString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const parsed = parseLocalDate(value)
  if (!parsed) return undefined
  return formatLocalDate(parsed)
}

export function validateLastPaydayDate(
  value: string,
  today: Date = new Date(),
): { valid: true; date: Date } | { valid: false; reason: string } {
  if (!value || value.trim().length === 0) {
    return { valid: false, reason: '请选择有效的工资到账日期。' }
  }

  const date = parseLocalDate(value)
  if (!date) {
    return { valid: false, reason: '日期格式异常，请重新选择。' }
  }

  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (date.getTime() > localToday.getTime()) {
    return { valid: false, reason: '工资日期不能晚于今天。' }
  }

  const oldest = new Date(localToday)
  oldest.setDate(oldest.getDate() - 60)
  if (date.getTime() < oldest.getTime()) {
    return { valid: false, reason: '工资日期必须在最近 60 天内。' }
  }

  return { valid: true, date }
}

export function getPaydayForMonth(year: number, month: number, paydayDayOfMonth: number) {
  const lastDay = new Date(year, month + 1, 0).getDate()
  const day = Math.min(Math.max(1, paydayDayOfMonth), lastDay)
  return new Date(year, month, day)
}

export function addMonths(date: Date, months: number) {
  const year = date.getFullYear()
  const month = date.getMonth() + months
  const targetMonth = ((month % 12) + 12) % 12
  const targetYear = year + Math.floor(month / 12)
  return getPaydayForMonth(targetYear, targetMonth, date.getDate())
}

export function getCurrentPayCycle(today: Date, paydayDayOfMonth: number) {
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const currentMonthPayday = getPaydayForMonth(localToday.getFullYear(), localToday.getMonth(), paydayDayOfMonth)
  if (localToday.getTime() >= currentMonthPayday.getTime()) {
    return {
      previousPayday: currentMonthPayday,
      nextPayday: getPaydayForMonth(localToday.getFullYear(), localToday.getMonth() + 1, paydayDayOfMonth),
    }
  }

  const previousMonth = getPaydayForMonth(localToday.getFullYear(), localToday.getMonth() - 1, paydayDayOfMonth)
  return {
    previousPayday: previousMonth,
    nextPayday: currentMonthPayday,
  }
}

export function paydayDayFromDate(date: Date) {
  return date.getDate()
}
