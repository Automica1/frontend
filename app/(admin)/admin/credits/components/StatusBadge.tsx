import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  isUsed: boolean;
  isExpired: boolean;
}

export default function StatusBadge({ isUsed, isExpired }: StatusBadgeProps) {
  if (isUsed) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Used
      </span>
    );
  }

  if (isExpired) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Expired
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      <Clock className="w-3 h-3 mr-1" />
      Unused
    </span>
  );
}