export type PetMood = 'idle' | 'working' | 'sleepy' | 'happy' | 'excited' | 'tired' | 'offwork'

export type PetMoodInput = {
  workProgress: number
  earnedAmount: number
  isWorkTime: boolean
  isWorkDay?: boolean
  minutesUntilOffwork: number
  currentTime: Date | null
  minutesSinceWorkStart?: number
}

export function isLateNight(d: Date) {
  const h = d.getHours()
  const m = d.getMinutes()
  if (h < 6) return true
  if (h > 21) return true
  return h === 21 && m >= 30
}

function clamp(v: number, min: number, max: number) {
  if (!isFinite(v)) return min
  return Math.min(max, Math.max(min, v))
}

export function getPetMood(input: PetMoodInput): PetMood {
  if (!input.currentTime) return 'idle'

  const progress = clamp(input.workProgress, 0, 100)
  const minutesUntilOffwork = clamp(input.minutesUntilOffwork, 0, 24 * 60)

  if (!input.isWorkTime) return 'offwork'
  if (progress >= 95) return 'excited'
  if (progress >= 80) return 'happy'
  if (minutesUntilOffwork <= 30) return 'happy'
  if (isLateNight(input.currentTime)) return 'sleepy'

  const minutesSinceWorkStart = input.minutesSinceWorkStart
  if (progress < 30 && typeof minutesSinceWorkStart === 'number' && isFinite(minutesSinceWorkStart) && minutesSinceWorkStart >= 180) return 'tired'

  return progress <= 0 ? 'idle' : 'working'
}
