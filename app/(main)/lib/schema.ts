// app/(main)/lib/schema.ts

interface SerializableSolution {
  title: string;
  slug: string;
  tagline: string;
  description: string;
  gradient: string;
  apiEndpoint?: string;
  features?: string[];
  gifSrc?: string;
  useCases?: Array<{
    title: string;
    description: string;
  }>;
  documentation?: any;
  heroImage?: string;
}

interface SchemaData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export function generateSolutionSchema(solution: SerializableSolution, slug: string): SchemaData[] {
  const baseUrl = 'https://automica.ai';
  const solutionUrl = `${baseUrl}/services/${slug}`;

  // Base Software Application Schema
  const softwareApplicationSchema: SchemaData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: solution.title,
    description: solution.description,
    url: solutionUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web-based',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
      description: 'API usage starts free with pay-per-use pricing',
      availability: 'https://schema.org/InStock'
    },
    provider: {
      '@type': 'Organization',
      name: 'Automica',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`
    },
    featureList: solution.features || [],
    screenshot: solution.heroImage ? `${baseUrl}${solution.heroImage}` : undefined
  };

  // Service-specific schema enhancements
  const serviceSchemas = getServiceSpecificSchema(slug, solution, solutionUrl, baseUrl);

  // FAQ Schema for common API questions
  const faqSchema: SchemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: getFAQsForService(slug)
  };

  // Article/TechnicalArticle Schema for documentation
  const articleSchema: SchemaData = {
    '@context': 'https://schema.org',
    '@type': 'TechnicalArticle',
    headline: `${solution.title} - API Documentation and Integration Guide`,
    description: `Complete guide to integrating ${solution.title} API with code examples, use cases, and best practices.`,
    url: solutionUrl,
    author: {
      '@type': 'Organization',
      name: 'Automica',
      url: baseUrl
    },
    publisher: {
      '@type': 'Organization',
      name: 'Automica',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': solutionUrl
    },
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString(),
    articleSection: 'API Documentation',
    keywords: getKeywordsForService(slug)
  };

  // WebAPI Schema for the actual API endpoint
  const webAPISchema: SchemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebAPI',
    name: `${solution.title} API`,
    description: solution.description,
    url: solution.apiEndpoint || solutionUrl,
    documentation: `${solutionUrl}#documentation`,
    provider: {
      '@type': 'Organization',
      name: 'Automica',
      url: baseUrl
    },
    potentialAction: {
      '@type': 'ConsumeAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: solution.apiEndpoint,
        httpMethod: 'POST',
        contentType: 'application/json'
      }
    }
  };

  return [
    softwareApplicationSchema,
    faqSchema,
    articleSchema,
    webAPISchema,
    ...serviceSchemas
  ];
}

function getServiceSpecificSchema(slug: string, solution: SerializableSolution, solutionUrl: string, baseUrl: string): SchemaData[] {
  const schemas: SchemaData[] = [];

  switch (slug) {
    case 'signature-verification':
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'SecurityService',
        name: solution.title,
        description: solution.description,
        url: solutionUrl,
        serviceType: 'Digital Signature Verification',
        areaServed: 'Worldwide',
        provider: {
          '@type': 'Organization',
          name: 'Automica',
          url: baseUrl
        }
      });
      break;

    case 'face-verify':
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'SecurityService',
        name: solution.title,
        description: solution.description,
        url: solutionUrl,
        serviceType: 'Biometric Identity Verification',
        areaServed: 'Worldwide',
        provider: {
          '@type': 'Organization',
          name: 'Automica',
          url: baseUrl
        }
      });
      break;

    case 'qr-extract':
    case 'qr-masking':
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'DataProcessingService',
        name: solution.title,
        description: solution.description,
        url: solutionUrl,
        serviceType: 'QR Code Processing',
        areaServed: 'Worldwide',
        provider: {
          '@type': 'Organization',
          name: 'Automica',
          url: baseUrl
        }
      });
      break;

    case 'id-crop':
    case 'face-cropping':
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'ImageProcessingService',
        name: solution.title,
        description: solution.description,
        url: solutionUrl,
        serviceType: 'Automated Image Cropping',
        areaServed: 'Worldwide',
        provider: {
          '@type': 'Organization',
          name: 'Automica',
          url: baseUrl
        }
      });
      break;
  }

  return schemas;
}

function getFAQsForService(slug: string): any[] {
  const baseFAQs = [
    {
      '@type': 'Question',
      name: 'How do I get started with the API?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sign up for a free account, get your API key, and start with our comprehensive documentation and code examples.'
      }
    },
    {
      '@type': 'Question',
      name: 'What is the pricing model?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer pay-per-use pricing with a generous free tier. Pricing scales based on usage volume with discounts for higher volumes.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is there rate limiting?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, rate limits depend on your subscription tier. Free accounts have basic limits, while paid plans offer higher limits and priority processing.'
      }
    }
  ];

  const serviceFAQs: { [key: string]: any[] } = {
    'signature-verification': [
      {
        '@type': 'Question',
        name: 'What signature formats are supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We support both handwritten and digital signatures in common image formats including PNG, JPG, and PDF.'
        }
      },
      {
        '@type': 'Question',
        name: 'How accurate is the signature verification?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our AI-powered verification achieves industry-leading accuracy rates above 95% for most signature types.'
        }
      }
    ],
    'face-verify': [
      {
        '@type': 'Question',
        name: 'What image quality is required?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We recommend images with clear facial features, good lighting, and minimum resolution of 200x200 pixels for best results.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is the verification GDPR compliant?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, our service is designed with privacy in mind and complies with GDPR and other privacy regulations.'
        }
      }
    ],
    'qr-extract': [
      {
        '@type': 'Question',
        name: 'What QR code formats are supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We support all standard QR code formats including URLs, text, contact info, WiFi credentials, and custom data formats.'
        }
      }
    ]
  };

  return [...baseFAQs, ...(serviceFAQs[slug] || [])];
}

function getKeywordsForService(slug: string): string {
  const keywordMap: { [key: string]: string } = {
    'signature-verification': 'signature verification, AI authentication, fraud detection, document security, digital signatures, handwritten signatures, API integration',
    'qr-extract': 'QR code extraction, QR decoder, QR reader API, batch QR processing, data extraction, inventory management, QR scanning',
    'id-crop': 'ID cropping, document cropping, identity document processing, passport cropping, driver license, document verification, precision cropping',
    'qr-masking': 'QR masking, QR privacy, data protection, QR obfuscation, document privacy, sensitive data masking, compliance',
    'face-verify': 'face verification, facial recognition, identity authentication, biometric verification, KYC verification, fraud prevention',
    'face-cropping': 'face cropping, face detection, facial region extraction, image processing, auto-alignment, profile pictures'
  };

  return keywordMap[slug] || 'API, artificial intelligence, machine learning, automation, document processing';
}