// EmptyState.tsx
import React from 'react';
import { CreditCard } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
}

export default function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <CreditCard className="mx-auto w-12 h-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No tokens found</h3>
      <p className="mt-1 text-sm text-gray-500">
        {hasFilters 
          ? 'Try adjusting your search or filter criteria.'
          : 'Get started by creating your first token.'
        }
      </p>
    </div>
  );
}