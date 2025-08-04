// components/CopyButton.tsx
import React from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  id: string;
  copied: string;
  onCopy: (text: string, id: string) => void;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, id, copied, onCopy, className = "" }) => (
  <button
    onClick={() => onCopy(text, id)}
    className={`p-1.5 sm:p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs sm:text-sm transition-colors duration-300 ${className}`}
  >
    {copied === id ? (
      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
    ) : (
      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
    )}
  </button>
);