// app/features/page.tsx
import React from 'react';

export default function FeaturesPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Platform Features</h1>
      <section className="space-y-6 text-lg text-gray-300">
        <p>✔ Upload documents in any format (PDFs, images, etc.)</p>
        <p>✔ AI-powered processing with customizable use cases</p>
        <p>✔ Secure API access with enterprise-grade compliance</p>
        <p>✔ Real-time response and batch processing capabilities</p>
        <p>✔ Built-in analytics and error handling</p>
        <p>✔ Scalable and plug-and-play deployment</p>
      </section>
    </main>
  );
}