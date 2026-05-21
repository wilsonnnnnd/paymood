import React from 'react'
import LegalPage from '../../components/LegalPage'

export const metadata = {
  title: 'Contact | PayMood',
  description: 'Contact PayMood.',
}

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact"
      subtitle="Questions, feedback, and policy requests."
      ariaLabel="Contact PayMood"
      sections={[
        {
          title: 'Email',
          description: 'Use this contact method for product feedback, privacy questions, or site issues.',
          body: [
            <>
              Email: <a href="mailto:hello@paymood.work">hello@paymood.work</a>
            </>,
            'If this address has not been activated yet, replace it with the preferred support email before publishing the site publicly.',
          ],
        },
        {
          title: 'Useful context',
          description: 'Include the page, browser, device, and a short description of what happened.',
          body: [
            'Please do not send bank details, tax IDs, payslips, passwords, or other sensitive payroll documents. PayMood does not need those details to help with general site feedback.',
          ],
        },
      ]}
    />
  )
}
