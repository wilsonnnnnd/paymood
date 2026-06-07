export const dynamic = 'force-static'

function publisherIdFromClient(client: string | undefined) {
  const normalized = client?.trim()
  if (!normalized) return null

  const publisherId = normalized.replace(/^ca-/, '')
  return /^pub-\d+$/.test(publisherId) ? publisherId : null
}

export function GET() {
  const publisherId = publisherIdFromClient(process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT)
  const body = publisherId
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
    : '# Configure NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-... before requesting AdSense review.\n'

  return new Response(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
