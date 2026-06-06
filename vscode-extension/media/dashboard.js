const vscode = acquireVsCodeApi()

const dayOrder = [
  { label: 'S', value: 0 },
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
]

const persistedState = vscode.getState() || {}
const state = {
  settings: persistedState.settings || null,
  snapshot: persistedState.snapshot || null,
  focusedField: persistedState.focusedField || null,
}

const els = {
  startTime: document.getElementById('startTime'),
  endTime: document.getElementById('endTime'),
  breakMinutes: document.getElementById('breakMinutes'),
  workDays: document.getElementById('workDays'),
  salaryType: document.getElementById('salaryType'),
  salaryAmount: document.getElementById('salaryAmount'),
  currency: document.getElementById('currency'),
  lastPaydayDate: document.getElementById('lastPaydayDate'),
  paydayStatus: document.getElementById('paydayStatus'),
  clearPayday: document.getElementById('clearPayday'),
  publicHolidayEnabled: document.getElementById('publicHolidayEnabled'),
  statusToggle: document.getElementById('statusToggle'),
  resetTodayActivity: document.getElementById('resetTodayActivity'),
  resetSettings: document.getElementById('resetSettings'),
  earnedText: document.getElementById('earnedText'),
  progressBar: document.getElementById('progressBar'),
  progressPill: document.getElementById('progressPill'),
  remainingPill: document.getElementById('remainingPill'),
  hourlyPill: document.getElementById('hourlyPill'),
  liveStatusText: document.getElementById('liveStatusText'),
  cycleLabel: document.getElementById('cycleLabel'),
  cycleText: document.getElementById('cycleText'),
  codingTodayText: document.getElementById('codingTodayText'),
  thinkingTodayText: document.getElementById('thinkingTodayText'),
  codingSessionText: document.getElementById('codingSessionText'),
  holidayCard: document.getElementById('holidayCard'),
  holidaySkeleton: document.getElementById('holidaySkeleton'),
  holidayContent: document.getElementById('holidayContent'),
  holidayName: document.getElementById('holidayName'),
  holidayMeta: document.getElementById('holidayMeta'),
  holidayProgress: document.getElementById('holidayProgress'),
}

function persistState() {
  vscode.setState({
    settings: state.settings,
    snapshot: state.snapshot,
    focusedField: state.focusedField,
  })
}

function currencyToSymbol(currency) {
  const normalized = String(currency || '').toUpperCase()
  if (normalized === 'AUD') return 'A$'
  if (normalized === 'CNY') return 'CNY '
  return '$'
}

