// app/api-docs/page.tsx
import React from 'react';

const apiDocs = [
  {
    title: 'Signature Verification API',
    slug: 'signature-verification',
    description: 'Authenticate signatures using machine learning to detect forgery, compare strokes, and validate authenticity.',
  },
  {
    title: 'QR Extract API',
    slug: 'qr-extract',
    description: 'Detect and extract multiple QR codes from images with error correction and damaged code support.',
  },
  {
    title: 'ID Crop API',
    slug: 'id-crop',
    description: 'Automatically extract tables from documents and images. Ideal for digitizing financial reports or scanned forms.',
  },
  {
    title: 'QR Masking API',
    slug: 'qr-masking',
    description: 'Create custom QR codes with brand integration, logos, and error resilience while tracking analytics.',
  },
  {
    title: 'Face Verify API',
    slug: 'face-verify',
    description: 'Facial recognition with liveness detection and biometric encryption for secure identity verification.',
  },
  {
    title: 'Face Cropping API',
    slug: 'face-cropping',
    description: 'Detect and crop faces with background removal and alignment for IDs, profiles, and more.',
  },
];

export default function ApiDocsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-24 text-white">
      <h1 className="text-5xl font-bold mb-10 text-center">API Documentation</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {apiDocs.map((api) => (
          <div
            key={api.slug}
            className="bg-gradient-to-br from-purple-700 to-indigo-800 p-6 rounded-2xl shadow-lg border border-purple-500 hover:scale-[1.02] transition-transform duration-200"
          >
            <h2 className="text-2xl font-semibold mb-2 text-white">{api.title}</h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">{api.description}</p>
            {/* <p className="text-sm text-purple-200">Endpoint:</p> */}
            {/* <code className="text-sm text-purple-100 break-words">/api/v1/{api.slug}</code> */}
          </div>
        ))}
      </div>
    </main>
  );
}
