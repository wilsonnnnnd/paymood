'use client'
import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function PetMessageBubble({ visible, text }: { visible: boolean; text: string }) {
  return (
    <AnimatePresence initial={false}>
      {visible && text ? (
        <motion.div
          key={text}
          initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={[
            'pointer-events-none',
            'absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full',
            'min-w-25 max-w-70 rounded-2xl border border-(--border-ghost)',
            'bg-(--surface-raised)/90 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.10)]',
            'px-3 py-2 text-[0.82rem] leading-snug text-(--text)',
            'select-none',
          ].join(' ')}
          role="status"
          aria-live="polite"
        >
          {text}
          <span
            aria-hidden="true"
            className={[
              'absolute left-1/2 -translate-x-1/2 -bottom-1.5 h-3 w-3 rotate-45',
              'border-r border-b border-(--border-ghost) bg-(--surface-raised)/90',
            ].join(' ')}
            style={{ borderBottomRightRadius: 3 }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