function formatDuration(seconds) {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`
  return `${minutes}m`
}

function getLiveStatus(snapshot) {
  if (!snapshot.isWorkDay) return 'Off today'
  const pct = Math.max(0, Math.min(100, Number(snapshot.percent) || 0))
  const remaining = Math.max(0, Number(snapshot.remainingSeconds) || 0)
  if (pct >= 100 || remaining === 0) return 'Shift complete'
  if (pct <= 0) return `Before shift · starts at ${snapshot.settings.startTime || '09:00'}`
  return `In shift · ${formatDuration(remaining)} left`
}

function renderWorkDays(selected) {
  els.workDays.innerHTML = ''
  dayOrder.forEach((day) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'day'
    btn.textContent = day.label
    btn.title = `Toggle day ${day.value}`
    const active = Array.isArray(selected) && selected.includes(day.value)
    btn.dataset.active = active ? 'true' : 'false'
    btn.setAttribute('aria-pressed', active ? 'true' : 'false')
    btn.addEventListener('click', () => {
      const current = Array.isArray(state.settings?.workDays) ? state.settings.workDays.slice() : []
      const has = current.includes(day.value)
      const next = has ? current.filter((value) => value !== day.value) : current.concat([day.value])
      setPatch({ workDays: next })
    })
    els.workDays.appendChild(btn)
  })
}

let patchTimer = null

function setPatch(patch) {
  if (!state.settings) return
  state.settings = { ...state.settings, ...patch }
  persistState()

  if (patch.workDays) renderWorkDays(patch.workDays)
  if (patchTimer) clearTimeout(patchTimer)
  patchTimer = setTimeout(() => {
    vscode.postMessage({ type: 'patchSettings', patch })
    patchTimer = null
  }, 120)
}

function bindControl(id, eventName, getPatch) {
  const el = els[id]
  el.addEventListener(eventName, () => setPatch(getPatch(el)))
  el.addEventListener('focus', () => {
    state.focusedField = id
    persistState()
  })
}

function bind() {
  bindControl('startTime', 'input', (el) => ({ startTime: el.value }))
  bindControl('endTime', 'input', (el) => ({ endTime: el.value }))
  bindControl('breakMinutes', 'input', (el) => ({ breakMinutes: Number(el.value) }))
  bindControl('salaryType', 'change', (el) => ({ salaryType: el.value }))
  bindControl('salaryAmount', 'input', (el) => ({ salaryAmount: Number(el.value) }))
  bindControl('currency', 'change', (el) => ({ currency: el.value }))
  bindControl('lastPaydayDate', 'change', (el) => ({ lastPaydayDate: el.value || '' }))
  els.clearPayday?.addEventListener('click', () => {
    setPatch({ lastPaydayDate: '' })
  })
  bindControl('publicHolidayEnabled', 'change', (el) => ({ publicHolidayEnabled: Boolean(el.checked) }))
  els.statusToggle.addEventListener('click', () => {
    vscode.postMessage({ type: 'toggleStatusBar' })
  })
  els.resetTodayActivity?.addEventListener('click', () => {
    vscode.postMessage({ type: 'resetTodayActivity' })
  })

  els.resetSettings.addEventListener('click', () => {
    vscode.postMessage({ type: 'resetSettings' })
  })
}

function restoreFocus() {
  const focused = state.focusedField ? els[state.focusedField] : null
  if (focused && typeof focused.focus === 'function') focused.focus()
}

function applySnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || !snapshot.settings) return

  state.snapshot = snapshot
  state.settings = snapshot.settings
  persistState()

  els.startTime.value = snapshot.settings.startTime || '09:00'
  els.endTime.value = snapshot.settings.endTime || '17:00'
  els.breakMinutes.value = String(snapshot.settings.breakMinutes ?? 0)
  els.salaryType.value = snapshot.settings.salaryType || 'hourly'
  els.salaryAmount.value = String(snapshot.settings.salaryAmount ?? 0)
  els.currency.value = String(snapshot.settings.currency || 'AUD').toUpperCase()
  if (els.lastPaydayDate) els.lastPaydayDate.value = snapshot.settings.lastPaydayDate || ''
  if (els.publicHolidayEnabled) els.publicHolidayEnabled.checked = snapshot.settings.publicHolidayEnabled !== false
  renderWorkDays(snapshot.settings.workDays || [])

  if (els.paydayStatus) {
    const value = snapshot.settings.lastPaydayDate
    els.paydayStatus.textContent = value ? `Calibrated: ${value}` : 'Not calibrated'
  }
  if (els.clearPayday) {
    const value = snapshot.settings.lastPaydayDate
    els.clearPayday.disabled = !value
  }

  const currencySymbol = currencyToSymbol(snapshot.settings.currency)
  const earnedText = Number.isFinite(snapshot.earned) ? snapshot.earned.toFixed(2) : '0.00'
  const hourlyText = Number.isFinite(snapshot.hourly) ? snapshot.hourly.toFixed(2) : '0.00'
  const cycleText = Number.isFinite(snapshot.cycleEarned) ? snapshot.cycleEarned.toFixed(0) : '0'
  const pct = snapshot.isWorkDay ? Math.max(0, Math.min(100, snapshot.percent)) : 0

  els.earnedText.textContent = currencySymbol + earnedText
  els.progressPill.textContent = `${pct}%`
  els.progressBar.style.width = `${pct}%`
  els.remainingPill.textContent = snapshot.isWorkDay ? snapshot.remainingHuman : '00h 00m'
  els.hourlyPill.textContent = currencySymbol + hourlyText
  els.liveStatusText.textContent = getLiveStatus(snapshot)
  els.cycleLabel.textContent = snapshot.cycleLabel || 'Pay cycle'
  els.cycleText.textContent = currencySymbol + cycleText
  els.codingTodayText.textContent = formatDuration(snapshot.codingTodaySeconds)
  els.thinkingTodayText.textContent = formatDuration(snapshot.thinkingTodaySeconds)
  els.codingSessionText.textContent = formatDuration(snapshot.codingSessionSeconds)
  els.statusToggle.textContent = snapshot.statusVisible ? 'Status on' : 'Status off'
  els.statusToggle.setAttribute('aria-pressed', snapshot.statusVisible ? 'true' : 'false')

  const holidayEnabled = snapshot.settings.publicHolidayEnabled !== false
  if (!holidayEnabled) {
    hideHolidayCard()
  } else if (!holidayInitialized) {
    holidayInitialized = true
    initHolidayCard()
  } else if (els.holidayCard && els.holidayCard.hidden) {
    initHolidayCard()
  }
}

const HOLIDAY_CACHE_KEY = 'paymood-public-holidays'
const HOLIDAY_CACHE_TTL_MS = 24 * 60 * 60 * 1000
let holidayInitialized = false

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function parseLocalDate(input) {
  const [y, m, d] = String(input)
    .split('-')
    .map((part) => Number(part))
  return new Date(y, m - 1, d)
}

function daysLeftFromToday(date) {
  const base = startOfToday()
  const diff = date.getTime() - base.getTime()
  return Math.ceil(diff / (24 * 60 * 60 * 1000))
}

function clamp01(value) {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

function daysBetween(from, to) {
  return Math.ceil((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000))
}

function formatHolidayDateEn(date) {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
  } catch {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
}

function formatDaysLeftEn(daysLeft) {
  const n = Math.max(0, Math.floor(Number(daysLeft) || 0))
  if (n === 1) return 'In 1 day'
  return `In ${n} days`
}

function readHolidayCache(expectedYear) {
  try {
    const raw = window.localStorage.getItem(HOLIDAY_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.year !== expectedYear) return null
    if (typeof parsed.timestamp !== 'number') return null
    if (!Array.isArray(parsed.data)) return null
    if (Date.now() - parsed.timestamp > HOLIDAY_CACHE_TTL_MS) return null
    return parsed.data
  } catch {
    return null
  }
}

function writeHolidayCache(year, data) {
  try {
    window.localStorage.setItem(
      HOLIDAY_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        year,
        data,
      }),
    )
  } catch {
    return
  }
}

async function fetchPublicHolidays(year, countryCode) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`, {
      method: 'GET',
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`PublicHolidays ${res.status}`)
    const json = await res.json()
    if (!Array.isArray(json)) throw new Error('PublicHolidays invalid response')
    return json
  } finally {
    window.clearTimeout(timeoutId)
  }
}

