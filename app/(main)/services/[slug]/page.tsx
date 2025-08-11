// app/solutions/[slug]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import { getSolution, generateSolutionStaticParams, getAvailableSolutions } from '@/app/(main)/lib/solutions';
import SolutionPageClient from './SolutionPageClient1';

interface SolutionPageProps {
  params: Promise<{ slug: string }>;
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
    <SolutionPageClient 
      solution={solutionData} 
      services={servicesData}
    />
  );
}