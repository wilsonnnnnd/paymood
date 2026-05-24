'use client'

import React, { useEffect, useRef, useState } from 'react'

type AdsWindow = Window & {
  adsbygoogle?: unknown[]
}

type AdSenseSlotProps = {
  placement?: 'side' | 'bottom'
}

export default function AdSenseSlot({ placement = 'bottom' }: AdSenseSlotProps) {
  const client = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT
  const slot = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT
  const containerRef = useRef<HTMLElement | null>(null)
  const adRef = useRef<HTMLModElement | null>(null)
  const pushedRef = useRef(false)
  const [canRenderAd, setCanRenderAd] = useState(false)

  useEffect(() => {
    if (!client || !slot) return

    const updateVisibility = () => {
      const container = containerRef.current
      if (!container) return

      const style = window.getComputedStyle(container)
      const isVisible =
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        container.getBoundingClientRect().width > 0

      if (!isVisible) pushedRef.current = false
      setCanRenderAd(isVisible)
    }

    const frameId = window.requestAnimationFrame(updateVisibility)
    window.addEventListener('resize', updateVisibility)

    if (!('ResizeObserver' in window)) {
      return () => {
        window.cancelAnimationFrame(frameId)
        window.removeEventListener('resize', updateVisibility)
      }
    }

    const observer = new ResizeObserver(updateVisibility)
    if (containerRef.current) observer.observe(containerRef.current)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', updateVisibility)
      observer.disconnect()
    }
  }, [client, slot])

  useEffect(() => {
    if (!client || !slot || !canRenderAd) return

    const scriptId = 'paymood-adsense-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.async = true
      script.crossOrigin = 'anonymous'
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`
      document.head.appendChild(script)
    }

    const pushAd = () => {
      const ad = adRef.current
      if (!ad || pushedRef.current || ad.getBoundingClientRect().width <= 0) return

      try {
        const adsWindow = window as AdsWindow
        adsWindow.adsbygoogle = adsWindow.adsbygoogle ?? []
        adsWindow.adsbygoogle.push({})
        pushedRef.current = true
      } catch {
        // Ad blockers or delayed Google scripts should not break the dashboard.
      }
    }

    const ad = adRef.current
    if (!ad) return

    const frameId = window.requestAnimationFrame(pushAd)
    if (!('ResizeObserver' in window)) {
      return () => window.cancelAnimationFrame(frameId)
    }

    const observer = new ResizeObserver(() => pushAd())
    observer.observe(ad)

    return () => {
      window.cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [canRenderAd, client, slot])

  if (!client || !slot) return null

  return (
    <aside ref={containerRef} className={`adsense-slot adsense-slot--${placement}`} aria-label="Advertisement">
      {canRenderAd ? (
        <ins
          ref={adRef}
          className="adsbygoogle"
          data-ad-client={client}
          data-ad-format="auto"
          data-ad-slot={slot}
          data-full-width-responsive="true"
          style={{ display: 'block' }}
        />
      ) : null}
    </aside>
  )
}
