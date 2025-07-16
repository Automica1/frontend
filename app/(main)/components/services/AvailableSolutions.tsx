// components/services/AvailableSolutions.tsx
'use client'
import React from 'react';
import ServiceCard from './ServiceCard2';
import { getAvailableSolutions } from '@/app/lib/solutions';

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
    imageSrc : solution.imageSrc,
    link: `/services/${solution.slug}`,
    features: solution.features.slice(0, 3), // Show only first 3 features for card display
    gradient: solution.gradient
  }));

  return (
    <div className="mb-20">
      {/* Changed from grid to vertical stack with full width */}
      <div className="space-y-6 max-w-7xl mx-auto">
        {solutions.map((solution, index) => (
          <ServiceCard 
            key={solution.slug} 
            service={solution} 
            index={index}
            hoveredCard={hoveredCard}
            setHoveredCard={setHoveredCard}
          />
        ))}
      </div>
    </div>
  );
};

export default AvailableSolutions;