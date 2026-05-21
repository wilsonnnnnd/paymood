import React from 'react'
import type { Metadata, Viewport } from 'next'
import SettingsProvider from '../components/SettingsProvider'
import ThemeSync from '../components/ThemeSync'
import FloatingPet from '../components/pet/FloatingPet'
import '../styles/globals.css'
export const metadata: Metadata = {
  title: 'PayMood',
  description: 'paymood.work — a calm workday progress and salary mood dashboard for everyday workers.',
  icons: {
    icon: '/xiaoxing_icon_white_bg.png',
    shortcut: '/xiaoxing_icon_white_bg.png',
    apple: '/xiaoxing_icon_white_bg.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT

  return (
    <html lang="zh-CN">
      <head>
        {adsenseClient ? <meta name="google-adsense-account" content={adsenseClient} /> : null}
      </head>
      <body>
        <SettingsProvider>
          <ThemeSync />
          {children}
          <FloatingPet />
        </SettingsProvider>
      </body>
    </html>
  )
}
