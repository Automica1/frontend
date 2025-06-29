// src/hooks/useCredits.ts
import { useState, useEffect, useCallback } from 'react';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { apiService } from '../lib/apiService';

interface CreditsData {
  message: string;
  userId: string;
  credits: number;
}

interface UseCreditsReturn {
  credits: number | null;
  loading: boolean;
  error: string | null;
  refreshCredits: () => Promise<void>;
  updateCredits: (newCredits: number) => void;
}

export const useCredits = (): UseCreditsReturn => {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated, isLoading: authLoading } = useKindeBrowserClient();

  const fetchCredits = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const creditsData: CreditsData = await apiService.getCreditsBalance();
      setCredits(creditsData.credits);
    } catch (err) {
      console.error('Failed to fetch credits:', err);
      setError('Failed to load credits');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const refreshCredits = useCallback(async () => {
    await fetchCredits();
  }, [fetchCredits]);

  const updateCredits = useCallback((newCredits: number) => {
    setCredits(newCredits);
  }, []);

  // Fetch credits when user is authenticated
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    loading,
    error,
    refreshCredits,
    updateCredits,
  };
};