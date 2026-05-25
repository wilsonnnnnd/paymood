import React from 'react'
import { cookies } from 'next/headers'
import HomeShell from '../components/HomeShell'

export default async function Page() {
  const cookieStore = await cookies()
  const adsCookie = cookieStore.get('pm_ads')?.value
  const regionAllowsAds = adsCookie !== 'off'
  const adsenseEnabled =
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true' &&
    Boolean(process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT) &&
    Boolean(process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT) &&
    regionAllowsAds

  return <HomeShell adsenseEnabled={adsenseEnabled} />
}
