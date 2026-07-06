'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiService, type BetaKeyResolveResponse } from '../lib/apiService';

interface UseBetaKeyResolveOptions {
  serviceName: string;
  betaKey: string;
  enabled: boolean;
}

export function useBetaKeyResolve({ serviceName, betaKey, enabled }: UseBetaKeyResolveOptions) {
  const [result, setResult] = useState<BetaKeyResolveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const resolve = useCallback(async () => {
    const trimmed = betaKey.trim();
    if (!enabled || !trimmed || !serviceName) {
      setResult(null);
      setError(null);
      setLoading(false);
      return null;
    }

    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const next = await apiService.resolveBetaKey(serviceName, trimmed);
      if (id !== requestId.current) return null;
      setResult(next);
      if (!next.valid) {
        setError('This beta key is invalid, expired, or not assigned to your account.');
      }
      return next;
    } catch (err) {
      if (id !== requestId.current) return null;
      const message = err instanceof Error ? err.message : 'Could not validate beta key';
      setError(message);
      setResult(null);
      return null;
    } finally {
      if (id === requestId.current) {
        setLoading(false);
      }
    }
  }, [betaKey, enabled, serviceName]);

  useEffect(() => {
    if (!enabled || !betaKey.trim()) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }

    const timer = window.setTimeout(() => {
      void resolve();
    }, 400);

    return () => window.clearTimeout(timer);
  }, [betaKey, enabled, resolve]);

  return { result, loading, error, resolve };
}
