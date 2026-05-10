import {useEffect, useState} from 'react'

export function useClock(intervalMs = 1000) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
