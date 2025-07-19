// components/TabbedResponseSection/LoadingState.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface LoadingStateProps {
  Icon: LucideIcon;
  message: string;
  showSpinner?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  Icon, 
  message, 
  showSpinner = true 
}) => {
  return (
    <div className="text-center py-12 h-full flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-600" />
      </div>
      <p className="text-gray-400">{message}</p>
      {showSpinner && (
        <div className="w-16 h-16 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mt-4" />
      )}
    </div>
  );
};