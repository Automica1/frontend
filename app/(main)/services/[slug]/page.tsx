// app/services/[slug]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getSolution, generateSolutionStaticParams, getAvailableSolutions } from '@/app/(main)/lib/solutions';
import { generateSolutionSchema } from '@/app/(main)/lib/schema';
import { SchemaMarkup } from '../../components/SchemaMarkup';
import SolutionPageClient from './SolutionPageClient1';

interface SolutionPageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for each solution
export async function generateMetadata({ params }: SolutionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolution(slug);

  if (!solution) {
    return {
      title: 'Solution Not Found',
      description: 'The requested solution could not be found.',
    };
  }

  // Meta data mapping for each service
  const metaData = {
    'signature-verification': {
      title: 'Signature Verification API | Authenticate Signatures Fast & Flawless',
      description: 'AI-driven signature verification service that authenticates handwritten and digital signatures in real-time. Prevent fraud, ensure document integrity, and automate verification workflows with industry-leading accuracy.',
      keywords: 'signature verification, AI signature authentication, fraud detection, document verification, digital signature, handwritten signature, API integration, signature analysis',
      openGraph: {
        title: 'Signature Verification API - Fast and Flawless Authentication',
        description: 'Authenticate signatures with AI-powered verification. Real-time processing, high accuracy fraud detection, and seamless API integration for document security.',
        type: 'website',
        images: [
          {
            url: '/images/signature-verification-og.jpg',
            width: 1200,
            height: 630,
            alt: 'Signature Verification API Dashboard',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Signature Verification API | AI-Powered Authentication',
        description: 'Authenticate signatures fast and flawlessly with our AI-driven verification service. High accuracy fraud detection and real-time processing.',
        images: ['/images/signature-verification-twitter.jpg'],
      },
    },
    'qr-extract': {
      title: 'QR Code Extraction API | Unlock Information Hidden in Every QR',
      description: 'Intelligent QR code reader API that accurately decodes digital and scanned QR codes in real-time. Transform embedded data into structured formats with high-accuracy processing.',
      keywords: 'QR code extraction, QR decoder API, QR code reader, batch QR processing, multi-format QR support, QR code scanning, data extraction, inventory management',
      openGraph: {
        title: 'QR Extract API - Unlock Information Hidden in Every QR',
        description: 'Read and decode QR codes with intelligent API. Real-time processing, batch operations, and multi-format support for automated data capture.',
        type: 'website',
        images: [
          {
            url: '/images/qr-extract-og.jpg',
            width: 1200,
            height: 630,
            alt: 'QR Code Extraction API Interface',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'QR Extract API | Intelligent QR Code Decoding',
        description: 'Unlock information hidden in every QR code. High-accuracy decoding, batch processing, and real-time data transformation.',
        images: ['/images/qr-extract-twitter.jpg'],
      },
    },
    'id-crop': {
      title: 'ID Crop API | Instant ID Document Cropping for Verification',
      description: 'Automatically locate and crop identity documents from photos with pinpoint precision. Support for passports, driver licenses, and more. Simplify document processing workflows.',
      keywords: 'ID cropping, document cropping API, identity document processing, passport cropping, driver license extraction, document verification, precision cropping, batch processing',
      openGraph: {
        title: 'ID Crop API - Instant Document Cropping for Verification',
        description: 'Automatically crop identity documents with pinpoint precision. Real-time processing for passports, licenses, and more.',
        type: 'website',
        images: [
          {
            url: '/images/id-crop-og.jpg',
            width: 1200,
            height: 630,
            alt: 'ID Document Cropping API Dashboard',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'ID Crop API | Precision Document Cropping',
        description: 'Instant ID cropping for flawless verification. Automatically locate and crop identity documents with pinpoint precision.',
        images: ['/images/id-crop-twitter.jpg'],
      },
    },
    'qr-masking': {
      title: 'QR Masking API | Instant QR Masking for Total Document Privacy',
      description: 'Obscure sensitive payloads inside QR codes to prevent unauthorized data exposure. Ensure compliance with industry regulations and maintain privacy standards.',
      keywords: 'QR masking, QR code privacy, data protection, QR obfuscation, document privacy, sensitive data masking, compliance, bulk QR operations, privacy API',
      openGraph: {
        title: 'QR Masking API - Total Document Privacy Protection',
        description: 'Obscure sensitive QR code data to prevent unauthorized exposure. Instant masking, bulk operations, and compliance-ready privacy protection.',
        type: 'website',
        images: [
          {
            url: '/images/qr-masking-og.jpg',
            width: 1200,
            height: 630,
            alt: 'QR Masking API Privacy Dashboard',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'QR Masking API | Total Document Privacy',
        description: 'Instant QR masking for total document privacy. Obscure sensitive payloads and ensure compliance with industry regulations.',
        images: ['/images/qr-masking-twitter.jpg'],
      },
    },
    'face-verify': {
      title: 'Face Verification API | Secure Facial Recognition & Identity Authentication',
      description: 'Match live facial captures against stored images for robust identity authentication. Advanced deep learning for accuracy across lighting and poses. Reduce fraud and accelerate onboarding.',
      keywords: 'face verification, facial recognition API, identity authentication, face matching, biometric verification, KYC verification, access control, fraud prevention, deep learning',
      openGraph: {
        title: 'Face Verify API - Secure Facial Recognition & Verification',
        description: 'Robust facial identity authentication with advanced deep learning. High accuracy across varied conditions for secure verification.',
        type: 'website',
        images: [
          {
            url: '/images/face-verify-og.jpg',
            width: 1200,
            height: 630,
            alt: 'Face Verification API Security Dashboard',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Face Verify API | Secure Facial Recognition',
        description: 'Secure facial recognition and verification. Match live captures with stored images using advanced deep learning technology.',
        images: ['/images/face-verify-twitter.jpg'],
      },
    },
    'face-cropping': {
      title: 'Face Cropping API | Intelligent Face Detection & Cropping',
      description: 'Automatically detect and isolate facial regions from photos or video frames. Standardize image inputs for recognition, analysis, or anonymization with auto-alignment.',
      keywords: 'face cropping, face detection API, facial region extraction, image processing, auto-alignment, profile pictures, batch processing, face isolation',
      openGraph: {
        title: 'Face Cropping API - Intelligent Face Detection & Cropping',
        description: 'Automatically detect and crop facial regions with intelligent processing. Auto-alignment, batch processing, and optimized for maximum throughput.',
        type: 'website',
        images: [
          {
            url: '/images/face-cropping-og.jpg',
            width: 1200,
            height: 630,
            alt: 'Face Cropping API Processing Interface',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Face Cropping API | Intelligent Face Detection',
        description: 'Intelligent face detection and cropping. Automatically isolate facial regions with auto-alignment and batch processing capabilities.',
        images: ['/images/face-cropping-twitter.jpg'],
      },
    },
  };

  const currentMeta = metaData[slug as keyof typeof metaData];

  if (!currentMeta) {
    return {
      title: `${solution.title} | AI-Powered API Service`,
      description: solution.description,
    };
  }

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    keywords: currentMeta.keywords,
    openGraph: currentMeta.openGraph,
    twitter: currentMeta.twitter,
    alternates: {
      canonical: `https://automica.ai/services/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// This function stays in the Server Component
export function generateStaticParams() {
  return generateSolutionStaticParams();
}

// Server Component that handles the data fetching and static generation
export default async function SolutionPage({ params }: SolutionPageProps) {
  // Await the params
  const { slug } = await params;
  const solution = getSolution(slug);

  if (!solution) {
    notFound();
  }

  // Get all available solutions for the sidebar/mobile navigation
  const allSolutions = getAvailableSolutions();

  // Generate schema markup for this solution
  const schemas = generateSolutionSchema(solution, slug);

  // Extract only serializable data for the current solution
  const solutionData = {
    title: solution.title,
    slug: solution.slug,
    tagline: solution.tagline,
    description: solution.description,
    gradient: solution.gradient,
    apiEndpoint: solution.apiEndpoint,
    features: solution.features,
    gifSrc: solution.gifSrc,
    // Transform useCases to exclude icons (will be resolved client-side)
    useCases: solution.useCases.map(useCase => ({
      title: useCase.title,
      description: useCase.description,
    })),
    documentation: solution.documentation,
    heroImage: solution.heroImage,
  };

  // Extract serializable services data (exclude icons, will be resolved client-side)
  const servicesData = allSolutions.map(sol => ({
    title: sol.title,
    slug: sol.slug,
    gradient: sol.gradient,
    // Icon will be resolved on client side based on slug
  }));

  // Pass both solution and services data to the Client Component
  return (
    <>
      {/* Add Schema Markup to the page head */}
      <SchemaMarkup schemas={schemas} />
      
      {/* Main component */}
      <SolutionPageClient 
        solution={solutionData} 
        services={servicesData}
      />
    </>
  );
}