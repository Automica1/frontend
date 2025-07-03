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
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center space-x-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span>API Solutions</span>
          </div>
          
          {/* <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            Powerful AI APIs
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Transform your applications with our cutting-edge computer vision and AI APIs. 
            Built for developers, designed for scale.
          </p> */}
        </div>

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