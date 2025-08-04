// components/StepCard.tsx
import React from 'react';

interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  children: React.ReactNode;
}

export const StepCard: React.FC<StepCardProps> = ({ stepNumber, title, description, children }) => (
  <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
    <h4 className="text-base sm:text-lg font-semibold mb-3 flex items-center">
      <span className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3">
        {stepNumber}
      </span>
      {title}
    </h4>
    <p className="text-gray-300 mb-4 text-sm sm:text-base">
      {description}
    </p>
    {children}
  </div>
);
