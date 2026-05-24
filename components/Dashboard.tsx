'use client'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import AdSenseSlot from './AdSenseSlot'
import CircularProgress from './CircularProgress'
import ColorModeToggle from './ColorModeToggle'
import { useSettings } from '../hooks/useSettings'
import { useClock } from '../hooks/useClock'
import {
  earnedSoFar,
  earnedSoFarThisMonth,
  earnedSoFarThisWeek,
  getWorkWindowForNow,
  workProgress,
} from '../lib/earnings'
import { currencySymbols } from '../lib/settings'

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !('matchMedia' in window)) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function formatHM(seconds: number) {
  const totalMinutes = Math.max(0, Math.floor(seconds / 60))
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
}

function currencyCodeToSymbol(code: string | undefined) {
  const normalized = (code ?? '').trim().toUpperCase()
  const key = normalized as keyof typeof currencySymbols
  if (key in currencySymbols) return currencySymbols[key]
  return '$'
}

function RollingChar({
  from,
  to,
  direction,
  animate,
}: {
  from: string
  to: string
  direction: number
  animate: boolean
}) {
  const isStatic = !animate || from === to || to === '.' || from === '.' || to === ' ' || from === ' '
  const [yEm, setYEm] = useState(0)

  useEffect(() => {
    if (isStatic) {
      setYEm(0)
      return
    }

    const startY = direction >= 0 ? 0 : -1
    const endY = direction >= 0 ? -1 : 0
    setYEm(startY)
    const id = requestAnimationFrame(() => setYEm(endY))
    return () => cancelAnimationFrame(id)
  }, [direction, from, isStatic, to])

  if (isStatic) {
    return <span className="roll-static">{to}</span>
  }

  const stack = direction >= 0 ? [from, to] : [to, from]

  return (
    <span className="roll-char" aria-hidden="true">
      <span className="roll-stack" style={{ transform: `translate3d(0, ${yEm}em, 0)` }}>
        <span className="roll-item">{stack[0]}</span>
        <span className="roll-item">{stack[1]}</span>
      </span>
    </span>
  )
}

const defaultMoneyFormat = (v: number) => v.toFixed(2)

function RollingNumber({ value, format = defaultMoneyFormat }: { value: number; format?: (v: number) => string }) {
  const timerRef = useRef<number | null>(null)
  const prevValueRef = useRef(value)
  const formatRef = useRef(format)
  const [fromText, setFromText] = useState(() => formatRef.current(value))
  const [toText, setToText] = useState(() => formatRef.current(value))
  const [direction, setDirection] = useState(1)
  const [animating, setAnimating] = useState(false)
  const [maxLen, setMaxLen] = useState(() => formatRef.current(value).length)

  useEffect(() => {
    formatRef.current = format
  }, [format])

  useEffect(() => {
    const next = formatRef.current(value)
    if (next === toText) return

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    const dir = value >= prevValueRef.current ? 1 : -1
    prevValueRef.current = value
    setDirection(dir)

    if (prefersReducedMotion()) {
      setFromText(next)
      setToText(next)
      setAnimating(false)
      return
    }

    setFromText(toText)
    setToText(next)
    setAnimating(true)
    setMaxLen((current) => Math.max(current, next.length))

    timerRef.current = window.setTimeout(() => {
      setFromText(next)
      setAnimating(false)
      timerRef.current = null
    }, 560)
  }, [toText, value])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [])

  const len = Math.max(maxLen, fromText.length, toText.length)
  const prevPadded = fromText.padStart(len, ' ')
  const nextPadded = toText.padStart(len, ' ')

  return (
    <span className="roll-number" aria-label={toText} style={{ width: `${len}ch` }}>
      {Array.from({ length: len }).map((_, index) => (
        <RollingChar
          key={index}
          from={prevPadded[index]}
          to={nextPadded[index]}
          direction={direction}
          animate={animating}
        />
      ))}
    </span>
  )
}

function moodFor(now: Date, start: Date, end: Date) {
  if (now.getTime() < start.getTime()) return '准备开工。'
  if (now.getTime() >= end.getTime()) return '可以下班了。'

  const hour = now.getHours()
  if (hour >= 12 && hour < 14) return '午休中。'

  const weekday = now.getDay()
  switch (weekday) {
    case 1:
      return '慢慢进入状态。'
    case 2:
      return '稳一点。'
    case 3:
      return '周三。'
    case 4:
      return '快到周五了。'
    case 5:
      return '准备收工。'
    default:
      return '今天也在慢慢赚钱。'
  }
}

