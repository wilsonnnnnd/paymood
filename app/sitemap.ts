import type { MetadataRoute } from 'next'

const siteUrl = 'https://www.paymood.work'
const lastModified = new Date('2026-06-08')

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/about', '/settings', '/privacy', '/terms', '/contact'].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: path === '' ? 'daily' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }))
}
