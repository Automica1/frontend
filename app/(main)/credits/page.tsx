'use client';

import React, { useState } from 'react';
import { apiService } from '../lib/apiService'; // Adjust path as needed
import { useCreditsStore } from '../stores/creditsStore'; // Adjust path as needed

export default function CreditsPage() {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creditsAdded, setCreditsAdded] = useState<number | null>(null);
  const [previousCredits, setPreviousCredits] = useState<number | null>(null);
  
  // Get credits from store to display current balance
  const { credits } = useCreditsStore();

  const handleSubmit = async () => {
    if (!token.trim()) {
      setStatus('error');
      setMessage('Please enter a token.');
      return;
    }

    setIsSubmitting(true);
    setStatus('loading');
    setMessage('Redeeming token...');
    
    // Store current credits before redemption
    setPreviousCredits(credits || 0);

    try {
      const result = await apiService.redeemToken(token);
      
      // Backend returns different structure - check for message presence instead of success field
      if (result.message && result.message.toLowerCase().includes('success')) {
        setStatus('success');
        setCreditsAdded(result.creditsAdded || 0); // Use 'creditsAdded' instead of 'credits'
        
        // Create a more detailed success message
        let successMessage = 'Token redeemed successfully!';
        if (result.creditsAdded) {
          successMessage += ` +${result.creditsAdded} credits added`;
        }
        if (result.remainingCredits) {
          successMessage += ` • New balance: ${result.remainingCredits} credits`;
        }
        
        setMessage(successMessage);
        
        // Clear the token input after successful redemption
        setToken('');
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          if (status === 'success') {
            setStatus('idle');
            setMessage('');
            setCreditsAdded(null);
            setPreviousCredits(null);
          }
        }, 5000);
      } else {
        setStatus('error');
        setMessage(`${result.message || 'Token redemption failed'}`);
      }
    } catch (error: any) {
      setStatus('error');
      
      // Handle different types of errors
      if (error.message.includes('Invalid token format')) {
        setMessage('Invalid token format. Please check your token and try again.');
      } else if (error.message.includes('Authentication failed')) {
        setMessage('Authentication failed. Please log in and try again.');
      } else if (error.message.includes('Network error')) {
        setMessage('Network error. Please check your connection and try again.');
      } else {
        // Use the error message from the API if available, otherwise use generic message
        const errorMessage = error.errorData?.message || error.message || 'Failed to redeem token. Please try again.';
        setMessage(`${errorMessage}`);
      }
      
      console.error('Token redemption failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
    // Clear previous messages when user starts typing
    if (status !== 'idle') {
      setStatus('idle');
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen pt-32 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-purple-500/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-purple-400/10 rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Add Credits</h1>
          <p className="text-gray-400">Redeem your token to add credits to your account</p>
        </div>

        {/* Credits Balance Card */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 mb-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Current Balance</p>
              <p className="text-2xl font-bold text-white">
                {typeof credits === 'number' ? `${credits} credits` : 'Loading...'}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Token Input Card */}
        <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
          <div className="space-y-6">
            {/* Token Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Redemption Token
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your token (e.g., 64ee48b483a3571a52578438d39cf4d1)"
                  value={token}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  maxLength={32}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0a2 2 0 00-2 2m2-2a2 2 0 012 2m0 0V9a2 2 0 012-2m-2 2a2 2 0 002 2"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !token.trim()}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                isSubmitting || !token.trim()
                  ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02]'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  Redeem Token
                </span>
              )}
            </button>
          </div>

          {/* Status Message */}
          {status !== 'idle' && (
            <div className={`mt-6 p-4 rounded-xl border backdrop-blur-sm ${
              status === 'success' 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : status === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}>
              <div className="flex items-center">
                {status === 'success' && (
                  <div className="flex-shrink-0 mr-3">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                )}
                {status === 'error' && (
                  <div className="flex-shrink-0 mr-3">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                  </div>
                )}
                {status === 'loading' && (
                  <div className="flex-shrink-0 mr-3">
                    <svg className="animate-spin w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                <div className="text-sm font-medium">{message}</div>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Enter a valid 32-character token to add credits to your account.
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Need more credits? 
            <a href="/contact" className="text-purple-400 hover:text-purple-300 ml-1 underline">
              contact us for assistance
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}