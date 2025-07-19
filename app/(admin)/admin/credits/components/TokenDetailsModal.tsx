'use client'
import React from 'react';
import { CheckCircle, XCircle, Clock, CreditCard, Copy, Check } from 'lucide-react';

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

interface TokenDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: Token | null;
  onCopyToken?: (token: string) => void;
}

export default function TokenDetailsModal({
  isOpen,
  onClose,
  token,
  onCopyToken
}: TokenDetailsModalProps) {
  const [copied, setCopied] = React.useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilExpiry = (expiresAt: string): number => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isTokenExpired = (expiresAt: string): boolean => {
    return new Date(expiresAt) < new Date();
  };

  const handleCopyToken = async () => {
    if (!token) return;
    
    try {
      await navigator.clipboard.writeText(token.token);
      setCopied(true);
      onCopyToken?.(token.token);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy token:', error);
    }
  };

  if (!isOpen || !token) return null;

  const getStatusInfo = () => {
    if (token.isUsed) {
      return {
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
        text: 'Used',
        className: 'bg-green-100 text-green-800'
      };
    }
    
    if (isTokenExpired(token.expiresAt)) {
      return {
        icon: <XCircle className="w-3 h-3 mr-1" />,
        text: 'Expired',
        className: 'bg-red-100 text-red-800'
      };
    }
    
    return {
      icon: <Clock className="w-3 h-3 mr-1" />,
      text: 'Unused',
      className: 'bg-yellow-100 text-yellow-800'
    };
  };

  const statusInfo = getStatusInfo();
  const daysRemaining = getDaysUntilExpiry(token.expiresAt);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
        
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">Token Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content - No scroll, compact layout */}
        <div className="flex-1 px-6 py-4 min-h-0">
          <div className="space-y-4">
            {/* Token and Credits Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Token</label>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1.5 rounded-md flex-1 break-all">
                    {token.token}
                  </code>
                  <button
                    onClick={handleCopyToken}
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 rounded-md hover:bg-gray-200 flex-shrink-0"
                    title="Copy token"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Credits</label>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span className="text-xl font-bold text-blue-600">{token.credits.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {/* Status and Created By Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                  {statusInfo.icon}
                  {statusInfo.text}
                </span>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Created By</label>
                <div className="text-sm text-gray-900 font-medium">{token.createdBy}</div>
              </div>
            </div>
            
            {/* Dates Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Created At</label>
                <div className="text-sm text-gray-900">{formatDate(token.createdAt)}</div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Expires At</label>
                <div className="flex flex-col">
                  <div className="text-sm text-gray-900">{formatDate(token.expiresAt)}</div>
                  <div className={`text-xs mt-0.5 font-medium ${
                    daysRemaining < 7 ? 'text-red-600' : 
                    daysRemaining < 30 ? 'text-orange-600' : 
                    'text-gray-500'
                  }`}>
                    {daysRemaining > 0 
                      ? `${daysRemaining} days remaining`
                      : `Expired ${Math.abs(daysRemaining)} days ago`
                    }
                  </div>
                </div>
              </div>
            </div>
            
            {/* Usage Information (if used) */}
            {token.isUsed && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="text-xs font-medium text-green-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Usage Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-green-700 mb-0.5">Used By</label>
                    <div className="text-sm text-green-900 font-medium">{token.usedBy || 'N/A'}</div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-green-700 mb-0.5">Used At</label>
                    <div className="text-sm text-green-900">
                      {token.usedAt ? formatDate(token.usedAt) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                {token.description || (
                  <span className="text-gray-500 italic">No description provided</span>
                )}
              </div>
            </div>
            
            {/* Token ID */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Token ID</label>
              <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded break-all">
                {token.id}
              </code>
            </div>
          </div>
        </div>
        
        {/* Sticky Actions Footer */}
        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 rounded-b-xl flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={handleCopyToken}
              className="flex-1 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 font-medium border border-blue-200"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Token
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}