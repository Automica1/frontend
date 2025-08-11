// app/sitemap.ts
import { MetadataRoute } from 'next'

const services = [
  {
    slug: 'signature-verification',
    priority: 0.9,
  },
  {
    slug: 'qr-extract',
    priority: 0.7,
  },
  {
    slug: 'id-crop', 
    priority: 0.7,
  },
  {
    slug: 'qr-masking',
    priority: 0.9,
  },
  {
    slug: 'face-verify',
    priority: 0.8,
  },
  {
    slug: 'face-cropping',
    priority: 0.7,
  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Only generate sitemap for production
  const isProduction = process.env.NODE_ENV === 'production' && 
                       process.env.NEXT_PUBLIC_SITE_URL === 'https://automica.ai';
  
  if (!isProduction) {
    // Return empty sitemap for dev environment
    return [];
  }

  const baseUrl = 'https://automica.ai';
  
  // Static main pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/api-docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/credits`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Individual ML service pages
  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: service.priority,
  }))

  return [
    ...staticRoutes,
    ...serviceRoutes,
  ]
}