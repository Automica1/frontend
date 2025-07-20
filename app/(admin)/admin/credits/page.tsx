'use client'
import React, { useState, useEffect, useMemo } from 'react';
import ActionsBar from './components/ActionBar';
import StatsGrid from './components/StatsGrid';
import TokenTable from './components/TokenTable';
import GenerateTokenModal from './components/GenerateTokenModel';
import TokenDetailsModal from './components/TokenDetailsModal';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorAlert from './components/ErrorAlert';
import { apiService, type TokenInfo } from '../../lib/apiService';

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

interface TokenStats {
  total: number;
  used: number;
  unused: number;
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
}

export default function TokenManagementPage() {
  // State management
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'used' | 'unused' | 'my-tokens'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'credits' | 'expiresAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  // Utility functions
  const formatTokenForDisplay = (token: string): string => {
    return apiService.formatTokenForDisplay(token);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiresAt: string): number => {
    return apiService.getDaysUntilExpiry(expiresAt);
  };

  const isTokenExpired = (expiresAt: string): boolean => {
    return apiService.isTokenExpired(expiresAt);
  };

  // Convert API TokenInfo to local Token interface
  const convertTokenInfo = (tokenInfo: TokenInfo): Token => ({
    id: tokenInfo.id,
    token: tokenInfo.token,
    credits: tokenInfo.credits,
    createdBy: tokenInfo.createdBy,
    createdAt: tokenInfo.createdAt,
    expiresAt: tokenInfo.expiresAt,
    isUsed: tokenInfo.isUsed,
    usedBy: tokenInfo.usedBy,
    usedAt: tokenInfo.usedAt,
    description: tokenInfo.description
  });

  // Load tokens from API
  const loadTokens = async () => {
    try {
      setLoading(true);
      setError(null);
    

      // Load all tokens (admin only)
      const response = await apiService.getAllTokens();
      const convertedTokens = response.tokens.map(convertTokenInfo);
      setTokens(convertedTokens);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tokens. Please try again.';
      setError(errorMessage);
      console.error('Error loading tokens:', err);
      
      // If authentication error, clear tokens
      if (errorMessage.includes('Authentication') || errorMessage.includes('log in')) {
        setTokens([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load only user's tokens
  const loadMyTokens = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getMyTokens();
      const convertedTokens = response.tokens.map(convertTokenInfo);
      setTokens(convertedTokens);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load your tokens. Please try again.';
      setError(errorMessage);
      console.error('Error loading my tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate new token
  const handleGenerateToken = async (credits: number, description: string) => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await apiService.generateToken(credits, description);
      
      // Create new token object from response
      const newToken: Token = {
        id: `token-${Date.now()}`, // Temporary ID until we reload
        token: response.token,
        credits: response.credits,
        createdBy: 'current-user', // Will be updated on reload
        createdAt: new Date().toISOString(),
        expiresAt: response.expiresAt,
        isUsed: false,
        description: response.description
      };
      
      // Add to current list and reload to get accurate data
      setTokens(prev => [newToken, ...prev]);
      setShowGenerateModal(false);
      
      // Reload tokens to get accurate server data
      setTimeout(loadTokens, 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate token. Please try again.';
      setError(errorMessage);
      console.error('Error generating token:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle token deletion
  const handleTokenDeleted = () => {
    // Reload tokens after successful deletion
    if (filterStatus === 'my-tokens') {
      loadMyTokens();
    } else {
      loadTokens();
    }
  };

  // Export tokens
  const handleExport = () => {
    try {
      const csvContent = [
        'Token,Credits,Status,Created By,Created,Expires,Used By,Used At,Description',
        ...filteredAndSortedTokens.map(token => {
          const status = token.isUsed ? 'Used' : isTokenExpired(token.expiresAt) ? 'Expired' : 'Unused';
          return `"${token.token}",${token.credits},"${status}","${token.createdBy}","${formatDate(token.createdAt)}","${formatDate(token.expiresAt)}","${token.usedBy || ''}","${token.usedAt ? formatDate(token.usedAt) : ''}","${token.description}"`;
        })
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tokens-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export tokens. Please try again.');
      console.error('Error exporting tokens:', err);
    }
  };

  // Token details modal handlers
  const handleViewDetails = (token: Token) => {
    setSelectedToken(token);
    setShowDetailsModal(true);
  };

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      // Success feedback is handled in the modal component
      console.log('Token copied:', apiService.formatTokenForDisplay(token));
    } catch (err) {
      console.error('Failed to copy token:', err);
    }
  };

  // Filter and sort tokens
  const filteredAndSortedTokens = useMemo(() => {
    let filtered = tokens.filter(token => {
      // Search filter
      const searchMatch = searchTerm === '' || 
        token.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.createdBy.toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      // Status filter
      if (filterStatus === 'used') {
        return token.isUsed;
      } else if (filterStatus === 'unused') {
        return !token.isUsed && !isTokenExpired(token.expiresAt);
      }

      return true; // 'all'
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'credits':
          aValue = a.credits;
          bValue = b.credits;
          break;
        case 'expiresAt':
          aValue = new Date(a.expiresAt).getTime();
          bValue = new Date(b.expiresAt).getTime();
          break;
        default:
          return 0;
      }

      const multiplier = sortOrder === 'asc' ? 1 : -1;
      return (aValue - bValue) * multiplier;
    });

    return filtered;
  }, [tokens, searchTerm, filterStatus, sortBy, sortOrder]);

  // Calculate statistics
  const stats: TokenStats = useMemo(() => {
    const used = tokens.filter(t => t.isUsed);
    const unused = tokens.filter(t => !t.isUsed && !isTokenExpired(t.expiresAt));
    
    return {
      total: tokens.length,
      used: used.length,
      unused: unused.length,
      totalCredits: tokens.reduce((sum, t) => sum + t.credits, 0),
      usedCredits: used.reduce((sum, t) => sum + t.credits, 0),
      availableCredits: unused.reduce((sum, t) => sum + t.credits, 0)
    };
  }, [tokens]);

  // Refresh authentication and reload
  const handleAuthRefresh = async () => {
    try {
      apiService.refreshAuth();
      await loadTokens();
    } catch (err) {
      console.error('Auth refresh failed:', err);
    }
  };

  // Load tokens on component mount
  useEffect(() => {
    loadTokens();
  }, []);

  // Check if any filters are active
  const hasFilters = searchTerm !== '' || filterStatus !== 'all';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Token Management</h1>
              <p className="mt-2 text-gray-600">
                Manage and monitor your API tokens
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={loadTokens}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh All'}
              </button>
              <button
                onClick={loadMyTokens}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                disabled={loading}
              >
                My Tokens
              </button>
            </div>
          </div>
          
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <ErrorAlert
              message={error}
              onDismiss={() => setError(null)}
              onRetry={error.includes('Authentication') ? handleAuthRefresh : loadTokens}
              retryText={error.includes('Authentication') ? "Login Again" : "Reload Tokens"}
            />
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <LoadingSpinner message="Loading tokens..." fullPage />
        ) : (
          <>
            {/* Statistics Grid */}
            <StatsGrid stats={stats} />

            {/* Actions Bar */}
            <ActionsBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              onExport={handleExport}
              onGenerateToken={() => setShowGenerateModal(true)}
            />

            {/* Token Table */}
            <TokenTable
              tokens={filteredAndSortedTokens}
              onViewDetails={handleViewDetails}
              onTokenDeleted={handleTokenDeleted}
              formatTokenForDisplay={formatTokenForDisplay}
              formatDate={formatDate}
              getDaysUntilExpiry={getDaysUntilExpiry}
              isTokenExpired={isTokenExpired}
              hasFilters={hasFilters}
            />

            {/* Generate Token Modal */}
            <GenerateTokenModal
              isOpen={showGenerateModal}
              onClose={() => setShowGenerateModal(false)}
              onGenerate={handleGenerateToken}
              isGenerating={isGenerating}
            />

            {/* Token Details Modal */}
            <TokenDetailsModal
              isOpen={showDetailsModal}
              onClose={() => setShowDetailsModal(false)}
              token={selectedToken}
              onCopyToken={handleCopyToken}
            />
          </>
        )}
      </div>
    </div>
  );
}