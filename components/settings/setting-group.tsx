import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './setting-utils'

const groupVariants = cva('setting-group', {
  variants: {
    density: {
      default: '',
      compact: 'setting-group--compact',
      loose: 'setting-group--loose',
    },
  },
  defaultVariants: { density: 'default' },
})

export type SettingGroupProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof groupVariants>

export function SettingGroup({ className, density, ...props }: SettingGroupProps) {
  return <div className={cn(groupVariants({ density }), className)} {...props} />
}
