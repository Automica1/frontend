// Updated useApi hook
// src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { ApiResponse } from '../types/api';

export interface UseApiState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  errorData: any | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
  retry: () => Promise<void>;
}

export function useApi<T = ApiResponse>(
  apiMethod: (...args: any[]) => Promise<T>
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorData, setErrorData] = useState<any | null>(null);
  const [lastArgs, setLastArgs] = useState<any[]>([]);

  const execute = useCallback(async (...args: any[]) => {
    setLoading(true);
    setError(null);
    setErrorData(null);
    setLastArgs(args);
    
    try {
      console.log('Executing API call with args:', args);
      const result = await apiMethod(...args);
      setData(result);
      console.log('API call successful:', result);
    } catch (err) {
      console.error('API call failed:', err);
      
      let errorMessage = 'An unexpected error occurred';
      let backendErrorData = null;
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Extract backend error data if available
        if ((err as any).errorData) {
          backendErrorData = (err as any).errorData;
        }
        
        // If we don't have backend error data, create our own based on error patterns
        if (!backendErrorData) {
          if (err.message.includes('500')) {
            errorMessage = 'Server error (500) - The backend service encountered an internal error. Please try again or contact support.';
            backendErrorData = {
              type: 'SERVER_ERROR',
              status: 500,
              suggestion: 'Check server logs and ensure the backend service is running properly'
            };
          } else if (err.message.includes('401')) {
            errorMessage = 'Authentication failed - Please log in again';
            backendErrorData = {
              type: 'AUTH_ERROR',
              status: 401,
              suggestion: 'Re-authenticate or check your credentials'
            };
          } else if (err.message.includes('404')) {
            errorMessage = 'API endpoint not found - The requested service may not be available';
            backendErrorData = {
              type: 'NOT_FOUND',
              status: 404,
              suggestion: 'Check the API endpoint URL and ensure the service is deployed'
            };
          } else if (err.message.includes('Network error')) {
            errorMessage = 'Network connection failed - Unable to reach the server';
            backendErrorData = {
              type: 'NETWORK_ERROR',
              suggestion: 'Check your internet connection and server availability'
            };
          } else if (err.message.includes('Invalid base64')) {
            errorMessage = 'Invalid image format - Please upload a valid image file';
            backendErrorData = {
              type: 'VALIDATION_ERROR',
              suggestion: 'Ensure the uploaded file is a valid image (JPG, PNG, GIF)'
            };
          }
        }
      }
      
      setError(errorMessage);
      setErrorData(backendErrorData);
    } finally {
      setLoading(false);
    }
  }, [apiMethod]);

  const retry = useCallback(async () => {
    if (lastArgs.length > 0) {
      await execute(...lastArgs);
    }
  }, [execute, lastArgs]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setErrorData(null);
    setLoading(false);
    setLastArgs([]);
  }, []);

  return { 
    data, 
    loading, 
    error, 
    errorData, 
    execute, 
    reset, 
    retry 
  };
}