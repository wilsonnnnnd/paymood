export type PublicHoliday = {
  name: string
  localName?: string
  date: string
  daysLeft: number
  progress?: number
}

type NagerPublicHoliday = {
  date: string
  localName: string
  name: string
  countryCode: string
  fixed: boolean
  global: boolean
  counties?: string[]
  launchYear?: number
  types: string[]
}

type PublicHolidayCache = {
  timestamp: number
  year: number
  data: NagerPublicHoliday[]
}

const CACHE_KEY = 'paymood-public-holidays'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function parseLocalDate(input: string) {
  const [y, m, d] = input.split('-').map((part) => Number(part))
  return new Date(y, m - 1, d)
}

function daysLeftFromToday(date: Date) {
  const base = startOfToday()
  const diff = date.getTime() - base.getTime()
  return Math.ceil(diff / (24 * 60 * 60 * 1000))
}

function clamp01(value: number) {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

function daysBetween(from: Date, to: Date) {
  return Math.ceil((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000))
}

function readCache(expectedYear: number) {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PublicHolidayCache
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.year !== expectedYear) return null
    if (typeof parsed.timestamp !== 'number') return null
    if (!Array.isArray(parsed.data)) return null
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null
    return parsed.data
  } catch {
    return null
  }
}

function writeCache(year: number, data: NagerPublicHoliday[]) {
  if (typeof window === 'undefined') return
  const payload: PublicHolidayCache = {
    timestamp: Date.now(),
    year,
    data,
  }
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    return
  }
}

async function fetchPublicHolidays(year: number, countryCode: string) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`, {
      method: 'GET',
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`PublicHolidays ${res.status}`)
    const json = (await res.json()) as unknown
    if (!Array.isArray(json)) throw new Error('PublicHolidays invalid response')
    return json as NagerPublicHoliday[]
  } finally {
    window.clearTimeout(timeoutId)
  }
}

async function getYearHolidays(year: number, countryCode: string) {
  const cached = readCache(year)
  if (cached) return cached
  const data = await fetchPublicHolidays(year, countryCode)
  writeCache(year, data)
  return data
}

function filterForCounty(holidays: NagerPublicHoliday[], county: string) {
  return holidays.filter((holiday) => holiday.global || holiday.counties?.includes(county))
}

function findNextHoliday(holidays: NagerPublicHoliday[]) {
  const today = startOfToday()
  let best: NagerPublicHoliday | null = null
  let bestDate: Date | null = null

  for (const holiday of holidays) {
    const date = parseLocalDate(holiday.date)
    if (date.getTime() <= today.getTime()) continue

    if (!best || (bestDate && date.getTime() < bestDate.getTime())) {
      best = holiday
      bestDate = date
    }
  }

  if (!best || !bestDate) return null
  return {
    holiday: best,
    date: bestDate,
  }
}

function findPrevHoliday(holidays: NagerPublicHoliday[]) {
  const today = startOfToday()
  let best: NagerPublicHoliday | null = null
  let bestDate: Date | null = null

  for (const holiday of holidays) {
    const date = parseLocalDate(holiday.date)
    if (date.getTime() > today.getTime()) continue

    if (!best || (bestDate && date.getTime() > bestDate.getTime())) {
      best = holiday
      bestDate = date
    }
  }

  if (!best || !bestDate) return null
  return {
    holiday: best,
    date: bestDate,
  }
}

export async function getNextPublicHoliday({
  countryCode = 'AU',
  county = 'AU-VIC',
}: {
  countryCode?: string
  county?: string
} = {}): Promise<PublicHoliday> {
  if (typeof window === 'undefined') throw new Error('PublicHoliday client only')

  const currentYear = new Date().getFullYear()
  const current = filterForCounty(await getYearHolidays(currentYear, countryCode), county)
  const nextInYear = findNextHoliday(current)
  if (nextInYear) {
    const prevInYear = findPrevHoliday(current)
    const today = startOfToday()
    const fallbackWindowDays = 60
    const progress =
      prevInYear !== null
        ? clamp01(daysBetween(prevInYear.date, today) / Math.max(1, daysBetween(prevInYear.date, nextInYear.date)))
        : clamp01(1 - Math.min(fallbackWindowDays, daysLeftFromToday(nextInYear.date)) / fallbackWindowDays)

    return {
      name: nextInYear.holiday.name,
      localName: nextInYear.holiday.localName,
      date: nextInYear.holiday.date,
      daysLeft: daysLeftFromToday(nextInYear.date),
      progress,
    }
  }

  const nextYear = currentYear + 1
  const next = filterForCounty(await getYearHolidays(nextYear, countryCode), county)
  const nextInNextYear = findNextHoliday(next)
  if (!nextInNextYear) throw new Error('PublicHoliday not found')

  const prevInCurrentYear = findPrevHoliday(current)
  const prev =
    prevInCurrentYear ?? findPrevHoliday(filterForCounty(await getYearHolidays(currentYear - 1, countryCode), county))
  const today = startOfToday()
  const fallbackWindowDays = 60
  const progress =
    prev !== null
      ? clamp01(daysBetween(prev.date, today) / Math.max(1, daysBetween(prev.date, nextInNextYear.date)))
      : clamp01(1 - Math.min(fallbackWindowDays, daysLeftFromToday(nextInNextYear.date)) / fallbackWindowDays)

  return {
    name: nextInNextYear.holiday.name,
    localName: nextInNextYear.holiday.localName,
    date: nextInNextYear.holiday.date,
    daysLeft: daysLeftFromToday(nextInNextYear.date),
    progress,
  }
}