async function getYearHolidays(year, countryCode) {
  const cached = readHolidayCache(year)
  if (cached) return cached
  const data = await fetchPublicHolidays(year, countryCode)
  writeHolidayCache(year, data)
  return data
}

function filterForCounty(holidays, county) {
  return (holidays || []).filter((holiday) => holiday.global || (holiday.counties || []).includes(county))
}

function findNextHoliday(holidays) {
  const today = startOfToday()
  let best = null
  let bestDate = null

  for (const holiday of holidays) {
    const date = parseLocalDate(holiday.date)
    if (date.getTime() <= today.getTime()) continue

    if (!best || (bestDate && date.getTime() < bestDate.getTime())) {
      best = holiday
      bestDate = date
    }
  }

  if (!best || !bestDate) return null
  return { holiday: best, date: bestDate }
}

function findPrevHoliday(holidays) {
  const today = startOfToday()
  let best = null
  let bestDate = null

  for (const holiday of holidays) {
    const date = parseLocalDate(holiday.date)
    if (date.getTime() > today.getTime()) continue

    if (!best || (bestDate && date.getTime() > bestDate.getTime())) {
      best = holiday
      bestDate = date
    }
  }

  if (!best || !bestDate) return null
  return { holiday: best, date: bestDate }
}

async function getNextPublicHoliday({ countryCode = 'AU', county = 'AU-VIC' } = {}) {
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
    prevInCurrentYear || findPrevHoliday(filterForCounty(await getYearHolidays(currentYear - 1, countryCode), county))
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

function showHolidaySkeleton() {
  if (!els.holidayCard) return
  els.holidayCard.hidden = false
  if (els.holidaySkeleton) els.holidaySkeleton.hidden = false
  if (els.holidayContent) els.holidayContent.hidden = true
}

function hideHolidayCard() {
  if (!els.holidayCard) return
  els.holidayCard.hidden = true
}

function renderHoliday(holiday) {
  if (!els.holidayCard) return

  const displayName = String(holiday.localName || holiday.name || '').trim()
  const date = parseLocalDate(holiday.date)
  const dateText = formatHolidayDateEn(date)
  const copy = holiday.daysLeft <= 14 ? ' · Long weekend soon ✨' : ''

  if (els.holidayName) els.holidayName.textContent = displayName
  if (els.holidayMeta) els.holidayMeta.textContent = `${dateText} · ${formatDaysLeftEn(holiday.daysLeft)}${copy}`
  if (els.holidayProgress) els.holidayProgress.style.width = `${Math.round(clamp01(Number(holiday.progress)) * 100)}%`

  els.holidayCard.hidden = false
  if (els.holidaySkeleton) els.holidaySkeleton.hidden = true
  if (els.holidayContent) els.holidayContent.hidden = false
}

async function initHolidayCard() {
  if (!els.holidayCard) return
  if (state.settings && state.settings.publicHolidayEnabled === false) {
    hideHolidayCard()
    return
  }
  showHolidaySkeleton()

  try {
    const holiday = await getNextPublicHoliday()
    if (!holiday) {
      hideHolidayCard()
      return
    }
    renderHoliday(holiday)
  } catch {
    hideHolidayCard()
  }
}

window.addEventListener('message', (event) => {
  const message = event.data
  if (!message || typeof message !== 'object' || typeof message.type !== 'string') return

  switch (message.type) {
    case 'snapshot':
      applySnapshot(message.snapshot)
      break
    default:
      console.warn(`paymood webview ignored unknown message: ${message.type}`)
  }
})

bind()
if (state.snapshot) applySnapshot(state.snapshot)
restoreFocus()
vscode.postMessage({ type: 'ready' })
