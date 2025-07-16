// src/hooks/useCredits.ts
import { useEffect, useCallback } from 'react';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { apiService } from '../lib/apiService';
import { 
  useCreditsStore, 
  useCredits as useCreditsValue,
  useSetCredits,
  useSetCreditsLoading,
  useSetCreditsError,
  useUpdateCredits
} from '../stores/creditsStore';

interface UseCreditsReturn {
  credits: number | null;
  loading: boolean;
  error: string | null;
  refreshCredits: () => Promise<void>;
  updateCredits: (newCredits: number) => void;
}

export const useCredits = (): UseCreditsReturn => {
  const { isAuthenticated, isLoading: authLoading } = useKindeBrowserClient();
  
  // Get values from Zustand store
  const credits = useCreditsValue();
  const { loading, error } = useCreditsStore();
  
  // Get individual actions
  const setCredits = useSetCredits();
  const setLoading = useSetCreditsLoading();
  const setError = useSetCreditsError();
  const updateCredits = useUpdateCredits();

  const fetchCredits = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const creditsData = await apiService.getCreditsBalance();
      setCredits(creditsData.credits, creditsData.userId);
    } catch (err) {
      console.error('Failed to fetch credits:', err);
      setError('Failed to load credits');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, setCredits, setLoading, setError]);

  const refreshCredits = useCallback(async () => {
    await fetchCredits();
  }, [fetchCredits]);

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