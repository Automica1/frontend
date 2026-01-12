// components/services/ComingSoon.tsx
'use client'
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { getSoonSolutions, getLiveSolutions, type Solution } from '@/app/(main)/lib/solutions';
import ServiceCard from './ServiceCard';

interface ComingSoonProps {
  hoveredCard: number | null;
  setHoveredCard: (card: number | null) => void;
  solutionsCount?: number;
}

const ComingSoon = ({ hoveredCard, setHoveredCard, solutionsCount = 6 }: ComingSoonProps) => {

  const comingSoon: Solution[] = getSoonSolutions()
  const liveServices: Solution[] = getLiveSolutions().filter(service => 
    service.slug === 'speech-to-text' || service.slug === 'text-to-speech'
  )
  
  const allServices = [...liveServices, ...comingSoon]
  
  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-8 text-center">
        Coming Soon
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allServices.map((solution, idx) => {
          const isLive = solution.available === true && solution.soon === false
          const isComingSoon = solution.soon === true
          const isSpeechService = solution.slug === 'speech-to-text' || solution.slug === 'text-to-speech'
          
          return (
            <ServiceCard 
              key={solution.slug} 
              service={{
                title: solution.title,
                description: solution.tagline,
                icon: solution.icon,
                gradient: isLive ? solution.gradient : 'from-gray-600 to-gray-700',
                link: isSpeechService ? '/contact' : `/services/${solution.slug}`
              }}
              index={solutionsCount + idx}
              isComingSoon={isComingSoon}
              isLive={isLive}
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
            />
          )
        })}
      </div>
    </div>
  );
};

export default ComingSoon;