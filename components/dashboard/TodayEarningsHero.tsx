'use client'

import React, { useEffect, useRef, useState } from 'react'
import CircularProgress from '../CircularProgress'

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
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

export default function TodayEarningsHero({
  earned,
  percent,
  progress,
  currencySymbol,
  size = 420,
}: {
  earned: number
  percent: number
  progress: number
  currencySymbol: string
  size?: number
}) {
  return (
    <div className="hud-ring-wrap" aria-label="收入与进度">
      <div className="hud-disc-aura" aria-hidden="true" />
      <div className="hud-disc-plate" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="hud-ring-ticks" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, index) => (
          <span key={index} style={{ '--tick': index } as React.CSSProperties} />
        ))}
      </div>
      <CircularProgress value={progress} size={size} />
      <div className="hud-center">
        <div className="hud-center-label">Today Earned</div>
        <div className="hud-amount-line">
          <span className="hud-currency-symbol" aria-hidden="true">
            {currencySymbol}
          </span>
          <span className="hud-amount">
            <RollingNumber value={earned} />
          </span>
        </div>
        <div className="hud-percent" aria-label="今日进度">
          {percent}% today
        </div>
      </div>
    </div>
  )
}
