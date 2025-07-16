// app/solutions/[slug]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import { getSolution, generateSolutionStaticParams } from '@/app/(main)/lib/solutions';
import SolutionPageClient from './SolutionPageClient';

interface SolutionPageProps {
  params: Promise<{ slug: string }>; // Updated type
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

  // Extract only serializable data, explicitly excluding the icon component and useCases with icons
  const solutionData = {
    title: solution.title,
    slug: solution.slug,
    tagline: solution.tagline,
    description: solution.description,
    gradient: solution.gradient,
    apiEndpoint: solution.apiEndpoint,
    features: solution.features,
    // Transform useCases to exclude icons
    useCases: solution.useCases.map(useCase => ({
      title: useCase.title,
      description: useCase.description,
      // Don't include the icon - it will be resolved on the client side
    })),
    documentation: solution.documentation,
    heroImage: solution.heroImage,
  };

  // Pass the solution data to the Client Component
  return <SolutionPageClient solution={solutionData} />;
}