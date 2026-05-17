"use client"
import React, {useEffect, useMemo, useState} from 'react'
import {motion} from 'framer-motion'
import {usePetWalker} from '../../hooks/usePetWalker'
import {useClock} from '../../hooks/useClock'
import {useSettings} from '../../hooks/useSettings'
import {earnedSoFar, workProgress} from '../../lib/earnings'
import {getHoverMessageContext, pickHoverMessageWithContext} from '../../lib/pet/petMessages'
import {usePetMood} from '../../hooks/usePetMood'
import PetSprite from './PetSprite'
import PetMessageBubble from './PetMessageBubble'

export default function FloatingPet() {
  const {settings, ready} = useSettings()
  const now = useClock(1000)
  const [compact, setCompact] = useState(false)
  const {x, y, isMoving, flipX, pause, resume} = usePetWalker(
    compact ? {petSize: 64, padding: 14, minWaitMs: 4500, maxWaitMs: 8500} : {petSize: 84, padding: 24, minWaitMs: 4000, maxWaitMs: 8000},
  )
  const [hovered, setHovered] = useState(false)
  const [message, setMessage] = useState('')
  const variant = settings.petVariant ?? 'aqua'

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return
    const media = window.matchMedia('(max-width: 420px)')
    const handler = () => setCompact(media.matches)
    handler()
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  const petInput = useMemo(() => {
    if (!ready || !now) {
      return {
        workProgress: 0,
        earnedAmount: 0,
        isWorkTime: false,
        isWorkDay: true,
        minutesUntilOffwork: 0,
        minutesSinceWorkStart: undefined,
        currentTime: now ?? null,
      }
    }

    const isWorkDay = settings.workDays?.includes(now.getDay()) ?? true
    const workDaysPerWeek = settings.workDays?.length ? settings.workDays.length : 5
    const [yy, mm, dd] = [now.getFullYear(), now.getMonth(), now.getDate()]
    const [sh, sm] = settings.startTime.split(':').map(Number)
    const [eh, em] = settings.endTime.split(':').map(Number)
    const start = new Date(yy, mm, dd, sh, sm)
    const end = new Date(yy, mm, dd, eh, em)
    const isWorkTime = isWorkDay && now.getTime() >= start.getTime() && now.getTime() < end.getTime()

    const p = isWorkTime ? workProgress(now, start, end, settings.breakMinutes).progress : 0
    const earned = isWorkTime
      ? earnedSoFar(now, start, end, settings.breakMinutes, settings.salaryAmount, settings.salaryType, {workDaysPerWeek}).earned
      : 0
    const minutesUntilOffwork = isWorkTime ? Math.max(0, Math.floor((end.getTime() - now.getTime()) / 60000)) : 0
    const minutesSinceWorkStart = isWorkTime ? Math.max(0, Math.floor((now.getTime() - start.getTime()) / 60000)) : undefined

    return {
      workProgress: p * 100,
      earnedAmount: earned,
      isWorkTime,
      isWorkDay,
      minutesUntilOffwork,
      minutesSinceWorkStart,
      currentTime: now,
    }
  }, [
    now,
    ready,
    settings.breakMinutes,
    settings.endTime,
    settings.salaryAmount,
    settings.salaryType,
    settings.startTime,
    settings.workDays,
  ])

  const mood = usePetMood(petInput)

  const hoverContext = useMemo(
    () => getHoverMessageContext(petInput, mood),
    [mood, petInput.currentTime, petInput.isWorkDay, petInput.isWorkTime, petInput.minutesUntilOffwork],
  )

  useEffect(() => {
    if (!hovered) {
      setMessage('')
      return
    }
    setMessage(pickHoverMessageWithContext(hoverContext, Date.now()))
  }, [hoverContext, hovered])

  const mode = useMemo(() => {
    if (hovered) return mood === 'tired' ? ('hurt' as const) : ('idle' as const)
    if (isMoving) return mood === 'happy' || mood === 'excited' ? ('run' as const) : ('walk' as const)
    return mood === 'tired' ? ('hurt' as const) : ('idle' as const)
  }, [hovered, isMoving, mood])

  const onEnter = () => {
    setHovered(true)
    pause()
  }

  const onLeave = () => {
    setHovered(false)
    resume()
  }

  return (
    <motion.div
      className="pointer-events-auto fixed left-0 top-0 z-40"
      style={{x, y}}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      role="button"
      tabIndex={0}
      aria-label="桌宠"
    >
      <div className="relative h-[84px] w-[84px]">
        <PetMessageBubble visible={hovered} text={message} />
        <div className="absolute inset-0 grid place-items-center">
          <div className="drop-shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
            <PetSprite mode={mode} flipX={flipX} size={84} variant={variant} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
