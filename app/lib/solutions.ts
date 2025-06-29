// lib/solutions.ts
import { Table, QrCode, User, Scissors, Code, Zap, Shield, Globe, FileCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SolutionKey =
  | 'signature-verification'
  | 'qr-extract'
  | 'id-crop'
  | 'qr-masking'
  | 'face-verify'
  | 'face-cropping';

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

export const solutions: Record<SolutionKey, Solution> = {
  'signature-verification': {
    title: "Signature Verification",
    slug: "signature-verification",
    tagline: "AI-powered signature authentication",
    description: "Advanced signature verification API that compares two signature images to detect forgeries. Uses machine learning algorithms to analyze signature patterns, stroke dynamics, and authenticity markers.",
    icon: FileCheck,
    gradient: "from-purple-600 to-blue-600",
    heroImage: "/api/placeholder/800/400",
    features: [
      "Advanced ML algorithms for signature analysis",
      "Forgery detection with similarity scoring",
      "Support for various image formats",
      "Real-time verification processing",
      "Batch processing capabilities",
      "High accuracy fraud detection"
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
    tagline: "Advanced QR code detection and extraction",
    description: "Advanced QR code detection and extraction from images with high accuracy. Supports multiple QR codes in a single image and works even with damaged or partially obscured codes.",
    icon: QrCode,
    gradient: "from-blue-600 to-cyan-600",
    heroImage: "/api/placeholder/800/400",
    features: [
      "Batch processing for multiple QR codes",
      "Damaged code recovery technology",
      "Multi-format support (QR, Data Matrix, etc.)",
      "Real-time video processing",
      "Error correction algorithms",
      "High-speed processing engine"
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
    tagline: "Intelligent document table extraction",
    description: "Automatically detect, extract, and structure tabular data from documents, images, and scanned files with our Table Detection API. Essential for financial analysis, data migration, and document processing.",
    icon: Table,
    gradient: "from-cyan-600 to-teal-600",
    heroImage: "/api/placeholder/800/400",
    features: [
      "Complex table recognition algorithms",
      "CSV and Excel export capabilities",
      "Maintains formatting integrity",
      "Multi-page document support",
      "Handwritten text recognition",
      "Financial document optimization"
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
    tagline: "Create branded QR codes that work",
    description: "Create branded, visually appealing QR codes without compromising scan reliability. Our QR Masking API enables customization while ensuring optimal functionality.",
    icon: QrCode,
    gradient: "from-teal-600 to-green-600",
    heroImage: "/api/placeholder/800/400",
    features: [
      "Brand integration with logos and colors",
      "Error correction optimization",
      "Analytics tracking built-in",
      "Custom design templates",
      "Bulk generation capabilities",
      "Quality assurance testing"
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
    tagline: "Secure facial recognition and verification",
    description: "Advanced facial recognition and verification system with high accuracy and privacy protection. Perfect for security applications and identity verification systems.",
    icon: User,
    gradient: "from-green-600 to-yellow-600",
    heroImage: "/api/placeholder/800/400",
    features: [
      "Privacy-first approach with data protection",
      "Liveness detection to prevent spoofing",
      "Cross-platform compatibility",
      "Real-time verification processing",
      "Biometric template encryption",
      "GDPR and privacy compliance"
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
    description: "Intelligent face detection and cropping with automatic optimization for profile pictures, ID photos, and document processing applications.",
    icon: Scissors,
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