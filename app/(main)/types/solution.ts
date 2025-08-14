// types/solution.ts
export interface Solution {
  title: string;
  IconComponent: React.ComponentType<any>;
  gradient: string;
  apiEndpoint?: string;
  slug?: string;
}

export type SolutionType = 'qr-extract' | 'signature-verification' | 'id-crop' | 'face-verify' | 'face-cropping' | 'qr-mask' | 'unknown';

// types/solution.ts
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