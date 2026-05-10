import React from 'react'
import type {Metadata} from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Cozy Earnings Dashboard',
  icons: {
    icon: '/xiaoxing_icon_white_bg.png',
    shortcut: '/xiaoxing_icon_white_bg.png',
    apple: '/xiaoxing_icon_white_bg.png',
  },
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  )
}
