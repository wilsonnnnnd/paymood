import React from 'react'
import type {Metadata} from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  icons: {
    icon: '/WeimengDing.png',
    shortcut: '/WeimengDing.png',
    apple: '/WeimengDing.png',
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
