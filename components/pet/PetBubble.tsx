'use client'
import React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { PetMood } from '../../lib/pet/petMoodRules'
import PetCompanionImage from './PetCompanionImage'
import type { PetSpriteVariant } from './PetSprite'

function moodTone(mood: PetMood) {
  if (mood === 'excited' || mood === 'happy') return 'warm'
  if (mood === 'tired') return 'rose'
  if (mood === 'sleepy') return 'dream'
  if (mood === 'working') return 'focus'
  return 'calm'
}

function CompanionBadge({ mood, variant }: { mood: PetMood; variant: PetSpriteVariant }) {
  const imageSize = 64

  return (
    <div className="pet-companion-badge" aria-hidden="true">
      <span className="pet-companion-badge__halo" />
      <span className="pet-companion-badge__orb">
        <span
          className="pet-companion-badge__sprite"
          style={{ '--pet-companion-image-size': `${imageSize}px` } as React.CSSProperties}
        >
          <PetCompanionImage size={imageSize} variant={variant} />
        </span>
      </span>
      <span className="pet-companion-badge__status" data-tone={moodTone(mood)} />
    </div>
  )
}

export default function PetBubble({
  mood,
  text,
  emphasize,
  variant = 'aqua',
}: {
  mood: PetMood
  text: string
  emphasize: boolean
  variant?: PetSpriteVariant
}) {
  const reduceMotion = useReducedMotion()
  const tone = moodTone(mood)

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${mood}:${text}`}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96, filter: 'blur(6px)' }}
        animate={
          reduceMotion
            ? { opacity: emphasize ? 1 : 0.9 }
            : { opacity: emphasize ? 1 : 0.92, y: 0, scale: emphasize ? 1.018 : 1, filter: 'blur(0px)' }
        }
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97, filter: 'blur(6px)' }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="pet-companion-hud pet-companion-hud--ambient"
        data-tone={tone}
        data-emphasized={emphasize ? 'true' : 'false'}
        role="status"
        aria-live="polite"
      >
        <span className="pet-companion-hud__glow" aria-hidden="true" />
        <span className="pet-companion-hud__sheen" aria-hidden="true" />
        <CompanionBadge mood={mood} variant={variant} />
        <span className="pet-companion-content">
          <span className="pet-companion-content__text">{text}</span>
        </span>
        <span className="pet-companion-tail pet-companion-tail--right" aria-hidden="true" />
      </motion.div>
    </AnimatePresence>
  )
}
