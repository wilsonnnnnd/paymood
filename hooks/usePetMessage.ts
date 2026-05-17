import { useCallback, useEffect, useRef, useState } from 'react'
import type { PetMood, PetMoodInput } from '../lib/pet/petMoodRules'
import { getPetMessageContext, pickPetMessageWithContext } from '../lib/pet/petMessages'

export function usePetMessage({
  mood,
  input,
  rotateMs,
}: {
  mood: PetMood
  input: PetMoodInput
  rotateMs?: number | null
}) {
  const rotate = rotateMs ?? null
  const timerRef = useRef<number | null>(null)
  const seedRef = useRef(0)
  const [message, setMessage] = useState(() => pickPetMessageWithContext(mood, 'default', seedRef.current))

  const next = useCallback(() => {
    seedRef.current = seedRef.current + 1
    const context = getPetMessageContext(input, mood)
    setMessage(pickPetMessageWithContext(mood, context, seedRef.current))
  }, [input, mood])

  useEffect(() => {
    const base = input.currentTime ?? new Date()
    seedRef.current = Math.floor(base.getTime() / 1000)
    const context = getPetMessageContext(input, mood)
    setMessage(pickPetMessageWithContext(mood, context, seedRef.current))
  }, [input, mood])

  useEffect(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (!rotate || rotate <= 0) return
    if (typeof window === 'undefined') return

    timerRef.current = window.setInterval(next, rotate)
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [next, rotate])

  return message
}
