'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

import slime1Idle from '../../craftpix/PNG/Slime1/With_shadow/Slime1_Idle_with_shadow.png'
import slime1Walk from '../../craftpix/PNG/Slime1/With_shadow/Slime1_Walk_with_shadow.png'
import slime1Run from '../../craftpix/PNG/Slime1/With_shadow/Slime1_Run_with_shadow.png'
import slime1Hurt from '../../craftpix/PNG/Slime1/With_shadow/Slime1_Hurt_with_shadow.png'

import slime2Idle from '../../craftpix/PNG/Slime2/With_shadow/Slime2_Idle_with_shadow.png'
import slime2Walk from '../../craftpix/PNG/Slime2/With_shadow/Slime2_Walk_with_shadow.png'
import slime2Run from '../../craftpix/PNG/Slime2/With_shadow/Slime2_Run_with_shadow.png'
import slime2Hurt from '../../craftpix/PNG/Slime2/With_shadow/Slime2_Hurt_with_shadow.png'

import slime3Idle from '../../craftpix/PNG/Slime3/With_shadow/Slime3_Idle_with_shadow.png'
import slime3Walk from '../../craftpix/PNG/Slime3/With_shadow/Slime3_Walk_with_shadow.png'
import slime3Run from '../../craftpix/PNG/Slime3/With_shadow/Slime3_Run_with_shadow.png'
import slime3Hurt from '../../craftpix/PNG/Slime3/With_shadow/Slime3_Hurt_with_shadow.png'

export type PetSpriteMode = 'idle' | 'walk' | 'run' | 'hurt'
export type PetSpriteVariant = 'aqua' | 'undead' | 'magma'
type Sheet = typeof slime1Idle

const sprites: Record<PetSpriteVariant, Record<PetSpriteMode, Sheet>> = {
  aqua: { idle: slime1Idle, walk: slime1Walk, run: slime1Run, hurt: slime1Hurt },
  undead: { idle: slime2Idle, walk: slime2Walk, run: slime2Run, hurt: slime2Hurt },
  magma: { idle: slime3Idle, walk: slime3Walk, run: slime3Run, hurt: slime3Hurt },
}

export default function PetSprite({
  mode,
  flipX,
  size,
  variant,
}: {
  mode: PetSpriteMode
  flipX: boolean
  size: number
  variant: PetSpriteVariant
}) {
  const reduceMotion = useReducedMotion()
  const [frame, setFrame] = useState(0)
  const sheet = sprites[variant]?.[mode] ?? sprites.aqua[mode]
  const rowCount = 4
  const row = 0

  const { frameSize, columns, scale } = useMemo(() => {
    const frameSize = Math.floor(sheet.height / rowCount)
    const columns = Math.max(1, Math.floor(sheet.width / frameSize))
    const scale = size / frameSize
    return { frameSize, columns, scale }
  }, [sheet.height, sheet.width, size])

  useEffect(() => {
    setFrame(0)
  }, [mode])

  useEffect(() => {
    const maxFrame = columns
    if (maxFrame <= 1) {
      setFrame(0)
      return
    }
    const ms = 100
    const id = window.setInterval(() => {
      setFrame((current) => (current + 1) % maxFrame)
    }, ms)
    return () => window.clearInterval(id)
  }, [columns, mode, reduceMotion])

  const x = -frame * frameSize * scale
  const y = -row * frameSize * scale

  return (
    <div
      className="select-none"
      style={{
        width: size,
        height: size,
        transform: flipX ? 'scaleX(-1)' : undefined,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: size,
          height: size,
          backgroundImage: `url(${sheet.src})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${sheet.width * scale}px ${sheet.height * scale}px`,
          backgroundPosition: `${x}px ${y}px`,
        }}
      />
    </div>
  )
}
