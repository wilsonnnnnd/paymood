'use client'
import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { PetMood } from '../../lib/pet/petMoodRules'

export default function PetBubble({ mood, text, emphasize }: { mood: PetMood; text: string; emphasize: boolean }) {
  // Mood tints use semantic glow tokens — consistent across light / dark
  const moodBg =
    mood === 'excited' || mood === 'happy'
      ? 'color-mix(in srgb, var(--glow-warning) 28%, var(--surface-raised))'
      : mood === 'tired'
      ? 'color-mix(in srgb, var(--glow-danger) 26%, var(--surface-raised))'
      : mood === 'sleepy'
      ? 'color-mix(in srgb, var(--glow-ambient) 24%, var(--surface-raised))'
      : mood === 'working'
      ? 'color-mix(in srgb, var(--glow-accent) 22%, var(--surface-raised))'
      : 'var(--surface-raised)'

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${mood}:${text}`}
        initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className={[
          'pointer-events-none select-none',
          'max-w-45 rounded-2xl border border-(--border-ghost) sm:max-w-55',
          'backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.10)]',
          'px-3 py-2 text-[0.8rem] leading-snug text-(--text) sm:px-3.5 sm:py-2.5 sm:text-[0.86rem]',
          'relative',
          emphasize ? 'opacity-100' : 'opacity-80',
        ].join(' ')}
        style={{ background: moodBg }}
        role="status"
        aria-live="polite"
      >
        {text}
        <span
          aria-hidden="true"
          className={[
            'absolute -right-1.5 bottom-2.5 h-3 w-3 rotate-45 sm:bottom-3',
            'border-r border-b border-(--border-ghost)',
          ].join(' ')}
          style={{ background: moodBg, borderBottomRightRadius: 3 }}
        />
      </motion.div>
    </AnimatePresence>
  )
}
