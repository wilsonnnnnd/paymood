export type AnalyticsPayload = Record<string, unknown>

export function trackEvent(eventName: string, payload?: AnalyticsPayload) {
  try {
    console.debug('[analytics]', eventName, payload ?? {})
  } catch {
    // no-op
  }
}
