import React from 'react'
import Link from 'next/link'
import LegalPage from '../../components/LegalPage'

export const metadata = {
  title: 'Privacy Policy | PayMood',
  description: 'How PayMood handles local settings, limited site data, and possible third-party services.',
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="Last updated: May 22, 2026"
      ariaLabel="Privacy Policy"
      sections={[
        {
          title: 'Overview',
          description: 'PayMood is a browser-first workday progress and estimated earnings dashboard.',
          body: [
            'It is not a payroll system, tax calculator, HR tool, or source of financial, legal, or tax advice.',
            'This policy explains what information PayMood uses to run the dashboard and how that information is handled.',
          ],
        },
        {
          title: 'Local settings',
          description:
            'Your schedule, salary display preferences, currency, theme, and similar settings are stored in your browser using localStorage.',
          body: [
            'These settings are intended to stay on your device. PayMood does not require an account for the current dashboard experience and does not ask you to submit payslips, tax IDs, bank details, employer records, or other sensitive payroll documents.',
            'You can clear this data by changing your browser storage settings or clearing site data for this website.',
          ],
        },
        {
          title: 'Third-party services',
          description:
            'If PayMood later uses advertising, analytics, search, hosting, or similar third-party services, those services may process technical information.',
          body: [
            'Depending on the service, this may include cookies, device identifiers, IP address, browser information, page views, ad interactions, search queries, or web beacons. Those third parties may use this information according to their own policies.',
            'Third-party vendors, including Google, may use cookies to serve ads based on your prior visits to PayMood or other websites. Google advertising cookies enable Google and its partners to serve ads based on visits to this site and other sites on the Internet.',
            <>
              You can opt out of personalized advertising through{' '}
              <a href="https://www.google.com/settings/ads" rel="noreferrer" target="_blank">
                Google Ads Settings
              </a>
              . If other third-party vendors or ad networks are enabled, they may also use cookies for ad
              serving and may provide their own opt-out controls.
            </>,
          ],
        },
        {
          title: 'Contact',
          description: 'Questions about this policy can be sent through the contact page.',
          body: [<>Visit <Link href="/contact">Contact</Link> for the current contact method.</>],
        },
      ]}
    />
  )
}
