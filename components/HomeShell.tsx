'use client'

import React, { useCallback, useEffect, useState } from 'react'
import AdSenseSlot from './AdSenseSlot'
import Dashboard from './Dashboard'
import { adsRegionCookieValueFromCookieString, regionCookieAllowsAds } from '../lib/ads'

export default function HomeShell({ adsenseEnabled }: { adsenseEnabled: boolean }) {
  const [withAds, setWithAds] = useState(false)
  const handleNoFill = useCallback(() => setWithAds(false), [])

  useEffect(() => {
    if (!adsenseEnabled) {
      setWithAds(false)
      return
    }

    const cookieValue = adsRegionCookieValueFromCookieString(document.cookie)
    setWithAds(regionCookieAllowsAds(cookieValue))
  }, [adsenseEnabled])

  return (
    <main className={withAds ? 'app-shell app-shell--with-ads' : 'app-shell'}>
      {withAds ? <AdSenseSlot placement="side" onNoFill={handleNoFill} /> : null}
      <Dashboard adsenseEnabled={withAds} onNoFill={handleNoFill} />
      {withAds ? <AdSenseSlot placement="side" onNoFill={handleNoFill} /> : null}
    </main>
  )
}
