import React from 'react';
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline';

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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Used
        </span>
      );
    }
    
    if (expired) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expired
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Active
      </span>
    );
  };

  const getExpiryDisplay = () => {
    if (expired) {
      return (
        <span className="text-red-600 font-medium">
          Expired
        </span>
      );
    }

    if (daysUntilExpiry <= 7) {
      return (
        <div>
          <div className="text-orange-600 font-medium">
            {formatDate(token.expiresAt)}
          </div>
          <div className="text-xs text-orange-500">
            {daysUntilExpiry} days left
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="text-gray-900">
          {formatDate(token.expiresAt)}
        </div>
        <div className="text-xs text-gray-500">
          {daysUntilExpiry} days left
        </div>
      </div>
    );
  };

  return (
    <tr className={`hover:bg-gray-50 ${isDeleting ? 'opacity-50' : ''}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="text-sm">
            <div className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
              {formatTokenForDisplay(token.token)}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {token.credits.toLocaleString()}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge()}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm text-gray-900">
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
        <div className="text-sm text-gray-900 max-w-xs truncate" title={token.description}>
          {token.description || 'No description'}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          {/* View Details Button */}
          <button
            onClick={() => onViewDetails(token)}
            disabled={isDeleting}
            className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            title="View Details"
          >
            <EyeIcon className="h-5 w-5" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDeleteToken(token)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            title={isDeleting ? "Deleting..." : "Delete Token"}
          >
            {isDeleting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
            ) : (
              <TrashIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}