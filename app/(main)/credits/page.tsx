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
    setMessage('❌ Please enter a token.');
    return;
  }

  setIsSubmitting(true);
  setStatus('loading');
  setMessage('🔄 Redeeming token...');
  
  // Store current credits before redemption
  setPreviousCredits(credits || 0);

  try {
    const result = await apiService.redeemToken(token);
    
    // Backend returns different structure - check for message presence instead of success field
    if (result.message && result.message.toLowerCase().includes('success')) {
      setStatus('success');
      setCreditsAdded(result.credits || 0); // Backend uses 'credits' not 'creditsAdded'
      
      // Create a more detailed success message
      let successMessage = 'Token redeemed successfully!';
      if (result.credits) {
        successMessage += ` +${result.credits} credits added`;
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
      setMessage(`❌ ${result.message || 'Token redemption failed'}`);
    }
  } catch (error: any) {
    setStatus('error');
    
    // Handle different types of errors
    if (error.message.includes('Invalid token format')) {
      setMessage('❌ Invalid token format. Please check your token and try again.');
    } else if (error.message.includes('Authentication failed')) {
      setMessage('❌ Authentication failed. Please log in and try again.');
    } else if (error.message.includes('Network error')) {
      setMessage('❌ Network error. Please check your connection and try again.');
    } else {
      // Use the error message from the API if available, otherwise use generic message
      const errorMessage = error.errorData?.message || error.message || 'Failed to redeem token. Please try again.';
      setMessage(`❌ ${errorMessage}`);
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
    <div className="h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-2xl p-6 space-y-6 border">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Redeem Token</h2>
          {typeof credits === 'number' && (
            <p className="text-sm text-gray-600 mt-2">
              Current Balance: <span className="font-medium">{credits} credits</span>
            </p>
          )}
        </div>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter your token (e.g., 64ee48b483a3571a52578438d39cf4d1)"
            value={token}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            maxLength={32} // Based on the token format validation
          />

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !token.trim()}
            className={`w-full py-2 px-4 rounded-xl transition ${
              isSubmitting || !token.trim()
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redeeming...
              </span>
            ) : (
              'Submit'
            )}
          </button>
        </div>

        {status !== 'idle' && (
          <div className={`text-center p-4 rounded-xl ${
            status === 'success' 
              ? 'text-green-800 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-sm' 
              : status === 'error'
              ? 'text-red-800 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 shadow-sm'
              : 'text-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-center mb-2">
              {status === 'success' && (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
              {status === 'error' && (
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              )}
              {status === 'loading' && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <svg className="animate-spin w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            <div className="text-sm font-medium">
              {message}
            </div>
          </div>
        )}

        {/* Additional help text */}
        <div className="text-xs text-gray-500 text-center">
          <p>Enter a valid 32-character token to add credits to your account.</p>
        </div>
      </div>
    </div>
  );
}