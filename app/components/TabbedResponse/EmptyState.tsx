// components/TabbedResponseSection/EmptyState.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  Icon: LucideIcon;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ Icon, message }) => {
  return (
    <div className="text-center py-12 h-full flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-600" />
      </div>
      <p className="text-gray-400">{message}</p>
    </div>
  );
};