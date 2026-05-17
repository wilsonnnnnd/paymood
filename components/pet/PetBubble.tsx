'use client'
import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { PetMood } from '../../lib/pet/petMoodRules'

export default function PetBubble({ mood, text, emphasize }: { mood: PetMood; text: string; emphasize: boolean }) {
  const moodHue =
    mood === 'excited'
      ? 'bg-amber-400/18'
      : mood === 'happy'
      ? 'bg-amber-400/14'
      : mood === 'sleepy'
      ? 'bg-sky-400/10'
      : mood === 'tired'
      ? 'bg-rose-400/10'
      : mood === 'working'
      ? 'bg-sky-400/8'
      : mood === 'offwork'
      ? 'bg-slate-400/8'
      : 'bg-white/10'

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
          'max-w-[180px] rounded-2xl border border-[var(--border)] sm:max-w-[220px]',
          'bg-[var(--surface)] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.10)]',
          'px-3 py-2 text-[0.8rem] leading-snug text-[color:var(--text)] sm:px-3.5 sm:py-2.5 sm:text-[0.86rem]',
          'relative',
          moodHue,
          emphasize ? 'opacity-100' : 'opacity-80',
        ].join(' ')}
        role="status"
        aria-live="polite"
      >
        {text}
        <span
          aria-hidden="true"
          className={[
            'absolute -right-1.5 bottom-2.5 h-3 w-3 rotate-45 sm:bottom-3',
            'border-r border-b border-[var(--border)]',
            'bg-[var(--surface)]',
          ].join(' ')}
          style={{ borderBottomRightRadius: 3 }}
        />
      </motion.div>
    </AnimatePresence>
  )
}
