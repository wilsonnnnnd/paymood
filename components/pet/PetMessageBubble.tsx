'use client'
import React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import PetCompanionImage from './PetCompanionImage'
import type { PetSpriteVariant } from './PetSprite'

function CompanionMiniBadge({ variant }: { variant: PetSpriteVariant }) {
  const imageSize = 92

  return (
    <span className="pet-companion-mini" aria-hidden="true">
      <span className="pet-companion-mini__glow" />
      <span className="pet-companion-mini__orb">
        <span
          className="pet-companion-mini__sprite"
          style={{ '--pet-companion-image-size': `${imageSize}px` } as React.CSSProperties}
        >
          <PetCompanionImage size={imageSize} variant={variant} />
        </span>
      </span>
    </span>
  )
}

export default function PetMessageBubble({
  visible,
  text,
  variant = 'aqua',
}: {
  visible: boolean
  text: string
  variant?: PetSpriteVariant
}) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence initial={false}>
      {visible && text ? (
        <motion.div
          key={text}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.95, filter: 'blur(7px)' }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97, filter: 'blur(6px)' }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="pet-companion-hud pet-companion-hud--hover"
          data-tone="focus"
          role="status"
          aria-live="polite"
        >
          <span className="pet-companion-hud__glow" aria-hidden="true" />
          <span className="pet-companion-hud__sheen" aria-hidden="true" />
          <CompanionMiniBadge variant={variant} />
          <span className="pet-companion-content pet-companion-content--center">
            <span className="pet-companion-content__text">{text}</span>
          </span>
          <span className="pet-companion-tail pet-companion-tail--bottom" aria-hidden="true" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
