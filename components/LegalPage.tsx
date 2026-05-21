import React from 'react'
import Link from 'next/link'

type LegalSection = {
  title: string
  description: string
  body?: React.ReactNode[]
}

type LegalPageProps = {
  eyebrow?: string
  title: string
  subtitle: string
  ariaLabel: string
  sections: LegalSection[]
}

const siteLinks = [
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
]

export default function LegalPage({
  eyebrow = 'PayMood',
  title,
  subtitle,
  ariaLabel,
  sections,
}: LegalPageProps) {
  return (
    <main className="app-shell settings-page">
      <section className="settings-shell" aria-label={ariaLabel}>
        <div className="hud-top-actions" aria-label="Page actions">
          <Link className="hud-icon-button" href="/" aria-label="Back to dashboard">
            <span aria-hidden="true">&larr;</span>
          </Link>
        </div>

        <header className="settings-hero">
          <div className="settings-hero__eyebrow">{eyebrow}</div>
          <h1 className="settings-hero__title">{title}</h1>
          <div className="settings-hero__subtitle">{subtitle}</div>
        </header>

        <section className="settings-stage" aria-label={`${title} details`}>
          {sections.map((section) => (
            <section className="setting-section" key={section.title}>
              <div className="setting-section__header">
                <div className="setting-section__copy">
                  <h2 className="setting-section__title">{section.title}</h2>
                  <p className="setting-section__description">{section.description}</p>
                  {section.body?.map((item, index) => (
                    <p className="setting-section__description" key={index}>
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          ))}

          <nav className="settings-footnote" aria-label="Site information">
            {siteLinks.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
                {' '}
              </Link>
            ))}
          </nav>
        </section>
      </section>
    </main>
  )
}
