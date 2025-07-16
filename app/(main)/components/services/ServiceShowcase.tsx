// components/services/ServicesShowcase.tsx
'use client'
import React, { useState } from 'react';
import AvailableSolutions from './AvailableSolutions';
import ComingSoon from './ComingSoon';
import CTASection from './CTASection';

const ServicesShowcase = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black text-white py-0 px-4">
      <div className="max-w-7xl mx-auto">
        

        {/* Available Solutions */}
        <AvailableSolutions 
          hoveredCard={hoveredCard} 
          setHoveredCard={setHoveredCard} 
        />

        {/* Coming Soon */}
        <ComingSoon 
          hoveredCard={hoveredCard} 
          setHoveredCard={setHoveredCard}
          solutionsCount={6}
        />

        {/* Bottom CTA */}
        <CTASection />
      </div>
    </div>
  );
};

export default ServicesShowcase;