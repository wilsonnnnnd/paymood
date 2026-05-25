'use client'
import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type ConfirmModalVariant = 'default' | 'danger' | 'warning' | 'success'

export type ConfirmModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  variant?: ConfirmModalVariant
  confirmationValue?: string
  confirmationLabel?: string
  confirmationPlaceholder?: string
  confirmationHelpText?: string
  confirmationCaseSensitive?: boolean
  confirmationInputType?: 'text' | 'number'
  requireConfirmationValue?: boolean
}

const focusableSelector = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'

function getFocusable(container: HTMLElement | null) {
  if (!container) return []
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter((el) => {
    if (el.hasAttribute('disabled')) return false
    if (el.getAttribute('aria-disabled') === 'true') return false
    const style = window.getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden') return false
    return true
  })
}

function normalizeCompareValue(value: string, caseSensitive: boolean) {
  return caseSensitive ? value : value.toLowerCase()
}

export default function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  loading = false,
  variant = 'default',
  confirmationValue,
  confirmationLabel,
  confirmationPlaceholder,
  confirmationHelpText,
  confirmationCaseSensitive = false,
  confirmationInputType = 'text',
  requireConfirmationValue = false,
}: ConfirmModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  const [mounted, setMounted] = useState(open)
  const [exiting, setExiting] = useState(false)
  const [confirmationDraft, setConfirmationDraft] = useState('')
  const lastActiveRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null)

  const accentVars = useMemo(() => {
    if (variant === 'danger') {
      return { accent: 'var(--danger)', glow: 'var(--danger-glow)' }
    }
    if (variant === 'success') {
      return { accent: 'var(--success)', glow: 'var(--success-glow)' }
    }
    if (variant === 'warning') {
      return { accent: 'var(--accent)', glow: 'var(--accent-glow)' }
    }
    return { accent: 'var(--accent)', glow: 'var(--accent-glow)' }
  }, [variant])

  const expected = requireConfirmationValue ? String(confirmationValue ?? '') : ''
  const matchesConfirmation = useMemo(() => {
    if (!requireConfirmationValue) return true
    const input = normalizeCompareValue(String(confirmationDraft), confirmationCaseSensitive)
    const value = normalizeCompareValue(expected, confirmationCaseSensitive)
    return input === value
  }, [confirmationCaseSensitive, confirmationDraft, expected, requireConfirmationValue])

  const confirmDisabled = loading || (requireConfirmationValue ? !matchesConfirmation : false)

  useEffect(() => {
    if (open) {
      lastActiveRef.current = document.activeElement as HTMLElement | null
      setMounted(true)
      setExiting(false)
      setConfirmationDraft('')
      return
    }

    if (!mounted) return
    setExiting(true)
    const t = window.setTimeout(() => {
      setMounted(false)
      setExiting(false)
      setConfirmationDraft('')
    }, 180)
    return () => window.clearTimeout(t)
  }, [mounted, open])

  useEffect(() => {
    if (!mounted) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted || exiting) return
    const t = window.setTimeout(() => {
      const focusables = getFocusable(panelRef.current)
      const next = focusables[0] ?? cancelButtonRef.current ?? panelRef.current
      next?.focus?.()
    }, 0)
    return () => window.clearTimeout(t)
  }, [exiting, mounted])

  useEffect(() => {
    if (mounted) return
    lastActiveRef.current?.focus?.()
  }, [mounted])

  const requestClose = () => {
    if (loading) return
    onCancel?.()
    onOpenChange(false)
  }

  const onOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    requestClose()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      requestClose()
      return
    }

    if (e.key !== 'Tab') return
    const focusables = getFocusable(panelRef.current)
    if (!focusables.length) {
      e.preventDefault()
      panelRef.current?.focus?.()
      return
    }

    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement as HTMLElement | null
    const isShift = e.shiftKey

    if (isShift && active === first) {
      e.preventDefault()
      last.focus()
      return
    }

    if (!isShift && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const handleConfirm = async () => {
    if (confirmDisabled) return
    try {
      await onConfirm?.()
    } catch {
      return
    }
    onOpenChange(false)
  }

  if (!mounted) return null

  const overlayClass = exiting ? 'cm-overlay-out' : 'cm-overlay-in'
  const panelClass = exiting ? 'cm-panel-out' : 'cm-panel-in'

  const node = (
    <div
      className={`fixed inset-0 z-100 flex items-end justify-center px-4 py-6 sm:items-center ${overlayClass}`}
      onMouseDown={onOverlayMouseDown}
      onKeyDown={onKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div className="fixed inset-0 bg-overlay backdrop-blur-sm" aria-hidden="true" />
      <div
        ref={panelRef}
        tabIndex={-1}
        style={
          {
            '--cm-accent': accentVars.accent,
            '--cm-accent-glow': accentVars.glow,
          } as React.CSSProperties
        }
        className={[
          'relative w-full max-w-130 overflow-hidden rounded-[22px]',
          'border border-(--s-line-ghost) bg-(--s-section-bg)',
          'shadow-(--shadow) backdrop-blur-2xl',
          'outline-none',
          panelClass,
          'pb-[max(env(safe-area-inset-bottom),0px)]',
        ].join(' ')}
      >
        <div className="px-5 pb-4 pt-5 sm:px-6 sm:pb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div id={titleId} className="text-primary text-[1rem] font-[520] leading-snug tracking-[-0.01em]">
                {title}
              </div>
              {description ? (
                <div id={descriptionId} className="text-secondary mt-2 text-[0.84rem] leading-relaxed opacity-80">
                  {description}
                </div>
              ) : null}
            </div>
          </div>

          {requireConfirmationValue ? (
            <div className="mt-4">
              {confirmationLabel ? (
                <div className="text-secondary mb-2 text-xs tracking-wide">{confirmationLabel}</div>
              ) : null}
              <input
                className={['setting-input w-full', 'focus-visible:outline-none'].join(' ')}
                value={confirmationDraft}
                onChange={(e) => setConfirmationDraft(e.target.value)}
                placeholder={confirmationPlaceholder}
                type={confirmationInputType}
                inputMode={confirmationInputType === 'number' ? 'numeric' : undefined}
                disabled={loading}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {confirmationHelpText ? (
                <div className="text-secondary mt-2 text-xs leading-relaxed">{confirmationHelpText}</div>
              ) : null}
              {!matchesConfirmation ? <div className="text-secondary mt-2 text-xs">输入匹配后才能继续。</div> : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 border-t border-(--s-line-ghost) bg-(--s-ctrl-bg) px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
          <button
            ref={cancelButtonRef}
            type="button"
            className={['setting-action setting-action--quiet', 'focus-visible:outline-none'].join(' ')}
            onClick={requestClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={['setting-action setting-action--modal', 'focus-visible:outline-none'].join(' ')}
            onClick={handleConfirm}
            disabled={confirmDisabled}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(node, document.body)
}
