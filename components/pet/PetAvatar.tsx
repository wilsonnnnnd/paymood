"use client"
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {motion, useReducedMotion} from 'framer-motion'
import type {PetMood} from '../../lib/pet/petMoodRules'

import slimeIdle from '../../craftpix/PNG/Slime3/With_shadow/Slime3_Idle_with_shadow.png'
import slimeWalk from '../../craftpix/PNG/Slime3/With_shadow/Slime3_Walk_with_shadow.png'
import slimeRun from '../../craftpix/PNG/Slime3/With_shadow/Slime3_Run_with_shadow.png'
import slimeAttack from '../../craftpix/PNG/Slime3/With_shadow/Slime3_Attack_with_shadow.png'

type Props = {
  mood: PetMood
  hovered: boolean
}

type Sheet = typeof slimeIdle

export default function PetAvatar({mood, hovered}: Props) {
  const reduceMotion = useReducedMotion()
  const timerRef = useRef<number | null>(null)
  const [frame, setFrame] = useState(0)
  const [attackActive, setAttackActive] = useState(false)

  const rowCount = 4

  const idleInfo = useMemo(() => {
    const frameSize = Math.floor(slimeIdle.height / rowCount)
    const columns = Math.max(1, Math.floor(slimeIdle.width / frameSize))
    return {frameSize, columns}
  }, [rowCount])

  const runInfo = useMemo(() => {
    const frameSize = Math.floor(slimeRun.height / rowCount)
    const columns = Math.max(1, Math.floor(slimeRun.width / frameSize))
    return {frameSize, columns}
  }, [rowCount])

  const walkInfo = useMemo(() => {
    const frameSize = Math.floor(slimeWalk.height / rowCount)
    const columns = Math.max(1, Math.floor(slimeWalk.width / frameSize))
    return {frameSize, columns}
  }, [rowCount])

  const attackInfo = useMemo(() => {
    const frameSize = Math.floor(slimeAttack.height / rowCount)
    const columns = Math.max(1, Math.floor(slimeAttack.width / frameSize))
    return {frameSize, columns}
  }, [rowCount])

  const action = attackActive ? 'attack' : mood === 'excited' || mood === 'happy' ? 'run' : mood === 'working' ? 'walk' : 'idle'
  const fps =
    action === 'attack'
      ? 18
      : mood === 'sleepy'
        ? 6
        : mood === 'tired'
          ? 7
          : mood === 'offwork'
            ? 8
            : action === 'run'
              ? 14
              : action === 'walk'
                ? 12
                : 10
  const sheet: Sheet = action === 'attack' ? slimeAttack : action === 'run' ? slimeRun : action === 'walk' ? slimeWalk : slimeIdle
  const {frameSize, columns} = action === 'attack' ? attackInfo : action === 'run' ? runInfo : action === 'walk' ? walkInfo : idleInfo

  useEffect(() => {
    if (!hovered || reduceMotion) return
    if (attackActive) return
    setAttackActive(true)
  }, [attackActive, hovered, reduceMotion])

  useEffect(() => {
    if (!attackActive || reduceMotion) return
    const durationMs = Math.max(1, Math.floor((attackInfo.columns / 18) * 1000))
    const id = window.setTimeout(() => setAttackActive(false), durationMs)
    return () => window.clearTimeout(id)
  }, [attackActive, attackInfo.columns, reduceMotion])

  useEffect(() => {
    setFrame(0)
  }, [action])

  useEffect(() => {
    if (reduceMotion) {
      setFrame(0)
      return
    }

    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }

    const ms = Math.max(24, Math.floor(1000 / fps))
    timerRef.current = window.setInterval(() => {
      setFrame(current => {
        if (action === 'attack' && current >= columns - 1) return current
        return (current + 1) % columns
      })
    }, ms)

    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [action, columns, fps, reduceMotion])

  const row = 0
  const x = -frame * frameSize
  const y = -row * frameSize

  return (
    <motion.div
      className="origin-bottom scale-[0.92] sm:scale-100"
      aria-hidden="true"
      animate={reduceMotion ? undefined : {y: mood === 'sleepy' ? 1 : mood === 'tired' ? 0.8 : 0}}
      transition={reduceMotion ? undefined : {duration: 0.45, ease: [0.22, 1, 0.36, 1]}}
    >
      <div
        className="h-16 w-16"
        style={{
          width: frameSize,
          height: frameSize,
          backgroundImage: `url(${sheet.src})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${sheet.width}px ${sheet.height}px`,
          backgroundPosition: `${x}px ${y}px`,
        }}
      />
    </motion.div>
  )
}
