// components/services/ComingSoon.tsx
'use client'
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { getSoonSolutions, type Solution } from '@/app/(main)/lib/solutions';
import ServiceCard from './ServiceCard';

interface ComingSoonProps {
  hoveredCard: number | null;
  setHoveredCard: (card: number | null) => void;
  solutionsCount?: number;
}

const ComingSoon = ({ hoveredCard, setHoveredCard, solutionsCount = 6 }: ComingSoonProps) => {

  const comingSoon: Solution[] = getSoonSolutions()
  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-8 text-center">
        Coming Soon
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {comingSoon.map((solution, idx) => (
          <ServiceCard 
            key={solution.slug} 
            service={{
              title: solution.title,
              description: solution.tagline,
              icon: solution.icon,
              // keep the same gray gradient for all coming-soon cards
              gradient: 'from-gray-600 to-gray-700'
            }}
            index={solutionsCount + idx}
            isComingSoon={true}
            hoveredCard={hoveredCard}
            setHoveredCard={setHoveredCard}
          />
        ))}
      </div>
    </div>
  );
};

export default ComingSoon;