export const ADS_REGION_COOKIE = 'pm_ads'
export const ADS_REGION_ALLOWED = 'on'
export const ADS_REGION_BLOCKED = 'off'

const CHINA_COUNTRY_CODE = 'CN'

export function normalizeCountryCode(country: string | null | undefined) {
  const normalized = country?.trim().toUpperCase()
  return normalized || null
}

export function shouldServeAdsForCountry(country: string | null | undefined) {
  return normalizeCountryCode(country) !== CHINA_COUNTRY_CODE
}

export function adRegionCookieForCountry(country: string | null | undefined) {
  return shouldServeAdsForCountry(country) ? ADS_REGION_ALLOWED : ADS_REGION_BLOCKED
}

export function regionCookieAllowsAds(value: string | null | undefined) {
  return value !== ADS_REGION_BLOCKED
}

export function regionAllowsAds({
  country,
  cookieValue,
}: {
  country: string | null | undefined
  cookieValue: string | null | undefined
}) {
  const normalizedCountry = normalizeCountryCode(country)
  if (normalizedCountry) return shouldServeAdsForCountry(normalizedCountry)
  return regionCookieAllowsAds(cookieValue)
}
