// types/solution.ts
export interface Solution {
  title: string;
  IconComponent: React.ComponentType<any>;
  gradient: string;
  apiEndpoint?: string;
  slug?: string;
  hasBeta?: boolean;
  requiresGpuPool?: boolean;
  betaServiceTag?: string;
  gpuServiceTag?: string;
  servicePolicy?: ServicePolicy;
}

export interface ServicePolicyLimit {
  key?: string;
  label: string;
  value: string;
  unit?: string;
  hint?: string;
}

export interface ServicePolicyPricing {
  key?: string;
  label: string;
  value: string;
  cadence?: 'hit' | 'page' | 'session' | 'minute' | 'token';
  unit?: string;
  hint?: string;
}

export interface ServicePolicy {
  source?: 'catalog' | 'override';
  pricingMode?: 'per_hit' | 'per_page' | 'session' | 'hybrid';
  editable?: boolean;
  maxUploadSizeMB?: number | null;
  maxPages?: number | null;
  maxFiles?: number | null;
  allowedFormats?: string[];
  creditsPerHit?: number | null;
  creditsPerPage?: number | null;
  sessionStartCredits?: number | null;
  creditsPerMinute?: number | null;
  limits?: ServicePolicyLimit[];
  pricing?: ServicePolicyPricing[];
  notes?: string[];
}

export type SolutionType = 'qr-extract' | 'signature-verification' | 'id-crop' | 'document-enhancement' | 'ocr' | 'face-verify' | 'face-cropping' | 'qr-mask' | 'unknown';

export interface SerializableSolution {
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
  hasBeta?: boolean;
  requiresGpuPool?: boolean;
  betaServiceTag?: string;
  gpuServiceTag?: string;
  servicePolicy?: ServicePolicy;
}

export interface SerializableService {
  title: string;
  slug: string;
  gradient: string;
}

// Schema-related types
export interface SchemaData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export interface FAQItem {
  '@type': 'Question';
  name: string;
  acceptedAnswer: {
    '@type': 'Answer';
    text: string;
  };
}
