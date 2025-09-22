// lib/solutions.ts
import { Table, QrCode, User, Scissors, Code, Zap, Shield, Globe, FileCheck, Cpu } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SolutionKey =
  | 'signature-verification'
  | 'qr-extract'
  | 'id-crop'
  | 'qr-masking'
  | 'face-verify'
  | 'face-cropping'
  | 'ocr-engine';

export interface UseCase {
  title: string;
  description: string;
  icon: LucideIcon;
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

export const rawSolutions: Record<SolutionKey, Solution> = {
  'signature-verification': {
    title: "Signature Verification",
    slug: "signature-verification",
    popular: true,
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
    soon:true,
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
  'ocr-engine': {
    title: "OCR Engine",
    slug: "ocr-engine",
    tagline: "OCR That Handles PDFs, Scans, and Screenshots.",
    description: "Intelligent face detection and cropping with automatic optimization for profile pictures, ID photos, and document processing applications.",
    icon: Cpu,
    available: true,
    soon: true,
    gradient: "from-yellow-600 to-orange-600",
    heroImage: "/api/placeholder/800/400",
    features: [
      "Auto-alignment for perfect portraits",
      "Quality enhancement algorithms",
      "Batch processing capabilities",
      "Multiple face detection",
      "Aspect ratio optimization",
      "Background removal options"
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
  }
};

export const solutions: Record<string, Solution> = Object.fromEntries(
  Object.entries(rawSolutions).map(
    ([key, sol]): [string, Solution] => [
      key,
      {
        ...sol,
        imageSrc: `/images/${sol.slug}.png`,
        gifSrc: `/images/${sol.slug}_gif.gif`
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

export const getSolutionsByCategory = (category: 'qr' | 'face' | 'document' | 'signature'): Solution[] => {
  const categoryMap = {
    qr: ['qr-extract', 'qr-masking'],
    face: ['face-verify', 'face-cropping'],
    document: ['id-crop'],
    signature: ['signature-verification']
  };
  
  return categoryMap[category]?.map(slug => solutions[slug as SolutionKey]).filter(Boolean) || [];
};

// Example usage for generating static params in Next.js
export const generateSolutionStaticParams = () => {
  return getSolutionKeys().map((slug) => ({
    slug: slug,
  }));
};

export const getPopularSolutions = (): Solution[] => {
  return Object.values(solutions).filter(sol => {
    if (sol.soon === true) return false
    if (sol.available === false) return false
    return sol.popular === true
  })
};

export const getAvailableSolutions = (): Solution[] => {
  return Object.values(solutions).filter(sol => {
    if (sol.soon === true) return false
    if (sol.available === false) return false
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