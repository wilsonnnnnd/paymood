'use client'

import React, { useEffect } from 'react'
import Script from 'next/script'

type AdsWindow = Window & {
  adsbygoogle?: unknown[]
}

type AdSenseSlotProps = {
  placement?: 'side' | 'bottom'
}

export default function AdSenseSlot({ placement = 'bottom' }: AdSenseSlotProps) {
  const client = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT
  const slot = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT

  useEffect(() => {
    if (!client || !slot) return

    try {
      const adsWindow = window as AdsWindow
      adsWindow.adsbygoogle = adsWindow.adsbygoogle ?? []
      adsWindow.adsbygoogle.push({})
    } catch {
      // Ad blockers or delayed Google scripts should not break the dashboard.
    }
  }, [client, slot])

  if (!client || !slot) return null

  return (
    <aside className={`adsense-slot adsense-slot--${placement}`} aria-label="Advertisement">
      <Script
        async
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`}
        strategy="afterInteractive"
      />
      <ins
        className="adsbygoogle"
        data-ad-client={client}
        data-ad-format="auto"
        data-ad-slot={slot}
        data-full-width-responsive="true"
        style={{ display: 'block' }}
      />
    </aside>
  )
}
