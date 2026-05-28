'use client'

import { useEffect, useState } from 'react'
import { getNextPublicHoliday, type PublicHoliday } from '../services/publicHoliday'

export function usePublicHoliday() {
  const [holiday, setHoliday] = useState<PublicHoliday | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const next = await getNextPublicHoliday()
        if (cancelled) return
        setHoliday(next)
        setError(null)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error('PublicHoliday error'))
        setHoliday(null)
      } finally {
        if (cancelled) return
        setLoading(false)
      }
    }

    setLoading(true)
    run()

    return () => {
      cancelled = true
    }
  }, [])

  return { holiday, loading, error }
}