function liveStatusFor({
  isReady,
  isWorkDay,
  now,
  start,
  end,
  remainingSeconds,
}: {
  isReady: boolean
  isWorkDay: boolean
  now: Date
  start: Date
  end: Date
  remainingSeconds: number
}) {
  if (!isReady) return 'Warming up'
  if (!isWorkDay) return 'Off today'
  if (now.getTime() < start.getTime()) return `Before shift · starts at ${formatTime(start)}`
  if (now.getTime() >= end.getTime()) return 'Shift complete'
  return `In shift · ${formatHM(remainingSeconds)} left`
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export default function Dashboard() {
  const { settings, ready } = useSettings()
  const now = useClock(1000)
  const isReady = ready && now !== null
  const workDaysPerWeek = settings.workDays?.length ? settings.workDays.length : 5

  const today = now ?? new Date(0)
  const { start, end } = getWorkWindowForNow(today, settings.startTime, settings.endTime)
  const isWorkDay = isReady ? settings.workDays?.includes(start.getDay()) ?? true : true

  const prog =
    isReady && isWorkDay
      ? workProgress(today, start, end, settings.breakMinutes)
      : { progress: 0, elapsedSeconds: 0, remainingSeconds: 0, totalWorkSeconds: 0 }
  const dayEarnings = isReady
    ? earnedSoFar(today, start, end, settings.breakMinutes, settings.salaryAmount, settings.salaryType, {
        workDaysPerWeek,
      })
    : { earned: 0, hourly: 0 }
  const earned = isWorkDay ? dayEarnings.earned : 0
  const week = isReady
    ? earnedSoFarThisWeek(today, {
        startTime: settings.startTime,
        endTime: settings.endTime,
        breakMinutes: settings.breakMinutes,
        workDays: settings.workDays,
        salaryAmount: settings.salaryAmount,
        salaryType: settings.salaryType,
        opts: { workDaysPerWeek },
      })
    : { earned: 0, hourly: 0 }
  const month = isReady
    ? earnedSoFarThisMonth(today, {
        startTime: settings.startTime,
        endTime: settings.endTime,
        breakMinutes: settings.breakMinutes,
        workDays: settings.workDays,
        salaryAmount: settings.salaryAmount,
        salaryType: settings.salaryType,
        opts: { workDaysPerWeek },
      })
    : { earned: 0, hourly: 0 }
  const percent = isWorkDay ? Math.round(prog.progress * 100) : 0
  const totalsFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })
  const mood = isReady ? (isWorkDay ? moodFor(today, start, end) : '今天休息。') : '热身中…'
  const currencySymbol = currencyCodeToSymbol(settings.currency)
  const liveStatus = liveStatusFor({
    isReady,
    isWorkDay,
    now: today,
    start,
    end,
    remainingSeconds: prog.remainingSeconds,
  })

  return (
    <section className="hud-shell" aria-label="PayMood 仪表盘">
      <div className="hud-top-actions" aria-label="顶部操作">
        <ColorModeToggle />
        <Link className="hud-icon-button" href="/settings" aria-label="打开设置">
          <span aria-hidden="true">⚙</span>
        </Link>
      </div>
      <header className="hud-header">
        <div className="hud-title">PayMood</div>
        <div className="hud-subtitle" aria-label="域名">
          paymood.work
        </div>
        <div className="hud-mood" aria-label="状态">
          {mood}
        </div>
        <div className="hud-live-status" aria-label="工作状态">
          {liveStatus}
        </div>
      </header>

      {!isWorkDay ? (
        <div className="hud-main hud-rest" aria-label="休息日">
          <div className="hud-rest-panel">
            <div className="hud-rest-title">今天就先休息。</div>
            <div className="hud-rest-sub">周/月累计还在这里。</div>
            <div className="hud-rest-status">{liveStatus}</div>
          </div>
          <section className="hud-metrics" aria-label="摘要">
            <div className="hud-metric">
              <span className="hud-metric-label">本周</span>
              <span className="hud-metric-value">{totalsFormat.format(week.earned)}</span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">本月</span>
              <span className="hud-metric-value">{totalsFormat.format(month.earned)}</span>
            </div>
          </section>
        </div>
      ) : (
        <div className="hud-main">
          <div className="hud-ring-wrap" aria-label="收入与进度">
            <CircularProgress value={prog.progress} size={420} />
            <div className="hud-center">
              <div className="hud-amount-line">
                <span className="hud-currency-symbol" aria-hidden="true">
                  {currencySymbol}
                </span>
                <span className="hud-amount">
                  <RollingNumber value={earned} />
                </span>
              </div>
              <div className="hud-percent" aria-label="工作进度">
                {percent}%
              </div>
            </div>
          </div>

          <section className="hud-metrics" aria-label="摘要">
            <div className="hud-metric">
              <span className="hud-metric-label">剩余</span>
              <span className="hud-metric-value">{formatHM(prog.remainingSeconds)}</span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">本周</span>
              <span className="hud-metric-value">{totalsFormat.format(week.earned)}</span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">本月</span>
              <span className="hud-metric-value">{totalsFormat.format(month.earned)}</span>
            </div>
          </section>
        </div>
      )}
      <footer className="hud-footnote" aria-label="Site information">
        <Link href="/about">About</Link> <Link href="/privacy">Privacy</Link>{' '}
        <Link href="/terms">Terms</Link> <Link href="/contact">Contact</Link>
      </footer>
      <AdSenseSlot />
    </section>
  )
}
