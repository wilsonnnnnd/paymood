export type PetMood = 'idle' | 'sleepy' | 'happy'

export type GetPetMoodInput = {
  now: Date | null
  progress: number
  isWorkDay?: boolean
}

export type PetMoodResult = {
  mood: PetMood
  message: string
}

function clamp01(v: number) {
  if (!isFinite(v)) return 0
  return Math.min(1, Math.max(0, v))
}

function isSleepyTime(now: Date) {
  const h = now.getHours()
  const m = now.getMinutes()
  if (h < 6) return true
  if (h > 21) return true
  return h === 21 && m >= 30
}

function pickMessage(now: Date | null, messages: string[]) {
  if (!now) return messages[0] ?? ''
  const seed = now.getDay() * 24 + now.getHours()
  return messages[seed % messages.length] ?? messages[0] ?? ''
}

const idleMessages = ['慢慢来，我在。', '别急，先喝口水。', '你做得已经够好了。']
const sleepyMessages = ['有点晚了，轻轻收尾吧。', '眼睛也要下班的。', '要不要先休息一下？']
const happyMessages = ['快完成啦，我看见了。', '再一点点，就可以松口气。', '今天的你，很稳。']

export function getPetMood({now, progress, isWorkDay = true}: GetPetMoodInput): PetMoodResult {
  const p = clamp01(progress)

  if (now && isSleepyTime(now)) {
    return {mood: 'sleepy', message: pickMessage(now, sleepyMessages)}
  }

  if (isWorkDay && p >= 0.85) {
    return {mood: 'happy', message: pickMessage(now, happyMessages)}
  }

  return {mood: 'idle', message: pickMessage(now, idleMessages)}
}
