// ErrorAlert.tsx
'use client'
import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  variant?: 'error' | 'warning' | 'info';
  retryText?: string;
  isRetrying?: boolean;
}

export default function ErrorAlert({
  title,
  message,
  onDismiss,
  onRetry,
  variant = 'error',
  retryText = 'Try Again',
  isRetrying = false
}: ErrorAlertProps) {
  const variantStyles = {
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      title: 'text-red-800',
      message: 'text-red-700',
      button: 'text-red-600 hover:text-red-800'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      button: 'text-yellow-600 hover:text-yellow-800'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-800',
      message: 'text-blue-700',
      button: 'text-blue-600 hover:text-blue-800'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`border rounded-lg p-4 ${styles.container}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className={`w-5 h-5 ${styles.icon}`} />
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title} mb-1`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${styles.message}`}>
            {message}
          </div>
          
          {onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className={`inline-flex items-center gap-2 text-sm font-medium ${styles.button} hover:underline disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    {retryText}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600`}
              >
                <span className="sr-only">Dismiss</span>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact inline error for forms
export function InlineError({ 
  message,
  className = "" 
}: { 
  message: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 text-red-600 text-sm ${className}`}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// Error boundary fallback component
export function ErrorFallback({ 
  error,
  onRetry
}: { 
  error: Error;
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

// Toast-style error notification
export function ErrorToast({ 
  message,
  isVisible,
  onClose
}: { 
  message: string;
  isVisible: boolean;
  onClose: () => void;
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="ml-3 flex-1">
            <p className="text-sm text-red-800">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}