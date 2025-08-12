// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NODE_ENV === 'production' && 
                       process.env.NEXT_PUBLIC_SITE_URL === 'https://automica.ai';

  if (isProduction) {
    // Production robots.txt - allow indexing
    return {
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: [
            '/admin/',
            '/api/',
            '/dashboard/private/',
            '/_next/',
            '/auth/',
          ],
        },
      ],
      sitemap: 'https://automica.ai/sitemap.xml',
    }
  } else {
    // Development robots.txt - block all crawlers
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    }
  }
}
