import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './setting-utils'

const descriptionVariants = cva('setting-description', {
  variants: {
    tone: {
      default: '',
      quiet: 'setting-description--quiet',
      accent: 'setting-description--accent',
      success: 'setting-description--success',
      warning: 'setting-description--warning',
      danger: 'setting-description--danger',
    },
  },
  defaultVariants: { tone: 'default' },
})

export type SettingDescriptionProps = React.HTMLAttributes<HTMLParagraphElement> &
  VariantProps<typeof descriptionVariants>

export function SettingDescription({ className, tone, ...props }: SettingDescriptionProps) {
  return <p className={cn(descriptionVariants({ tone }), className)} {...props} />
}
