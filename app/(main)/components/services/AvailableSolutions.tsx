// components/services/AvailableSolutions.tsx
'use client'
import React from 'react';
import ServiceCard from './ServiceCard2';
import { getAvailableSolutions } from '@/app/(main)/lib/solutions';

interface AvailableSolutionsProps {
  hoveredCard: number | null;
  setHoveredCard: (card: number | null) => void;
}

const AvailableSolutions: React.FC<AvailableSolutionsProps> = ({ 
  hoveredCard, 
  setHoveredCard 
}) => {
  const solutions = getAvailableSolutions().map(solution => ({
    title: solution.title,
    slug: solution.slug,
    description: solution.description,
    icon: solution.icon,
    imageSrc: solution.imageSrc,
    link: `/services/${solution.slug}`,
    features: solution.features.slice(0, 3), // Show only first 3 features for card display
    gradient: solution.gradient
  }));

  return (
    <div className="mb-20">
      {/* Container with responsive padding */}
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Mobile: Stack cards vertically with gap */}
        <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
          {solutions.map((solution, index) => (
            <div key={solution.slug} className="w-full">
              <ServiceCard 
                service={solution} 
                index={index}
                hoveredCard={hoveredCard}
                setHoveredCard={setHoveredCard}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Optional: Add a subtle background pattern */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      </div>
    </div>
  );
};

export default AvailableSolutions;