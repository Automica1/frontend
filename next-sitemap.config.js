/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://automica.ai',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/admin',
    '/admin/*',
    '/api/*',
    '/dashboard',
    '/dashboard/*',
    '/unauthorized',
    '/404',
    '/500'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/unauthorized',
          '/_next/',
          '/404',
          '/500'
        ],
      },
    ],
    additionalSitemaps: [
      'https://automica.ai/server-sitemap.xml',
    ],
  },
  transform: async (config, path) => {
    // Homepage - highest priority
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      }
    }
    
    // Core service pages - very high priority for SEO
    else if (path === '/services') {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.95,
        lastmod: new Date().toISOString(),
      }
    }
    
    // Individual service pages - highest priority for ranking
    else if (path.includes('/services/')) {
      const highPriorityServices = [
        'signature-verification',
        'qr-extract', 
        'id-crop',
        'qr-masking',
        'face-cropping',
        'face-verify',
        // 'ocr-engine'
      ];
      
      const serviceName = path.split('/services/')[1];
      const isHighPriorityService = highPriorityServices.includes(serviceName);
      
      return {
        loc: path,
        changefreq: 'weekly',
        priority: isHighPriorityService ? 0.9 : 0.8,
        lastmod: new Date().toISOString(),
      }
    }
    
    // Pricing page - important for conversions
    else if (path === '/pricing') {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.85,
        lastmod: new Date().toISOString(),
      }
    }
    
    // About page - good for brand authority
    else if (path === '/about') {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      }
    }
    
    // Contact page - important for lead generation
    else if (path === '/contact') {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.75,
        lastmod: new Date().toISOString(),
      }
    }
    
    // API documentation - good for developer SEO
    else if (path === '/api-docs') {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      }
    }
    
    // Blog pages - content marketing
    else if (path.includes('/blog')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      }
    }
    
    // Other pages - standard priority
    else if (['/features', '/security', '/privacy-policy', '/terms-services', '/careers'].includes(path)) {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: new Date().toISOString(),
      }
    }

    // Default for any other pages
    return {
      loc: path,
      changefreq: 'monthly',
      priority: 0.5,
      lastmod: new Date().toISOString(),
    }
  },
  
  additionalPaths: async (config) => {
    // Your main services from the build output
    const coreServices = [
      'signature-verification',
      'qr-extract', 
      'id-crop',
      'qr-masking',
      'face-cropping',
      'face-verify',
      // 'ocr-engine'
    ];
    
    // Additional service variations for better keyword coverage
    const additionalServicePages = [
      // Alternative URLs or landing pages you might want
      'ai-signature-verification',
      'qr-code-reader',
      'document-cropping',
      'qr-code-masking',
      'facial-recognition'
    ];
    
    const servicePaths = [];
    
    // Add core services with high priority
    coreServices.forEach(service => {
      servicePaths.push({
        loc: `/services/${service}`,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      });
    });
    
    // Add additional service variations with slightly lower priority
    additionalServicePages.forEach(service => {
      servicePaths.push({
        loc: `/services/${service}`,
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      });
    });
    
    // Add category/solution pages for better SEO structure
    const categoryPages = [
      'document-processing',
      'identity-verification', 
      'ai-automation',
      'computer-vision',
      'api-solutions'
    ];
    
    categoryPages.forEach(category => {
      servicePaths.push({
        loc: `/solutions/${category}`,
        changefreq: 'monthly', 
        priority: 0.75,
        lastmod: new Date().toISOString(),
      });
    });
    
    return servicePaths;
  }
}