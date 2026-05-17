"use client"
import React, {useEffect, useRef, useState} from 'react'
import Link from 'next/link'
import CircularProgress from './CircularProgress'
import ColorModeToggle from './ColorModeToggle'
import {useSettings} from '../hooks/useSettings'
import {useClock} from '../hooks/useClock'
import {earnedSoFar, earnedSoFarThisMonth, earnedSoFarThisWeek, workProgress} from '../lib/earnings'

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
  if (normalized === 'CNY') return '¥'
  return '$'
}

function RollingChar({from, to, direction, animate}: {from: string; to: string; direction: number; animate: boolean}) {
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
      <span className="roll-stack" style={{transform: `translate3d(0, ${yEm}em, 0)`}}>
        <span className="roll-item">{stack[0]}</span>
        <span className="roll-item">{stack[1]}</span>
      </span>
    </span>
  )
}

const defaultMoneyFormat = (v: number) => v.toFixed(2)

function RollingNumber({value, format = defaultMoneyFormat}: {value: number; format?: (v: number) => string}) {
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
    setMaxLen(current => Math.max(current, next.length))

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
    <span className="roll-number" aria-label={toText} style={{width: `${len}ch`}}>
      {Array.from({length: len}).map((_, index) => (
        <RollingChar key={index} from={prevPadded[index]} to={nextPadded[index]} direction={direction} animate={animating} />
      ))}
    </span>
  )
}

function moodFor(now: Date, start: Date, end: Date) {
  if (now.getTime() < start.getTime()) return '系统启动中…'
  if (now.getTime() >= end.getTime()) return '下班啦。'

  const hour = now.getHours()
  if (hour >= 12 && hour < 14) return '充电模式。'

  const weekday = now.getDay()
  switch (weekday) {
    case 1:
      return '慢慢进入状态。'
    case 2:
      return '稳定推进。'
    case 3:
      return '周三生存模式。'
    case 4:
      return '快到啦。'
    case 5:
      return '逃离速度接近中。'
    default:
      return '默默计算中…'
  }
}

export default function Dashboard() {
  const {settings, ready} = useSettings()
  const now = useClock(1000)  
  const isReady = ready && now !== null
  const workDaysPerWeek = settings.workDays?.length ? settings.workDays.length : 5
  const isWorkDay = isReady ? (settings.workDays?.includes((now as Date).getDay()) ?? true) : true

  const today = now ?? new Date(0)
  const [y, m, d] = [today.getFullYear(), today.getMonth(), today.getDate()]
  const [sh, sm] = settings.startTime.split(':').map(Number)
  const [eh, em] = settings.endTime.split(':').map(Number)
  const start = new Date(y, m, d, sh, sm)
  const end = new Date(y, m, d, eh, em)

  const prog = isReady && isWorkDay ? workProgress(today, start, end, settings.breakMinutes) : {progress: 0, elapsedSeconds: 0, remainingSeconds: 0, totalWorkSeconds: 0}
  const {earned, hourly} =
    isReady && isWorkDay ? earnedSoFar(today, start, end, settings.breakMinutes, settings.salaryAmount, settings.salaryType, {workDaysPerWeek}) : {earned: 0, hourly: 0}
  const week =
    isReady && isWorkDay
      ? earnedSoFarThisWeek(today, {
          startTime: settings.startTime,
          endTime: settings.endTime,
          breakMinutes: settings.breakMinutes,
          workDays: settings.workDays,
          salaryAmount: settings.salaryAmount,
          salaryType: settings.salaryType,
          opts: {workDaysPerWeek},
        })
      : {earned: 0, hourly: 0}
  const month =
    isReady && isWorkDay
      ? earnedSoFarThisMonth(today, {
          startTime: settings.startTime,
          endTime: settings.endTime,
          breakMinutes: settings.breakMinutes,
          workDays: settings.workDays,
          salaryAmount: settings.salaryAmount,
          salaryType: settings.salaryType,
          opts: {workDaysPerWeek},
        })
      : {earned: 0, hourly: 0}
  const percent = isWorkDay ? Math.round(prog.progress * 100) : 0
  const totalsFormat = new Intl.NumberFormat(undefined, {maximumFractionDigits: 0})
  const mood = isReady ? (isWorkDay ? moodFor(today, start, end) : '今天休息。') : '热身中…'
  const currencySymbol = currencyCodeToSymbol(settings.currency)

  return (
    <section className="hud-shell" aria-label="Workday emotional dashboard">
      <div className="hud-top-actions" aria-label="顶部操作">
        <ColorModeToggle />
        <Link className="hud-icon-button" href="/settings" aria-label="打开设置">
          <span aria-hidden="true">⚙</span>
        </Link>
      </div>
      <header className="hud-header">
        <div className="hud-title">Cozy Earnings Dashboard</div>
        <div className="hud-mood" aria-label="状态">
          {mood}
        </div>
      </header>

      {!isWorkDay ? (
        <main className="hud-main hud-rest" aria-label="休息日">
          <div className="hud-rest-panel">
            <div className="hud-rest-title">今天不需要打卡。</div>
            <div className="hud-rest-sub">好好休息一下吧。</div>
          </div>
        </main>
      ) : (
        <main className="hud-main">
        <div className="hud-ring-wrap" aria-label="Earnings and progress">
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
            <div className="hud-percent">{percent}% 已完成</div>
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
          <div className="hud-metric">
            <span className="hud-metric-label">时薪</span>
            <span className="hud-metric-value">{hourly.toFixed(2)}/h</span>
          </div>
        </section>
      </main>
      )}
    </section>
  )
}
