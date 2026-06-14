"use client";

import React, { useState } from 'react';
import TokenRow from './TokenRow';
import EmptyState from './EmptyState';
import { apiService } from '../../../lib/apiService';
import { useAdminFeedback } from '../../../components/AdminFeedback';

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
  onTokenDeleted: () => void;
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
  const { confirm, toast } = useAdminFeedback();

  const handleDeleteToken = async (token: Token) => {
    const confirmed = await confirm({
      title: 'Delete token',
      message: `Delete ${formatTokenForDisplay(token.token)}? This action cannot be undone.`,
      confirmLabel: 'Delete token',
    });

    if (!confirmed) return;

    try {
      setDeletingTokens((prev) => new Set(prev).add(token.id));
      await apiService.deleteToken(token.id);
      toast({
        tone: 'success',
        title: 'Token deleted',
        message: `${formatTokenForDisplay(token.token)} was removed.`,
      });
      onTokenDeleted();
    } catch (error) {
      toast({
        tone: 'error',
        title: 'Delete failed',
        message: error instanceof Error ? error.message : 'Failed to delete token',
      });
    } finally {
      setDeletingTokens((prev) => {
        const next = new Set(prev);
        next.delete(token.id);
        return next;
      });
    }
  };

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Token</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Credits</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Created</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Expires</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Description</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
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

      {tokens.length === 0 && <EmptyState hasFilters={hasFilters} />}
    </div>
  );
}
