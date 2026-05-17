import {describe, it, expect} from 'vitest'
import {getPetMood} from '../lib/pet/petMoodRules'

describe('pet mood rules', () => {
  it('offwork when not work time', () => {
    expect(
      getPetMood({workProgress: 99, earnedAmount: 0, isWorkTime: false, minutesUntilOffwork: 0, currentTime: new Date('2026-05-10T12:00:00')}),
    ).toBe('offwork')
  })

  it('excited when progress >= 95', () => {
    expect(
      getPetMood({workProgress: 95, earnedAmount: 0, isWorkTime: true, minutesUntilOffwork: 200, currentTime: new Date('2026-05-10T12:00:00')}),
    ).toBe('excited')
  })

  it('happy when progress >= 80', () => {
    expect(
      getPetMood({workProgress: 80, earnedAmount: 0, isWorkTime: true, minutesUntilOffwork: 200, currentTime: new Date('2026-05-10T12:00:00')}),
    ).toBe('happy')
  })

  it('happy when minutesUntilOffwork <= 30', () => {
    expect(
      getPetMood({workProgress: 10, earnedAmount: 0, isWorkTime: true, minutesUntilOffwork: 30, currentTime: new Date('2026-05-10T12:00:00')}),
    ).toBe('happy')
  })

  it('happy takes precedence over sleepy at late night', () => {
    expect(
      getPetMood({workProgress: 82, earnedAmount: 0, isWorkTime: true, minutesUntilOffwork: 200, currentTime: new Date('2026-05-10T23:10:00')}),
    ).toBe('happy')
  })

  it('sleepy at late night', () => {
    expect(
      getPetMood({workProgress: 55, earnedAmount: 0, isWorkTime: true, minutesUntilOffwork: 200, currentTime: new Date('2026-05-10T23:10:00')}),
    ).toBe('sleepy')
  })

  it('tired when progress low and worked long', () => {
    expect(
      getPetMood({
        workProgress: 20,
        earnedAmount: 0,
        isWorkTime: true,
        minutesUntilOffwork: 200,
        currentTime: new Date('2026-05-10T14:00:00'),
        minutesSinceWorkStart: 180,
      }),
    ).toBe('tired')
  })

  it('working by default during work time', () => {
    expect(
      getPetMood({
        workProgress: 40,
        earnedAmount: 0,
        isWorkTime: true,
        minutesUntilOffwork: 200,
        currentTime: new Date('2026-05-10T14:00:00'),
        minutesSinceWorkStart: 40,
      }),
    ).toBe('working')
  })

  it('idle when workProgress is zero', () => {
    expect(
      getPetMood({
        workProgress: 0,
        earnedAmount: 0,
        isWorkTime: true,
        minutesUntilOffwork: 200,
        currentTime: new Date('2026-05-10T10:00:00'),
        minutesSinceWorkStart: 10,
      }),
    ).toBe('idle')
  })
})

