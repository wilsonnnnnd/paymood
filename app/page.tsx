import React from 'react'
import HomeShell from '../components/HomeShell'

export default function Page() {
  const adsenseEnabled =
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true' &&
    Boolean(process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT) &&
    Boolean(process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT)

  return <HomeShell adsenseEnabled={adsenseEnabled} />
}
