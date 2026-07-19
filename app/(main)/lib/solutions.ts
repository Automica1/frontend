// lib/solutions.ts
import { Table, QrCode, User, Scissors, Code, Zap, Shield, Globe, FileCheck, Mic, Volume2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SolutionKey =
  | 'signature-verification'
  | 'qr-extract'
  | 'id-crop'
  | 'document-enhancement'
  | 'ocr'
  | 'qr-masking'
  | 'face-verify'
  | 'face-cropping'
  | 'speech-to-text'
  | 'text-to-speech';

export interface UseCase {
  title: string;
  description: string;
  icon: LucideIcon;
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

export interface PricingTier {
  requests: number;
  price: number;
}

export interface Pricing {
  free: PricingTier;
  pro: PricingTier;
  enterprise: PricingTier;
}

export interface Solution {
  title: string;
  slug: SolutionKey;
  popular?: boolean;
  imageSrc?: string;
  gifSrc?: string;
  available?: boolean;
  soon?: boolean;
  hasBeta?: boolean;
  requiresGpuPool?: boolean;
  betaServiceTag?: string;
  gpuServiceTag?: string;
  servicePolicy?: ServicePolicy;
  tagline: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  heroImage: string;
  features: string[];
  useCases: UseCase[];
  apiEndpoint: string;
  documentation: string;
}

const SOLUTION_POLICY_STORAGE_KEY = 'automica.solutionPolicyOverrides.v1';

function canUseBrowserStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function cloneServicePolicy(policy?: ServicePolicy): ServicePolicy | undefined {
  if (!policy) return undefined;
  return {
    ...policy,
    allowedFormats: policy.allowedFormats ? [...policy.allowedFormats] : undefined,
    limits: policy.limits?.map((item) => ({ ...item })),
    pricing: policy.pricing?.map((item) => ({ ...item })),
    notes: policy.notes ? [...policy.notes] : undefined,
  };
}

function isSetNumber(value?: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function buildServicePolicyLimitRows(policy?: ServicePolicy): ServicePolicyLimit[] {
  const rows: ServicePolicyLimit[] = [];

  if (isSetNumber(policy?.maxUploadSizeMB)) {
    rows.push({ key: 'max_upload_size_mb', label: 'Upload size', value: `${policy.maxUploadSizeMB} MB` });
  }
  if (isSetNumber(policy?.maxPages)) {
    rows.push({ key: 'max_pages', label: 'Page count', value: `${policy.maxPages} pages` });
  }
  if (isSetNumber(policy?.maxFiles)) {
    rows.push({ key: 'max_files', label: 'File count', value: `${policy.maxFiles} file${policy.maxFiles === 1 ? '' : 's'}` });
  }
  if (policy?.allowedFormats?.length) {
    rows.push({ key: 'allowed_formats', label: 'Formats', value: policy.allowedFormats.join(', ') });
  }

  return [...rows, ...(policy?.limits || [])].reduce<ServicePolicyLimit[]>((acc, row) => {
    const dedupeKey = (row.key || row.label).trim().toLowerCase();
    if (!dedupeKey) return acc;
    if (acc.some((item) => (item.key || item.label).trim().toLowerCase() === dedupeKey)) return acc;
    acc.push({ ...row });
    return acc;
  }, []);
}

function buildServicePolicyPricingRows(policy?: ServicePolicy): ServicePolicyPricing[] {
  const rows: ServicePolicyPricing[] = [];

  if (isSetNumber(policy?.creditsPerHit)) {
    rows.push({ key: 'credits_per_hit', label: 'API hit', value: `${policy.creditsPerHit} credits`, cadence: 'hit' });
  }
  if (isSetNumber(policy?.creditsPerPage)) {
    rows.push({ key: 'credits_per_page', label: 'Per page', value: `${policy.creditsPerPage} credits / page`, cadence: 'page' });
  }
  if (isSetNumber(policy?.sessionStartCredits)) {
    rows.push({ key: 'session_start_credits', label: 'Session start', value: `${policy.sessionStartCredits} credits`, cadence: 'session' });
  }
  if (isSetNumber(policy?.creditsPerMinute)) {
    rows.push({ key: 'credits_per_minute', label: 'Runtime', value: `${policy.creditsPerMinute} credits / minute`, cadence: 'minute' });
  }

  return [...rows, ...(policy?.pricing || [])].reduce<ServicePolicyPricing[]>((acc, row) => {
    const dedupeKey = (row.key || row.label).trim().toLowerCase();
    if (!dedupeKey) return acc;
    if (acc.some((item) => (item.key || item.label).trim().toLowerCase() === dedupeKey)) return acc;
    acc.push({ ...row });
    return acc;
  }, []);
}

export function materializeServicePolicy(policy?: ServicePolicy): ServicePolicy | undefined {
  if (!policy) return undefined;
  return {
    ...cloneServicePolicy(policy),
    limits: buildServicePolicyLimitRows(policy),
    pricing: buildServicePolicyPricingRows(policy),
  };
}

function loadPolicyOverrides(): Partial<Record<SolutionKey, ServicePolicy>> {
  if (!canUseBrowserStorage()) return {};

  try {
    const raw = window.localStorage.getItem(SOLUTION_POLICY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<Record<SolutionKey, ServicePolicy>>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function savePolicyOverrides(overrides: Partial<Record<SolutionKey, ServicePolicy>>): void {
  if (!canUseBrowserStorage()) return;

  try {
    window.localStorage.setItem(SOLUTION_POLICY_STORAGE_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new Event('automica-solution-policy-changed'));
  } catch {
    // Ignore browser quota or privacy restrictions.
  }
}

export function saveSolutionPolicyOverride(slug: SolutionKey, policy: ServicePolicy): void {
  const overrides = loadPolicyOverrides();
  overrides[slug] = cloneServicePolicy({
    ...policy,
    source: 'override',
    editable: true,
  });
  savePolicyOverrides(overrides);
}

export function clearSolutionPolicyOverride(slug: SolutionKey): void {
  const overrides = loadPolicyOverrides();
  if (!(slug in overrides)) return;
  delete overrides[slug];
  savePolicyOverrides(overrides);
}

export function getSolutionPolicyOverride(slug: SolutionKey): ServicePolicy | undefined {
  return cloneServicePolicy(loadPolicyOverrides()[slug]);
}

export function resolveSolutionWithPolicy<T extends { slug: string; servicePolicy?: ServicePolicy }>(solution: T): T {
  const override = getSolutionPolicyOverride(solution.slug as SolutionKey);
  if (!override) {
    return {
      ...solution,
      servicePolicy: solution.servicePolicy ? materializeServicePolicy({ ...solution.servicePolicy, source: solution.servicePolicy.source || 'catalog' }) : undefined,
    } as T;
  }

  return {
    ...solution,
    servicePolicy: materializeServicePolicy({
      ...cloneServicePolicy(solution.servicePolicy),
      ...override,
      source: 'override',
    }),
  } as T;
}

export function summarizeServicePolicy(policy?: ServicePolicy): string {
  if (!policy) return 'No policy configured';

  const limitCount = [
    isSetNumber(policy.maxUploadSizeMB),
    isSetNumber(policy.maxPages),
    isSetNumber(policy.maxFiles),
    Boolean(policy.allowedFormats?.length),
    ...(policy.limits || []),
  ].filter(Boolean).length;
  const pricingCount = [
    isSetNumber(policy.creditsPerHit),
    isSetNumber(policy.creditsPerPage),
    isSetNumber(policy.sessionStartCredits),
    isSetNumber(policy.creditsPerMinute),
    ...(policy.pricing || []),
  ].filter(Boolean).length;

  const parts: string[] = [];
  if (limitCount) parts.push(`${limitCount} limit${limitCount === 1 ? '' : 's'}`);
  if (pricingCount) parts.push(`${pricingCount} price item${pricingCount === 1 ? '' : 's'}`);
  if (policy.notes?.length) parts.push(`${policy.notes.length} note${policy.notes.length === 1 ? '' : 's'}`);
  if (policy.pricingMode) parts.push(policy.pricingMode.replace('_', ' '));
  return parts.length ? parts.join(' · ') : 'Policy configured';
}

export const rawSolutions: Record<SolutionKey, Solution> = {
  'signature-verification': {
    title: "Signature Verification",
    slug: "signature-verification",
    popular: true,
    hasBeta: true,
    requiresGpuPool: true,
    gpuServiceTag: "vlm-gpu",
    tagline: "Authenticate Signatures—Fast and Flawless.",
    description: "A concise, AI-driven service that authenticates both handwritten and digital signatures in real time, ensuring document integrity and preventing fraud. With seamless API integration and industry-leading accuracy, it automates your verification workflows to boost compliance and reduce operational risk.",
    icon: FileCheck,
    gradient: "from-purple-600 to-blue-600",
    heroImage: "/api/placeholder/800/400",
    features: [
      "Advanced AI for signature analysis",
      // "Forgery detection with similarity scoring",
      "Support for various image formats",
      // "Real-time verification processing",
      // "Batch processing capabilities",
      "High accuracy fraud detection",
      "Quick response time"
    ],
    useCases: [
      {
        title: "Document Authentication",
        description: "Verify signatures on legal documents and contracts",
        icon: Shield
      },
      {
        title: "Banking & Finance",
        description: "Authenticate signatures on checks and financial documents",
        icon: Code
      },
      {
        title: "Insurance Claims",
        description: "Verify signatures on insurance forms and claims",
        icon: Zap
      }
    ],

    apiEndpoint: "http://localhost:8080/api/v1/signature-verification",
    documentation: "/docs/signature-verification"
  },
  'qr-extract': {
    title: "QR Extract",
    slug: "qr-extract",
    popular: false,
    available: true,
    tagline: "Unlock Information Hidden in Every QR.",
    description: "An intelligent API that accurately reads and decodes both digital and scanned QR codes in real time, transforming embedded data into structured formats. Seamlessly integrate it into your workflows to automate data capture, boost operational efficiency, and eliminate manual entry errors.",
    icon: QrCode,
    gradient: "from-blue-600 to-cyan-600",
    heroImage: "/api/placeholder/800/400",
    features: [
      "Batch processing for multiple QR codes",
      // "Damaged code recovery technology",
      "Multi-format support",
      // "Real-time video processing",
      // "Error correction algorithms",
      // "High-speed processing engine",
      "High-Accuracy Decoding",
      "Fast response: get your masked file back in seconds"
    ],
    useCases: [
      {
        title: "Inventory Management",
        description: "Scan product QR codes for tracking and analytics",
        icon: Code
      },
      {
        title: "Event Management",
        description: "Process tickets and attendee QR codes",
        icon: Zap
      },
      {
        title: "Document Processing",
        description: "Extract QR codes from scanned documents",
        icon: Globe
      }
    ],

    apiEndpoint: "https://api.yourcompany.com/v1/qr-extract",
    documentation: "/docs/qr-extract"
  },
  'id-crop': {
    title: "ID Crop",
    slug: "id-crop",
    popular: true,
    tagline: "Instant ID Cropping for Flawless Verification.",
    available: true,
    soon: false,
    description: "Automatically locate and crop identity documents—passports, driver’s licenses, and more—from photos or scans with pinpoint precision. Simplify downstream processing, bolster privacy controls, and maintain consistent, compliant document workflows.",
    icon: Table,
    gradient: "from-cyan-600 to-teal-600",
    heroImage: "/api/placeholder/800/400",
    features: [
      "Precision Cropping & Alignment",
      "Real-Time & Batch Processing",
      "Multi-format support",
      "Lightning-fast processing."
    ],
    useCases: [
      {
        title: "Financial Analysis",
        description: "Extract data from financial statements and reports",
        icon: Shield
      },
      {
        title: "Data Migration",
        description: "Convert paper documents to digital formats",
        icon: Code
      },
      {
        title: "Document Processing",
        description: "Automate data entry from scanned documents",
        icon: Zap
      }
    ],

    apiEndpoint: "https://api.yourcompany.com/v1/id-crop",
    documentation: "/docs/id-crop"
  },
  'document-enhancement': {
    title: "Document Enhancement",
    slug: "document-enhancement",
    tagline: "Restore blurry signatures and scans for reliable verification.",
    available: false,
    soon: false,
    description: "Enhance signature crops and document scans using a hybrid vision-language model and Real-ESRGAN restoration. Improves clarity for downstream signature verification and OCR workflows.",
    icon: FileCheck,
    gradient: "from-indigo-600 to-violet-600",
    heroImage: "/api/placeholder/800/400",
    features: [
      "Hybrid VLM + Real-ESRGAN pipeline",
      "Degradation-aware enhancement",
      "Signature and document crop support",
      "GPU-accelerated processing"
    ],
    useCases: [
      {
        title: "Signature Verification Prep",
        description: "Clean up blurry or low-res signature crops before matching",
        icon: Shield
      },
      {
        title: "Scan Restoration",
        description: "Reduce noise and improve contrast on phone photos of documents",
        icon: Zap
      },
      {
        title: "Compliance Workflows",
        description: "Standardize image quality for audit-ready document pipelines",
        icon: Globe
      }
    ],
    apiEndpoint: "https://api.yourcompany.com/v1/document-enhancement",
    documentation: "/docs/document-enhancement"
  },
  'ocr': {
    title: "OCR",
    slug: "ocr",
    tagline: "Extract searchable text from documents with an active ocr-gpu session.",
    available: true,
    popular: true,
    requiresGpuPool: true,
    gpuServiceTag: "ocr-gpu",
    servicePolicy: {
      source: 'catalog',
      pricingMode: 'hybrid',
      editable: true,
      maxUploadSizeMB: 100,
      maxPages: null,
      maxFiles: 1,
      allowedFormats: ['PDF', 'JPG', 'PNG', 'JPEG'],
      creditsPerHit: 4,
      creditsPerPage: 1,
      sessionStartCredits: 20,
      creditsPerMinute: 2,
      limits: [
        { key: 'page_count_policy', label: 'Page count', value: 'Configured by backend policy' },
      ],
      notes: [
        "OCR is session-backed today and also exposes a per-hit view for Try API clarity.",
        "Keep page limits aligned with the worker and PDF parser before tightening enforcement.",
      ],
    },
    description: "Convert scanned PDFs and document images into clean text and structured blocks using the ocr-gpu session. Built for document automation workflows that need reliable extraction from complex layouts.",
    icon: FileCheck,
    gradient: "from-emerald-600 to-cyan-600",
    heroImage: "/api/placeholder/800/400",
    imageSrc: "/images/id-crop.png",
    gifSrc: "/images/id-crop_gif.gif",
    features: [
      "GPU-accelerated OCR extraction",
      "PDF and image document support",
      "Structured text and block output",
      "Requires an active ocr-gpu session"
    ],
    useCases: [
      {
        title: "Document Digitization",
        description: "Turn scanned PDFs into searchable text for downstream workflows",
        icon: Shield
      },
      {
        title: "Operations Automation",
        description: "Extract text from forms, statements, and submitted documents",
        icon: Zap
      },
      {
        title: "Compliance Review",
        description: "Normalize document text for audit and review pipelines",
        icon: Globe
      }
    ],
    apiEndpoint: "https://automica.ai/go/api/v1/ocr",
    documentation: "/docs/ocr"
  },
  'qr-masking': {
    title: "QR Masking",
    slug: "qr-masking",
    available: true,
    popular: true,
    tagline: "Instant QR Masking. Total Document Privacy.",
    description: "Obscure sensitive payloads inside QR codes to prevent unauthorized data exposure. Ensure compliance with industry regulations and audit requirements. Uphold privacy standards and securely share QR-enabled documents across workflows.",
    icon: QrCode,
    gradient: "from-teal-600 to-green-600",
    heroImage: "/api/placeholder/800/400",
    features: [
      "Batch & Bulk Operations",
      "Optimised performance",
      "Works with multiple QRs in single document",
      "Instant turnaround guaranteed."
    ],
    useCases: [
      {
        title: "Marketing Campaigns",
        description: "Create branded QR codes for promotional materials",
        icon: Globe
      },
      {
        title: "Product Packaging",
        description: "Add custom QR codes to product labels",
        icon: Shield
      },
      {
        title: "Event Branding",
        description: "Generate event-specific branded QR codes",
        icon: Zap
      }
    ],

    apiEndpoint: "https://api.yourcompany.com/v1/qr-masking",
    documentation: "/docs/qr-masking"
  },
  'face-verify': {
    title: "Face Verify",
    slug: "face-verify",
    available: true,
    // soon:false,
    tagline: "Secure facial recognition and verification",
    description: "Match live facial captures against stored images for robust identity authentication. Maintain accuracy across lighting, poses, and device cameras with advanced deep learning. Reduce fraud and accelerate onboarding while ensuring a seamless user experience.",
    icon: User,
    gradient: "from-green-600 to-yellow-600",
    heroImage: "/api/placeholder/800/400",
    features: [
      "High accuracy across varied document quality",
      "Privacy-first approach with data protection",
      "Real-time verification processing",
      "Multi-Angle Face Matching"
    ],
    useCases: [
      {
        title: "Access Control",
        description: "Secure building and system access verification",
        icon: Shield
      },
      {
        title: "Identity Verification",
        description: "KYC and customer onboarding processes",
        icon: Code
      },
      {
        title: "Attendance Systems",
        description: "Employee time tracking and attendance",
        icon: Zap
      }
    ],

    apiEndpoint: "https://api.yourcompany.com/v1/face-verify",
    documentation: "/docs/face-verify"
  },
  'face-cropping': {
    title: "Face Cropping",
    slug: "face-cropping",
    tagline: "Intelligent face detection and cropping",
    description: "Automatically detect and isolate facial regions from photos or video frames. Standardize image inputs for recognition, analysis, or anonymization. Streamline downstream workflows while preserving user privacy and data consistency.",
    icon: Scissors,
    available: true,
    gradient: "from-yellow-600 to-orange-600",
    heroImage: "/api/placeholder/800/400",
    features: [
      "Auto-alignment for perfect portraits",
      // "Quality enhancement algorithms",
      "Batch processing capabilities",
      "Efficient, and Built for Maximum Throughput."
    ],
    useCases: [
      {
        title: "Profile Pictures",
        description: "Optimize photos for social media and professional use",
        icon: Globe
      },
      {
        title: "Employee Photos",
        description: "Process employee photos for company directories",
        icon: Code
      },
      {
        title: "ID Processing",
        description: "Extract and optimize face photos from ID documents",
        icon: Shield
      }
    ],

    apiEndpoint: "https://api.yourcompany.com/v1/face-cropping",
    documentation: "/docs/face-cropping"
  },
  'speech-to-text': {
    title: "Speech to Text",
    slug: "speech-to-text",
    available: true,
    soon: false,
    tagline: "Convert Speech to Text with High Accuracy.",
    description: "Transform spoken words into accurate text using advanced AI-powered speech recognition. Support for multiple languages, accents, and audio formats with real-time processing capabilities.",
    icon: Mic,
    gradient: "from-blue-600 to-purple-600",
    heroImage: "/api/placeholder/800/400",
    features: [
      "High accuracy speech recognition",
      "Multi-language support",
      "Real-time processing",
      "Noise reduction technology",
      "Multiple audio formats"
    ],
    useCases: [
      {
        title: "Meeting Transcription",
        description: "Automatically transcribe meetings and conversations",
        icon: Globe
      },
      {
        title: "Voice Commands",
        description: "Enable voice control in applications",
        icon: Code
      },
      {
        title: "Content Creation",
        description: "Convert audio content to written format",
        icon: Zap
      }
    ],

    apiEndpoint: "https://api.yourcompany.com/v1/speech-to-text",
    documentation: "/docs/speech-to-text"
  },
  'text-to-speech': {
    title: "Text to Speech",
    slug: "text-to-speech",
    available: true,
    soon: false,
    tagline: "Natural Voice Synthesis from Text.",
    description: "Convert written text into natural-sounding speech using advanced AI voice synthesis. Multiple voice options, languages, and customizable speaking styles for engaging audio content.",
    icon: Volume2,
    gradient: "from-purple-600 to-pink-600",
    heroImage: "/api/placeholder/800/400",
    features: [
      "Natural voice quality",
      "Multiple voice options",
      "Language support",
      "Customizable speaking styles",
      "Fast audio generation"
    ],
    useCases: [
      {
        title: "Audiobooks",
        description: "Convert written content to audio format",
        icon: Globe
      },
      {
        title: "Accessibility",
        description: "Provide audio versions of text content",
        icon: Shield
      },
      {
        title: "Voice Assistants",
        description: "Generate speech for AI assistants",
        icon: Code
      }
    ],

    apiEndpoint: "https://api.yourcompany.com/v1/text-to-speech",
    documentation: "/docs/text-to-speech"
  }
};

export const solutions: Record<string, Solution> = Object.fromEntries(
  Object.entries(rawSolutions).map(
    ([key, sol]): [string, Solution] => [
      key,
      {
        ...sol,
        imageSrc: sol.imageSrc || `/images/${sol.slug}.png`,
        gifSrc: sol.gifSrc || `/images/${sol.slug}_gif.gif`
      }
    ]
  )
)


// Helper functions
export const getSolution = (slug: string): Solution | undefined => {
  return solutions[slug as SolutionKey];
};

export const getAllSolutions = (): Solution[] => {
  return Object.values(solutions);
};

export const getSolutionKeys = (): SolutionKey[] => {
  return Object.keys(solutions) as SolutionKey[];
};

export const isSolutionCatalogVisible = (solution: Solution): boolean => {
  if (solution.soon === true) return false;
  if (solution.available === false) return false;
  if (solution.slug === 'speech-to-text' || solution.slug === 'text-to-speech') return false;
  return solution.available === true || solution.popular === true;
};

export const getSolutionsByCategory = (category: 'qr' | 'face' | 'document' | 'signature'): Solution[] => {
  const categoryMap = {
    qr: ['qr-extract', 'qr-masking'],
    face: ['face-verify', 'face-cropping'],
    document: ['id-crop', 'document-enhancement', 'ocr'],
    signature: ['signature-verification']
  };
  
  return categoryMap[category]?.map(slug => solutions[slug as SolutionKey]).filter(Boolean) || [];
};

// Example usage for generating static params in Next.js
export const generateSolutionStaticParams = () => {
  return getSolutionKeys()
    .filter((slug) => {
      const solution = solutions[slug];
      return solution ? isSolutionCatalogVisible(solution) : false;
    })
    .map((slug) => ({
      slug: slug,
    }));
};

export const getPopularSolutions = (): Solution[] => {
  return Object.values(solutions).map(resolveSolutionWithPolicy).filter(sol => {
    if (sol.soon === true) return false
    if (sol.available === false) return false
    return sol.popular === true
  })
};

export const getAvailableSolutions = (): Solution[] => {
  return Object.values(solutions).map(resolveSolutionWithPolicy).filter(sol => {
    if (sol.soon === true) return false
    if (sol.available === false) return false
    // Exclude speech-to-text and text-to-speech from available solutions
    if (sol.slug === 'speech-to-text' || sol.slug === 'text-to-speech') return false
    return sol.available === true || sol.popular === true
  })
};

export const getSoonSolutions = (): Solution[] => {
  const all = Object.values(solutions)
  console.debug('[getSoonSolutions] all:', all)

  // 2. Filter by soon === true
  const soon = all.filter(sol => sol.soon === true)
  console.debug('[getSoonSolutions] filtered soon:', soon)

  return soon
};

export const getLiveSolutions = (): Solution[] => {
  const all = Object.values(solutions).map(resolveSolutionWithPolicy)
  
  // Filter by available === true and soon === false (live services)
  const live = all.filter(sol => sol.available === true && sol.soon === false)
  
  return live
};
