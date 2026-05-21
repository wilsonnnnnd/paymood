import React from 'react'
import Link from 'next/link'
import LegalPage from '../../components/LegalPage'

export const metadata = {
  title: 'Terms | PayMood',
  description: 'Basic terms for using PayMood.',
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      subtitle="Last updated: May 22, 2026"
      ariaLabel="Terms"
      sections={[
        {
          title: 'Use of PayMood',
          description: 'PayMood provides a simple dashboard for workday progress and estimated earnings.',
          body: [
            'By using PayMood, you agree to use it only for lawful, personal, and reasonable purposes. You must not attempt to disrupt the site, misuse automated traffic, or use the service in a way that harms other users or the site operator.',
          ],
        },
        {
          title: 'Estimates only',
          description:
            'Earnings, progress, weekly totals, and monthly totals shown by PayMood are estimates.',
          body: [
            'PayMood does not know your full employment contract, tax position, deductions, overtime rules, superannuation, payroll calendar, unpaid leave, or employer-specific policies. You are responsible for checking your actual pay, timesheets, payslips, contracts, and tax obligations.',
            'Do not rely on PayMood as financial, legal, tax, payroll, HR, or employment advice.',
          ],
        },
        {
          title: 'Availability',
          description: 'PayMood is provided as is and may change, pause, or stop at any time.',
          body: [
            'The site operator does not guarantee that PayMood will always be available, error-free, secure, or perfectly accurate. To the maximum extent permitted by law, PayMood is provided without warranties of any kind.',
          ],
        },
        {
          title: 'Updates',
          description: 'These terms may be updated as the product changes.',
          body: [
            <>
              Continued use after an update means you accept the latest terms. Questions can go through{' '}
              <Link href="/contact">Contact</Link>.
            </>,
          ],
        },
      ]}
    />
  )
}
