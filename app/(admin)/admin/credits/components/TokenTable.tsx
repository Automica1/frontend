import React, { useState } from 'react';
import TokenRow from './TokenRow';
import EmptyState from './EmptyState';
import { apiService } from '../../../lib/apiService';

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

interface TokenTableProps {
  tokens: Token[];
  onViewDetails: (token: Token) => void;
  onTokenDeleted: () => void; // New prop for handling token deletion
  formatTokenForDisplay: (token: string) => string;
  formatDate: (date: string) => string;
  getDaysUntilExpiry: (expiresAt: string) => number;
  isTokenExpired: (expiresAt: string) => boolean;
  hasFilters: boolean;
}

export default function TokenTable({
  tokens,
  onViewDetails,
  onTokenDeleted,
  formatTokenForDisplay,
  formatDate,
  getDaysUntilExpiry,
  isTokenExpired,
  hasFilters
}: TokenTableProps) {
  const [deletingTokens, setDeletingTokens] = useState<Set<string>>(new Set());

  const handleDeleteToken = async (token: Token) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete this token?\n\nToken: ${formatTokenForDisplay(token.token)}\nCredits: ${token.credits}\nDescription: ${token.description}\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      // Add token to deleting set
      setDeletingTokens(prev => new Set([...prev, token.id]));

      // Delete token via API
      await apiService.deleteToken(token.id);

      // Remove from deleting set and trigger refresh
      setDeletingTokens(prev => {
        const newSet = new Set(prev);
        newSet.delete(token.id);
        return newSet;
      });

      // Notify parent component to refresh the token list
      onTokenDeleted();

    } catch (error) {
      // Remove from deleting set on error
      setDeletingTokens(prev => {
        const newSet = new Set(prev);
        newSet.delete(token.id);
        return newSet;
      });

      // Show error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete token';
      alert(`Error deleting token: ${errorMessage}`);
      console.error('Error deleting token:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tokens.map((token) => (
              <TokenRow
                key={token.id}
                token={token}
                onViewDetails={onViewDetails}
                onDeleteToken={handleDeleteToken}
                isDeleting={deletingTokens.has(token.id)}
                formatTokenForDisplay={formatTokenForDisplay}
                formatDate={formatDate}
                getDaysUntilExpiry={getDaysUntilExpiry}
                isTokenExpired={isTokenExpired}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      {tokens.length === 0 && (
        <EmptyState hasFilters={hasFilters} />
      )}
    </div>
  );
}