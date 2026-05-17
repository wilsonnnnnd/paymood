'use client'
import React, { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useClock } from '../../hooks/useClock'
import { useSettings } from '../../hooks/useSettings'
import { earnedSoFar, workProgress } from '../../lib/earnings'
import { usePetMessage } from '../../hooks/usePetMessage'
import { usePetMood } from '../../hooks/usePetMood'
import PetAvatar from './PetAvatar'
import PetBubble from './PetBubble'

export default function AmbientPet() {
  const { settings, ready } = useSettings()
  const now = useClock(1000)
  const reduceMotion = useReducedMotion()
  const [hovered, setHovered] = useState(false)

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
    const [y, m, d] = [now.getFullYear(), now.getMonth(), now.getDate()]
    const [sh, sm] = settings.startTime.split(':').map(Number)
    const [eh, em] = settings.endTime.split(':').map(Number)
    const start = new Date(y, m, d, sh, sm)
    const end = new Date(y, m, d, eh, em)
    const isWorkTime = isWorkDay && now.getTime() >= start.getTime() && now.getTime() < end.getTime()

    const p = isWorkTime ? workProgress(now, start, end, settings.breakMinutes).progress : 0
    const earned = isWorkTime
      ? earnedSoFar(now, start, end, settings.breakMinutes, settings.salaryAmount, settings.salaryType, {
          workDaysPerWeek,
        }).earned
      : 0
    const minutesUntilOffwork = isWorkTime ? Math.max(0, Math.floor((end.getTime() - now.getTime()) / 60000)) : 0
    const minutesSinceWorkStart = isWorkTime
      ? Math.max(0, Math.floor((now.getTime() - start.getTime()) / 60000))
      : undefined

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
  const message = usePetMessage({ mood, input: petInput, rotateMs: null })

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex items-end gap-2 sm:bottom-6 sm:right-6 sm:gap-3">
      <PetBubble mood={mood} text={message} emphasize={hovered} />

      <motion.div
        className={[
          'pointer-events-auto',
          'relative grid place-items-center',
          'h-[66px] w-[66px] rounded-[22px] sm:h-[76px] sm:w-[76px] sm:rounded-[26px]',
          'border border-[var(--border)] bg-[var(--surface-strong)] backdrop-blur-xl',
          'shadow-[0_28px_80px_rgba(0,0,0,0.18)]',
        ].join(' ')}
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -5, 0],
                scale: [1, 1.01, 1],
              }
        }
        transition={reduceMotion ? undefined : { duration: 4.6, ease: 'easeInOut', repeat: Infinity }}
        whileHover={reduceMotion ? undefined : { y: -8, scale: 1.02 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        role="button"
        tabIndex={0}
        aria-label="桌宠"
      >
        <PetAvatar mood={mood} hovered={hovered} />
        <motion.div
          aria-hidden="true"
          className={[
            'absolute -inset-6 -z-10 rounded-[40px]',
            'bg-gradient-to-tr from-sky-300/20 via-white/5 to-amber-300/20',
            'blur-2xl',
          ].join(' ')}
          animate={reduceMotion ? undefined : { opacity: [0.45, 0.7, 0.45] }}
          transition={reduceMotion ? undefined : { duration: 6, ease: 'easeInOut', repeat: Infinity }}
        />
      </motion.div>
    </div>
  )
}
