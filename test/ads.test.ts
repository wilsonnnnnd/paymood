import { describe, expect, it } from 'vitest'
import {
  adRegionCookieForCountry,
  ADS_REGION_ALLOWED,
  ADS_REGION_BLOCKED,
  adsRegionCookieValueFromCookieString,
  regionAllowsAds,
  shouldServeAdsForCountry,
} from '../lib/ads'

describe('ad geo targeting', () => {
  it('does not serve ads for China IP country codes', () => {
    expect(shouldServeAdsForCountry('CN')).toBe(false)
    expect(shouldServeAdsForCountry('cn')).toBe(false)
  })

  it('serves ads for non-China IP country codes', () => {
    expect(shouldServeAdsForCountry('AU')).toBe(true)
    expect(shouldServeAdsForCountry('US')).toBe(true)
  })

  it('serves ads when the country is unknown', () => {
    expect(shouldServeAdsForCountry(null)).toBe(true)
    expect(shouldServeAdsForCountry('')).toBe(true)
  })

  it('maps country codes to the ad region cookie value', () => {
    expect(adRegionCookieForCountry('CN')).toBe(ADS_REGION_BLOCKED)
    expect(adRegionCookieForCountry('AU')).toBe(ADS_REGION_ALLOWED)
    expect(adRegionCookieForCountry(null)).toBe(ADS_REGION_ALLOWED)
  })

  it('uses direct country detection before falling back to the region cookie', () => {
    expect(regionAllowsAds({ country: 'CN', cookieValue: null })).toBe(false)
    expect(regionAllowsAds({ country: 'AU', cookieValue: ADS_REGION_BLOCKED })).toBe(true)
    expect(regionAllowsAds({ country: null, cookieValue: ADS_REGION_BLOCKED })).toBe(false)
    expect(regionAllowsAds({ country: null, cookieValue: null })).toBe(true)
  })

  it('reads the ad region cookie from a browser cookie string', () => {
    expect(adsRegionCookieValueFromCookieString('theme=dark; pm_ads=off; other=1')).toBe(ADS_REGION_BLOCKED)
    expect(adsRegionCookieValueFromCookieString('pm_ads=on')).toBe(ADS_REGION_ALLOWED)
    expect(adsRegionCookieValueFromCookieString('theme=dark')).toBeNull()
  })
})
