import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './setting-utils'

const toggleVariants = cva('setting-toggle', {
  variants: {
    size: {
      default: '',
      compact: 'setting-toggle--compact',
    },
  },
  defaultVariants: { size: 'default' },
})

export type SettingToggleProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof toggleVariants> & {
    pressed?: boolean
  }

export const SettingToggle = React.forwardRef<HTMLButtonElement, SettingToggleProps>(function SettingToggle(
  { className, pressed = false, size, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-pressed={pressed}
      className={cn(toggleVariants({ size }), className)}
      {...props}
    />
  )
})
