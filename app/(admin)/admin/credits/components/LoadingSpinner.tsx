'use client'
import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export default function LoadingSpinner({ 
  message = "Loading...", 
  size = 'md',
  fullPage = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const containerClasses = fullPage
    ? "flex items-center justify-center h-full min-h-[400px]"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-3">
        <RefreshCw className={`${sizeClasses[size]} animate-spin text-purple-300`} />
        <span className={`${textSizeClasses[size]} text-gray-300 font-medium`}>
          {message}
        </span>
      </div>
    </div>
  );
}

// Alternative inline loading spinner for buttons
export function InlineLoadingSpinner({ 
  size = 'sm' 
}: { 
  size?: 'sm' | 'md' 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  return (
    <RefreshCw className={`${sizeClasses[size]} animate-spin`} />
  );
}

// Loading spinner for table rows
export function TableLoadingSpinner({ 
  colspan = 1,
  message = "Loading data..." 
}: { 
  colspan?: number;
  message?: string;
}) {
  return (
    <tr>
      <td colSpan={colspan} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-300" />
          <span className="text-sm text-gray-400">{message}</span>
        </div>
      </td>
    </tr>
  );
}

// Loading skeleton for cards
export function CardLoadingSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl animate-pulse backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-white/10"></div>
          <div className="h-6 w-16 rounded bg-white/10"></div>
        </div>
        <div className="w-8 h-8 rounded bg-white/10"></div>
      </div>
    </div>
  );
}

// Loading skeleton for table rows
export function TableRowSkeleton({ 
  columns = 7 
}: { 
  columns?: number 
}) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 w-full rounded bg-white/10"></div>
        </td>
      ))}
    </tr>
  );
}
