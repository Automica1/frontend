import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  isUsed: boolean;
  isExpired: boolean;
}

export default function StatusBadge({ isUsed, isExpired }: StatusBadgeProps) {
  if (isUsed) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-emerald-400/20 bg-emerald-500/10 text-emerald-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Used
      </span>
    );
  }

  if (isExpired) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-rose-400/20 bg-rose-500/10 text-rose-200">
        <XCircle className="w-3 h-3 mr-1" />
        Expired
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-amber-400/20 bg-amber-500/10 text-amber-200">
      <Clock className="w-3 h-3 mr-1" />
      Unused
    </span>
  );
}
