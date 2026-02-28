// src/hooks/useCredits.tsx
import { useEffect, useCallback } from 'react';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { apiService } from '../lib/apiService';
import { subscriptionApi } from '../lib/subscriptionApi';
import {
  useCreditsStore,
  useCredits as useCreditsValue,
  useSetCredits,
  useSetCreditsLoading,
  useSetCreditsError,
  useUpdateCredits,
  useSubscription as useSubscriptionValue,
  useSetSubscription
} from '../stores/creditsStore';

interface UseCreditsReturn {
  credits: number | null;
  subscription: any | null;
  loading: boolean;
  error: string | null;
  refreshCredits: () => Promise<void>;
  updateCredits: (newCredits: number) => void;
}

export const useCredits = (): UseCreditsReturn => {
  const { isAuthenticated, isLoading: authLoading } = useKindeBrowserClient();

  // Get values from Zustand store
  const credits = useCreditsValue();
  const subscription = useSubscriptionValue();
  const { loading, error } = useCreditsStore();

  // Get individual actions
  const setCredits = useSetCredits();
  const setSubscription = useSetSubscription();
  const setLoading = useSetCreditsLoading();
  const setError = useSetCreditsError();
  const updateCredits = useUpdateCredits();

  const fetchCredits = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;

    setLoading(true);
    setError(null);

    try {
      const [creditsData, subData] = await Promise.all([
        apiService.getCreditsBalance(),
        subscriptionApi.getStatus().catch(() => null)
      ]);

      setCredits(creditsData.credits, creditsData.userId);
      setSubscription(subData);
    } catch (err) {
      console.error('Failed to fetch credits or subscription:', err);
      setError('Failed to load credits');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, setCredits, setSubscription, setLoading, setError]);

  const refreshCredits = useCallback(async () => {
    await fetchCredits();
  }, [fetchCredits]);

  // Fetch credits when user is authenticated
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    subscription,
    loading,
    error,
    refreshCredits,
    updateCredits,
  };
};