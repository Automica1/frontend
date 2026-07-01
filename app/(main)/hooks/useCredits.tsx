// src/hooks/useCredits.tsx
import { useEffect, useCallback } from 'react';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { apiService } from '../lib/apiService';
import { subscriptionApi } from '../lib/subscriptionApi';
import { loadGuestPassKey } from '../lib/guestPassStorage';
import { runSharedCreditsFetch } from '../lib/creditsFetch';
import {
  useCreditsStore,
  useCredits as useCreditsValue,
  useSetCredits,
  useSetCreditsLoading,
  useSetCreditsError,
  useUpdateCredits,
  useSubscription as useSubscriptionValue,
  useSetSubscription,
  useResetCredits
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

  const credits = useCreditsValue();
  const subscription = useSubscriptionValue();
  const { loading, error } = useCreditsStore();

  const setCredits = useSetCredits();
  const setSubscription = useSetSubscription();
  const setLoading = useSetCreditsLoading();
  const setError = useSetCreditsError();
  const updateCredits = useUpdateCredits();
  const resetCredits = useResetCredits();

  const fetchCredits = useCallback(async () => {
    if (authLoading) return;

    return runSharedCreditsFetch(async () => {
      if (!isAuthenticated) {
        const guestKey = loadGuestPassKey();
        if (!guestKey) {
          resetCredits();
          return;
        }

        setLoading(true);
        setError(null);
        try {
          const balance = await apiService.getGuestPassBalance();
          setCredits(balance.remainingCredits, 'guest_pass');
          setSubscription(null);
        } catch (err) {
          console.error('Failed to fetch guest pass balance:', err);
          setError('Failed to load guest pass credits');
          resetCredits();
        } finally {
          setLoading(false);
        }
        return;
      }

      const isInitialLoad = useCreditsStore.getState().credits === null;
      if (isInitialLoad) {
        setLoading(true);
      }
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
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    });
  }, [isAuthenticated, authLoading, setCredits, setSubscription, setLoading, setError, resetCredits]);

  const refreshCredits = useCallback(async () => {
    await fetchCredits();
  }, [fetchCredits]);

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
