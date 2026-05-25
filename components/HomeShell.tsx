'use client'

import React, { useCallback, useState } from 'react'
import AdSenseSlot from './AdSenseSlot'
import Dashboard from './Dashboard'

export default function HomeShell({ adsenseEnabled }: { adsenseEnabled: boolean }) {
  const [withAds, setWithAds] = useState(adsenseEnabled)
  const handleNoFill = useCallback(() => setWithAds(false), [])

  return (
    <main className={withAds ? 'app-shell app-shell--with-ads' : 'app-shell'}>
      {withAds ? <AdSenseSlot placement="side" onNoFill={handleNoFill} /> : null}
      <Dashboard adsenseEnabled={withAds} onNoFill={handleNoFill} />
      {withAds ? <AdSenseSlot placement="side" onNoFill={handleNoFill} /> : null}
    </main>
  )
}
