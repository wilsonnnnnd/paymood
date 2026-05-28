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
  statusToggle: document.getElementById('statusToggle'),
  resetTodayActivity: document.getElementById('resetTodayActivity'),
  resetSettings: document.getElementById('resetSettings'),
  earnedText: document.getElementById('earnedText'),
  progressBar: document.getElementById('progressBar'),
  progressPill: document.getElementById('progressPill'),
  remainingPill: document.getElementById('remainingPill'),
  hourlyPill: document.getElementById('hourlyPill'),
  liveStatusText: document.getElementById('liveStatusText'),
  weekText: document.getElementById('weekText'),
  cycleLabel: document.getElementById('cycleLabel'),
  cycleText: document.getElementById('cycleText'),
  codingTodayText: document.getElementById('codingTodayText'),
  thinkingTodayText: document.getElementById('thinkingTodayText'),
  codingSessionText: document.getElementById('codingSessionText'),
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
  renderWorkDays(snapshot.settings.workDays || [])

  const currencySymbol = currencyToSymbol(snapshot.settings.currency)
  const earnedText = Number.isFinite(snapshot.earned) ? snapshot.earned.toFixed(2) : '0.00'
  const hourlyText = Number.isFinite(snapshot.hourly) ? snapshot.hourly.toFixed(2) : '0.00'
  const weekText = Number.isFinite(snapshot.weekEarned) ? snapshot.weekEarned.toFixed(0) : '0'
  const cycleText = Number.isFinite(snapshot.cycleEarned) ? snapshot.cycleEarned.toFixed(0) : '0'
  const pct = snapshot.isWorkDay ? Math.max(0, Math.min(100, snapshot.percent)) : 0

  els.earnedText.textContent = currencySymbol + earnedText
  els.progressPill.textContent = `${pct}%`
  els.progressBar.style.width = `${pct}%`
  els.remainingPill.textContent = snapshot.isWorkDay ? snapshot.remainingHuman : '00h 00m'
  els.hourlyPill.textContent = currencySymbol + hourlyText
  els.liveStatusText.textContent = getLiveStatus(snapshot)
  els.weekText.textContent = currencySymbol + weekText
  els.cycleLabel.textContent = snapshot.cycleLabel || 'Pay cycle'
  els.cycleText.textContent = currencySymbol + cycleText
  els.codingTodayText.textContent = formatDuration(snapshot.codingTodaySeconds)
  els.thinkingTodayText.textContent = formatDuration(snapshot.thinkingTodaySeconds)
  els.codingSessionText.textContent = formatDuration(snapshot.codingSessionSeconds)
  els.statusToggle.textContent = snapshot.statusVisible ? 'Status on' : 'Status off'
  els.statusToggle.setAttribute('aria-pressed', snapshot.statusVisible ? 'true' : 'false')
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
