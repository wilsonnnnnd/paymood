import React from 'react'
import LegalPage from '../../components/LegalPage'

export const metadata = {
  title: 'About | PayMood',
  description: 'About the PayMood workday progress and earnings dashboard.',
}

export default function AboutPage() {
  return (
    <LegalPage
      eyebrow="paymood.work"
      title="About"
      subtitle="A calm dashboard for the working day."
      ariaLabel="About PayMood"
      sections={[
        {
          title: 'What it does',
          description:
            'PayMood shows the shape of your workday: progress, time remaining, and estimated earnings so far.',
          body: [
            'The app is designed for office workers, part-time workers, students, contractors, and anyone who wants a simple visual way to understand the day as it passes.',
          ],
        },
        {
          title: 'What it is not',
          description: 'PayMood is not payroll software, a tax calculator, an HR system, or financial advice.',
          body: [
            'The numbers are intentionally simple and transparent. They are useful for motivation and orientation, but your official pay records and obligations always come from your employer, contracts, payslips, accountant, tax authority, or other qualified sources.',
          ],
        },
        {
          title: 'How it is built',
          description: 'PayMood is browser-first, lightweight, and designed to keep core settings on your device.',
          body: [
            'The current MVP uses local browser storage for preferences and does not require an account, backend database, or payroll integration.',
          ],
        },
      ]}
    />
  )
}
