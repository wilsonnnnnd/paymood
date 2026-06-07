import React from 'react'
import { cookies, headers } from 'next/headers'
import HomeShell from '../components/HomeShell'
import { ADS_REGION_COOKIE, regionAllowsAds } from '../lib/ads'

export default async function Page() {
  const headerStore = await headers()
  const cookieStore = await cookies()
  const country = headerStore.get('x-vercel-ip-country')
  const adsCookie = cookieStore.get(ADS_REGION_COOKIE)?.value
  const allowsAdsInRegion = regionAllowsAds({ country, cookieValue: adsCookie })
  const adsenseEnabled =
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true' &&
    Boolean(process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT) &&
    Boolean(process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT) &&
    allowsAdsInRegion

  return <HomeShell adsenseEnabled={adsenseEnabled} />
}
