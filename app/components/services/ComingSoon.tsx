// components/services/ComingSoon.tsx
'use client'
import React from 'react';
import { AlertCircle } from 'lucide-react';
import ServiceCard from './ServiceCard';

interface ComingSoonProps {
  hoveredCard: number | null;
  setHoveredCard: (card: number | null) => void;
  solutionsCount?: number;
}

const ComingSoon = ({ hoveredCard, setHoveredCard, solutionsCount = 6 }: ComingSoonProps) => {
  const comingSoon = [
    {
      title: "Document Classification",
      description: "Advanced document classification with multi-category support and intelligent content analysis.",
      icon: AlertCircle,
      gradient: "from-gray-600 to-gray-700"
    },
    {
      title: "Voice AI",
      description: "Enterprise voice recognition and natural language processing with real-time transcription capabilities.",
      icon: AlertCircle,
      gradient: "from-gray-600 to-gray-700"
    },
    {
      title: "Audio Summarization",
      description: "Convert audio recordings into concise text summaries with key point extraction and sentiment analysis.",
      icon: AlertCircle,
      gradient: "from-gray-600 to-gray-700"
    },
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-8 text-center">
        Coming Soon
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {comingSoon.map((service, index) => (
          <ServiceCard 
            key={service.title} 
            service={service}
            index={solutionsCount + index}
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