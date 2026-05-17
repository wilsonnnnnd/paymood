import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './setting-utils'

const sectionVariants = cva('setting-section', {
  variants: {
    tone: {
      default: '',
      quiet: 'setting-section--quiet',
      vault: 'setting-section--vault',
    },
  },
  defaultVariants: { tone: 'default' },
})

export type SettingSectionProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof sectionVariants> & {
    title?: React.ReactNode
    description?: React.ReactNode
    actions?: React.ReactNode
  }

export function SettingSection({
  title,
  description,
  actions,
  tone,
  className,
  children,
  ...props
}: SettingSectionProps) {
  return (
    <section className={cn(sectionVariants({ tone }), className)} {...props}>
      {title || description || actions ? (
        <div className="setting-section__header">
          <div className="setting-section__copy">
            {title ? <h2 className="setting-section__title">{title}</h2> : null}
            {description ? <p className="setting-section__description">{description}</p> : null}
          </div>
          {actions ? <div className="setting-section__actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className="setting-section__body">{children}</div>
    </section>
  )
}
