import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './setting-utils'

const inputVariants = cva('setting-input', {
  variants: {
    tone: {
      default: '',
      quiet: '',
      vault: 'setting-input--vault',
    },
  },
  defaultVariants: { tone: 'default' },
})

export type SettingInputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants>

export const SettingInput = React.forwardRef<HTMLInputElement, SettingInputProps>(function SettingInput(
  { className, tone, ...props },
  ref,
) {
  return <input ref={ref} className={cn(inputVariants({ tone }), className)} {...props} />
})
