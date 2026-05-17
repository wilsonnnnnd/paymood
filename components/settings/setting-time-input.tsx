import React from 'react'
import { SettingInput, type SettingInputProps } from './setting-input'

export type SettingTimeInputProps = Omit<SettingInputProps, 'type'>

export const SettingTimeInput = React.forwardRef<HTMLInputElement, SettingTimeInputProps>(function SettingTimeInput(
  props,
  ref,
) {
  return <SettingInput ref={ref} type="time" {...props} />
})
