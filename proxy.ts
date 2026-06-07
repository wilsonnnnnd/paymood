import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { adRegionCookieForCountry, ADS_REGION_COOKIE } from './lib/ads'

function geoCountryFor(request: NextRequest) {
  const header = request.headers.get('x-vercel-ip-country')
  if (header) return header
  return null
}

export function proxy(request: NextRequest) {
  const country = geoCountryFor(request)
  const nextValue = adRegionCookieForCountry(country)

  const response = NextResponse.next()
  const secure = request.nextUrl.protocol === 'https:'
  response.cookies.set(ADS_REGION_COOKIE, nextValue, {
    path: '/',
    sameSite: 'lax',
    secure,
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
}
