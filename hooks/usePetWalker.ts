import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { animate, useMotionValue } from 'framer-motion'

type Options = {
  petSize?: number
  padding?: number
  minWaitMs?: number
  maxWaitMs?: number
}

function randInt(min: number, max: number) {
  const a = Math.ceil(min)
  const b = Math.floor(max)
  if (b <= a) return a
  return a + Math.floor(Math.random() * (b - a + 1))
}

function clamp(v: number, min: number, max: number) {
  if (!isFinite(v)) return min
  return Math.min(max, Math.max(min, v))
}

function distance(ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax
  const dy = by - ay
  return Math.sqrt(dx * dx + dy * dy)
}

export function usePetWalker(opts?: Options) {
  const petSize = opts?.petSize ?? 80
  const padding = opts?.padding ?? 24
  const minWaitMs = opts?.minWaitMs ?? 4000
  const maxWaitMs = opts?.maxWaitMs ?? 8000

  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const [isMoving, setIsMoving] = useState(false)
  const [flipX, setFlipX] = useState(false)
  const pausedRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)
  const animStopRef = useRef<(() => void) | null>(null)
  const startMoveRef = useRef<(() => void) | null>(null)
  const scheduleNextRef = useRef<(() => void) | null>(null)
  const moveIdRef = useRef(0)

  const bounds = useMemo(() => {
    const w = viewport?.w ?? 0
    const h = viewport?.h ?? 0
    const minX = padding
    const minY = padding
    const maxX = Math.max(minX, w - padding - petSize)
    const maxY = Math.max(minY, h - padding - petSize)
    return { minX, minY, maxX, maxY, w, h }
  }, [padding, petSize, viewport?.h, viewport?.w])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const apply = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [])

  useEffect(() => {
    if (!viewport) return
    x.set(bounds.maxX)
    y.set(bounds.maxY)
  }, [bounds.maxX, bounds.maxY, viewport, x, y])

  const stop = useCallback(() => {
    moveIdRef.current += 1
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (animStopRef.current) {
      animStopRef.current()
      animStopRef.current = null
    }
    setIsMoving(false)
  }, [])

  const moveToPoint = useCallback(
    (nx: number, ny: number, opts?: { scheduleAfter?: boolean }) => {
      if (!viewport) return
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (animStopRef.current) {
        animStopRef.current()
        animStopRef.current = null
      }

      const targetX = clamp(nx, bounds.minX, bounds.maxX)
      const targetY = clamp(ny, bounds.minY, bounds.maxY)
      const cx = x.get()
      const cy = y.get()
      const currentMoveId = moveIdRef.current + 1
      moveIdRef.current = currentMoveId

      setFlipX(targetX < cx)
      setIsMoving(true)

      const dist = distance(cx, cy, targetX, targetY)
      const speed = 42
      const duration = clamp(dist / speed, 0.7, 7.5)
      const ax = animate(x, targetX, { duration, ease: [0.22, 1, 0.36, 1] })
      const ay = animate(y, targetY, { duration, ease: [0.22, 1, 0.36, 1] })
      animStopRef.current = () => {
        ax.stop()
        ay.stop()
      }

      Promise.all([ax.finished, ay.finished])
        .catch(() => {})
        .finally(() => {
          if (moveIdRef.current !== currentMoveId) return
          animStopRef.current = null
          if (pausedRef.current) return
          setIsMoving(false)
          if (opts?.scheduleAfter ?? true) scheduleNextRef.current?.()
        })
    },
    [bounds.maxX, bounds.maxY, bounds.minX, bounds.minY, viewport, x, y],
  )

  const pickNext = useCallback(() => {
    const attemptMax = 10
    const currentX = x.get()
    const currentY = y.get()
    for (let i = 0; i < attemptMax; i++) {
      const nx = randInt(bounds.minX, bounds.maxX)
      const ny = randInt(bounds.minY, bounds.maxY)
      const inTopRightDanger = nx > bounds.w - 220 && ny < 140
      const tooClose = distance(currentX, currentY, nx, ny) < 90
      if (inTopRightDanger || tooClose) continue
      return { nx, ny }
    }
    return { nx: clamp(currentX, bounds.minX, bounds.maxX), ny: clamp(currentY, bounds.minY, bounds.maxY) }
  }, [bounds.maxX, bounds.maxY, bounds.minX, bounds.minY, bounds.w, x, y])

  const scheduleNext = useCallback(() => {
    if (typeof window === 'undefined') return
    if (pausedRef.current) return
    if (!viewport) return
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => startMoveRef.current?.(), randInt(minWaitMs, maxWaitMs))
  }, [maxWaitMs, minWaitMs, viewport])

  const startMove = useCallback(() => {
    if (pausedRef.current) return
    if (!viewport) return

    const { nx, ny } = pickNext()
    moveToPoint(nx, ny)
  }, [moveToPoint, pickNext, viewport])

  useEffect(() => {
    startMoveRef.current = startMove
  }, [startMove])

  useEffect(() => {
    scheduleNextRef.current = scheduleNext
  }, [scheduleNext])

  useEffect(() => {
    if (!viewport) return
    scheduleNext()
    return stop
  }, [scheduleNext, stop, viewport])

  const pause = () => {
    pausedRef.current = true
    stop()
  }

  const resume = () => {
    pausedRef.current = false
    scheduleNext()
  }

  const moveTo = useCallback(
    (clientX: number, clientY: number) => {
      moveToPoint(clientX - petSize / 2, clientY - petSize / 2)
    },
    [moveToPoint, petSize],
  )

  return { x, y, isMoving, flipX, pause, resume, moveTo, petSize }
}
