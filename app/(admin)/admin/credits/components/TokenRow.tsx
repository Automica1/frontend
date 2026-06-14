import React from 'react';
import { Eye, Trash2 } from 'lucide-react';

interface Token {
  id: string;
  token: string;
  credits: number;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string;
  description: string;
}

interface TokenRowProps {
  token: Token;
  onViewDetails: (token: Token) => void;
  onDeleteToken: (token: Token) => void;
  isDeleting: boolean;
  formatTokenForDisplay: (token: string) => string;
  formatDate: (date: string) => string;
  getDaysUntilExpiry: (expiresAt: string) => number;
  isTokenExpired: (expiresAt: string) => boolean;
}

export default function TokenRow({
  token,
  onViewDetails,
  onDeleteToken,
  isDeleting,
  formatTokenForDisplay,
  formatDate,
  getDaysUntilExpiry,
  isTokenExpired
}: TokenRowProps) {
  const expired = isTokenExpired(token.expiresAt);
  const daysUntilExpiry = getDaysUntilExpiry(token.expiresAt);

  const getStatusBadge = () => {
    if (token.isUsed) {
      return (
        <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-200">
          Used
        </span>
      );
    }
    
    if (expired) {
      return (
        <span className="inline-flex items-center rounded-full border border-rose-400/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-200">
          Expired
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-200">
        Active
      </span>
    );
  };

  const getExpiryDisplay = () => {
    if (expired) {
      return (
        <span className="font-medium text-rose-300">
          Expired
        </span>
      );
    }

    if (daysUntilExpiry <= 7) {
      return (
        <div>
          <div className="font-medium text-amber-200">
            {formatDate(token.expiresAt)}
          </div>
          <div className="text-xs text-amber-300/80">
            {daysUntilExpiry} days left
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="text-gray-100">
          {formatDate(token.expiresAt)}
        </div>
        <div className="text-xs text-gray-500">
          {daysUntilExpiry} days left
        </div>
      </div>
    );
  };

  return (
    <tr className={`border-b border-white/5 transition-colors hover:bg-white/5 ${isDeleting ? 'opacity-50' : ''}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="text-sm">
            <div className="rounded bg-black/25 px-2 py-1 font-mono text-gray-100">
              {formatTokenForDisplay(token.token)}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-white">
          {token.credits.toLocaleString()}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge()}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm text-gray-100">
            {formatDate(token.createdAt)}
          </div>
          <div className="text-xs text-gray-500">
            by {token.createdBy}
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        {getExpiryDisplay()}
      </td>
      
      <td className="px-6 py-4">
        <div className="max-w-xs truncate text-sm text-gray-200" title={token.description}>
          {token.description || 'No description'}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          {/* View Details Button */}
          <button
            onClick={() => onViewDetails(token)}
            disabled={isDeleting}
            className="rounded-xl border border-white/10 p-2 text-blue-200 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:text-gray-500"
            title="View Details"
          >
            <Eye className="h-5 w-5" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDeleteToken(token)}
            disabled={isDeleting}
            className="rounded-xl border border-white/10 p-2 text-rose-200 transition-colors hover:bg-rose-500/10 hover:text-white disabled:cursor-not-allowed disabled:text-gray-500"
            title={isDeleting ? "Deleting..." : "Delete Token"}
          >
            {isDeleting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-rose-300 border-t-transparent"></div>
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}
