import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './setting-utils'

const rowVariants = cva('setting-row', {
  variants: {
    density: {
      default: '',
      compact: 'setting-row--compact',
      quiet: 'setting-row--quiet',
    },
  },
  defaultVariants: { density: 'default' },
})

export type SettingRowProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof rowVariants> & {
    label: React.ReactNode
    controlId?: string
    description?: React.ReactNode
    value?: React.ReactNode
  }

export function SettingRow({
  label,
  controlId,
  description,
  value,
  density,
  className,
  children,
  ...props
}: SettingRowProps) {
  return (
    <div className={cn(rowVariants({ density }), className)} {...props}>
      <div className="setting-row__copy">
        {controlId ? (
          <label className="setting-row__label" htmlFor={controlId}>
            {label}
          </label>
        ) : (
          <div className="setting-row__label">{label}</div>
        )}
        {description ? <div className="setting-row__description">{description}</div> : null}
      </div>
      <div className="setting-row__control">
        {value ? <div className="setting-row__value">{value}</div> : null}
        {children}
      </div>
    </div>
  )
}
