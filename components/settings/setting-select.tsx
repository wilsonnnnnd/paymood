import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './setting-utils'

const selectVariants = cva('setting-select', {
  variants: {
    tone: {
      default: '',
      quiet: '',
      vault: 'setting-select--vault',
    },
  },
  defaultVariants: { tone: 'default' },
})

export type SettingSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> &
  VariantProps<typeof selectVariants>

export const SettingSelect = React.forwardRef<HTMLSelectElement, SettingSelectProps>(function SettingSelect(
  { className, tone, ...props },
  ref,
) {
  return <select ref={ref} className={cn(selectVariants({ tone }), className)} {...props} />
})
