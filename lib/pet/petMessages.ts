import type {PetMood, PetMoodInput} from './petMoodRules'
import {moodMessages} from '../../content/pet/messages/moods'
import {
  hoverDefaultMessages,
  hoverMessagesByContext as hoverMessagesByContextData,
} from '../../content/pet/messages/hover'

export type PetMessageContext = 'default' | 'morning' | 'night' | 'nearOffwork' | 'weekend'
export type HoverMessageContext = 'default' | 'working' | 'nearOffwork' | 'offwork' | 'night'

function clamp(v: number, min: number, max: number) {
  if (!isFinite(v)) return min
  return Math.min(max, Math.max(min, v))
}

function isLateNight(d: Date) {
  const h = d.getHours()
  const m = d.getMinutes()
  if (h < 6) return true
  if (h > 21) return true
  return h === 21 && m >= 30
}

function isMorning(d: Date) {
  const h = d.getHours()
  return h >= 6 && h < 10
}

export const petMessages: Record<PetMood, readonly string[]> = {
  happy: moodMessages.happy.defaultMessages,
  idle: moodMessages.idle.defaultMessages,
  excited: moodMessages.excited.defaultMessages,
  offwork: moodMessages.offwork.defaultMessages,
  sleepy: moodMessages.sleepy.defaultMessages,
  tired: moodMessages.tired.defaultMessages,
  working: moodMessages.working.defaultMessages,
}

export function pickPetMessage(mood: PetMood, seed: number) {
  const list = petMessages[mood] ?? []
  if (list.length === 0) return ''
  const safeSeed = Number.isFinite(seed) ? Math.abs(Math.floor(seed)) : 0
  return list[safeSeed % list.length] ?? list[0] ?? ''
}

export function getPetMessageContext(input: PetMoodInput, mood: PetMood): PetMessageContext {
  const now = input.currentTime
  if (!now) return 'default'

  const progress = clamp(input.workProgress, 0, 100)
  const minutesUntilOffwork = clamp(input.minutesUntilOffwork, 0, 24 * 60)
  const isWorkDay = input.isWorkDay ?? true

  if (!isWorkDay && mood === 'offwork') return 'weekend'
  if (input.isWorkTime && minutesUntilOffwork <= 30 && (mood === 'happy' || mood === 'excited' || mood === 'working')) return 'nearOffwork'
  if (isLateNight(now) && (mood === 'working' || mood === 'sleepy')) return 'night'
  if (isMorning(now) && (mood === 'idle' || mood === 'working') && progress <= 35) return 'morning'
  return 'default'
}

const petMessagesByContext: Partial<Record<PetMood, Partial<Record<PetMessageContext, readonly string[]>>>> = {
  working: (moodMessages.working.contexts ?? {}) as Partial<Record<PetMessageContext, readonly string[]>>,
  happy: (moodMessages.happy.contexts ?? {}) as Partial<Record<PetMessageContext, readonly string[]>>,
  offwork: (moodMessages.offwork.contexts ?? {}) as Partial<Record<PetMessageContext, readonly string[]>>,
}

export function pickPetMessageWithContext(mood: PetMood, context: PetMessageContext, seed: number) {
  const list = petMessagesByContext[mood]?.[context] ?? petMessages[mood] ?? []
  if (list.length === 0) return ''
  const safeSeed = Number.isFinite(seed) ? Math.abs(Math.floor(seed)) : 0
  return list[safeSeed % list.length] ?? list[0] ?? ''
}

export const hoverMessages: readonly string[] = hoverDefaultMessages

export function pickHoverMessage(seed: number) {
  const list = hoverMessages
  if (list.length === 0) return ''
  const safeSeed = Number.isFinite(seed) ? Math.abs(Math.floor(seed)) : 0
  return list[safeSeed % list.length] ?? list[0] ?? ''
}

export function getHoverMessageContext(input: PetMoodInput, mood: PetMood): HoverMessageContext {
  const now = input.currentTime
  if (now && isLateNight(now)) return 'night'
  if (!input.isWorkTime) return 'offwork'
  if (input.minutesUntilOffwork <= 30) return 'nearOffwork'
  if (mood === 'working' || mood === 'tired' || mood === 'sleepy') return 'working'
  return 'default'
}

const hoverMessagesByContext: Partial<Record<HoverMessageContext, readonly string[]>> =
  hoverMessagesByContextData

export function pickHoverMessageWithContext(context: HoverMessageContext, seed: number) {
  const list = hoverMessagesByContext[context] ?? hoverMessages
  if (list.length === 0) return ''
  const safeSeed = Number.isFinite(seed) ? Math.abs(Math.floor(seed)) : 0
  return list[safeSeed % list.length] ?? list[0] ?? ''
}
