'use client'
import React, { useMemo } from 'react'

import slime1Idle from '../../craftpix/PNG/Slime1/With_shadow/Slime1_Idle_with_shadow.png'
import slime2Idle from '../../craftpix/PNG/Slime2/With_shadow/Slime2_Idle_with_shadow.png'
import slime3Idle from '../../craftpix/PNG/Slime3/With_shadow/Slime3_Idle_with_shadow.png'
import type { PetSpriteVariant } from './PetSprite'

type Sheet = typeof slime1Idle

const idleSheets: Record<PetSpriteVariant, Sheet> = {
  aqua: slime1Idle,
  undead: slime2Idle,
  magma: slime3Idle,
}

export default function PetCompanionImage({ variant, size }: { variant: PetSpriteVariant; size: number }) {
  const sheet = idleSheets[variant] ?? idleSheets.aqua
  const rowCount = 4

  const { frameSize, scale } = useMemo(() => {
    const frameSize = Math.floor(sheet.height / rowCount)
    return { frameSize, scale: size / frameSize }
  }, [sheet.height, size])

  return (
    <span
      aria-hidden="true"
      className="block select-none"
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${sheet.src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${sheet.width * scale}px ${sheet.height * scale}px`,
        backgroundPosition: '0px 0px',
      }}
    />
  )
}
