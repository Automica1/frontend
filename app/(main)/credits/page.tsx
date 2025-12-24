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
    <div className="min-h-screen pt-32 bg-[#0b0b0d] relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-block mb-6">
            <span className="text-sm font-medium text-purple-400 tracking-widest uppercase">
              Credit System
            </span>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-3"></div>
          </div>
          <h1 className="text-4xl font-light text-white mb-3 tracking-tight">Add <span className="text-purple-400">Credits</span></h1>
          <p className="text-gray-400 font-light text-lg">Redeem your token to top up your balance</p>
        </div>

        {/* Credits Balance Card */}
        <div className="relative overflow-hidden bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6 shadow-2xl group hover:border-purple-500/20 transition-all duration-300">
          {/* Gradient glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative flex items-center justify-between z-10">
            <div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Current Balance</p>
              <p className="text-3xl font-light text-white tracking-tight">
                {typeof credits === 'number' ? credits.toLocaleString() : '...'} <span className="text-sm text-gray-500 font-normal">credits</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Token Input Card */}
        <div className="relative bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Token Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300 ml-1">
                Redemption Token
              </label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Paste your 32-character token here..."
                  value={token}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={isSubmitting}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:border-purple-500/50 transition-all duration-300 font-light tracking-wide text-sm"
                  maxLength={32}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0a2 2 0 00-2 2m2-2a2 2 0 012 2m0 0V9a2 2 0 012-2m-2 2a2 2 0 002 2"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !token.trim()}
              className={`group relative w-full py-4 px-6 rounded-xl font-medium text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center ${isSubmitting || !token.trim()
                  ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-purple-800 text-white hover:from-purple-600 hover:to-purple-900 shadow-purple-500/20'
                }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-white/90">Processing...</span>
                </>
              ) : (
                <>
                  <span className="mr-2">Redeem Token</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Status Message */}
          {status !== 'idle' && (
            <div className={`mt-6 p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 overflow-hidden ${status === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : status === 'error'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
              }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5 mr-3">
                  {status === 'success' ? (
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  ) : status === 'error' ? (
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  ) : (
                    <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  )}
                </div>
                <div className="text-sm font-light leading-relaxed opacity-90">{message}</div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 font-light">
            Need more credits?
            <a href="/contact" className="text-purple-400 hover:text-purple-300 ml-1 hover:underline transition-colors">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}