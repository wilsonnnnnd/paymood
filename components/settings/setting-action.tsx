import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './setting-utils'

const actionVariants = cva('setting-action', {
  variants: {
    variant: {
      default: '',
      primary: 'setting-action--primary',
      quiet: 'setting-action--quiet',
      danger: 'setting-action--danger',
      modal: 'setting-action--modal',
    },
  },
  defaultVariants: { variant: 'default' },
})

export type SettingActionProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof actionVariants>

export const SettingAction = React.forwardRef<HTMLButtonElement, SettingActionProps>(function SettingAction(
  { className, variant, type = 'button', ...props },
  ref,
) {
  return <button ref={ref} type={type} className={cn(actionVariants({ variant }), className)} {...props} />
})
