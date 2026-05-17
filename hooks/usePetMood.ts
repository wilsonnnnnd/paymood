import {useMemo} from 'react'
import {getPetMood} from '../lib/pet/petMoodRules'
import type {PetMoodInput} from '../lib/pet/petMoodRules'

export function usePetMood(input: PetMoodInput) {
  const {workProgress, earnedAmount, isWorkTime, minutesUntilOffwork, currentTime, minutesSinceWorkStart} = input
  return useMemo(
    () => getPetMood({workProgress, earnedAmount, isWorkTime, minutesUntilOffwork, currentTime, minutesSinceWorkStart}),
    [currentTime, earnedAmount, isWorkTime, minutesSinceWorkStart, minutesUntilOffwork, workProgress],
  )
}
