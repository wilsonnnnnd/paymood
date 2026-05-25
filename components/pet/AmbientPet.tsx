'use client'
import React, { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useClock } from '../../hooks/useClock'
import { useSettings } from '../../hooks/useSettings'
import { calculateWorkEarnings } from '../../lib/earnings'
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

    const workDaysPerWeek = settings.workDays?.length ? settings.workDays.length : 5
    const earnings = calculateWorkEarnings(now, {
      startTime: settings.startTime,
      endTime: settings.endTime,
      breakMinutes: settings.breakMinutes,
      workDays: settings.workDays,
      salaryAmount: settings.salaryAmount,
      salaryType: settings.salaryType,
      opts: { workDaysPerWeek },
    })
    const { start, end, isWorkDay } = earnings
    const isWorkTime = isWorkDay && now.getTime() >= start.getTime() && now.getTime() < end.getTime()
    const minutesUntilOffwork = isWorkTime ? Math.max(0, Math.floor((end.getTime() - now.getTime()) / 60000)) : 0
    const minutesSinceWorkStart = isWorkTime
      ? Math.max(0, Math.floor((now.getTime() - start.getTime()) / 60000))
      : undefined

    return {
      workProgress: isWorkTime ? earnings.progress.progress * 100 : 0,
      earnedAmount: isWorkTime ? earnings.earned : 0,
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
          'h-16.5 w-16.5 rounded-[22px] sm:h-19 sm:w-19 sm:rounded-[26px]',
          'border border-(--border-ghost) bg-(--surface-raised) backdrop-blur-xl',
          'shadow-[0_22px_60px_rgba(0,0,0,0.15)]',
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
            'bg-linear-to-tr from-sky-300/20 via-white/5 to-indigo-300/14',
            'blur-2xl',
          ].join(' ')}
          animate={reduceMotion ? undefined : { opacity: [0.45, 0.7, 0.45] }}
          transition={reduceMotion ? undefined : { duration: 6, ease: 'easeInOut', repeat: Infinity }}
        />
      </motion.div>
    </div>
  )
}
