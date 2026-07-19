'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiService, type GPUPoolStatus } from '../lib/apiService';
import type { GpuStartMode } from './gpuCeremonyState';
import { getExtraResourceCopy } from '../lib/extraResourceCopy';

const POLL_MS = 4000;

export function deriveGpuCeremonyMode(
  status: GPUPoolStatus,
  opts?: { poolWasProvisioning?: boolean; orphanBootReconnect?: boolean }
): GpuStartMode {
  if (status.state === 'ready') return 'warm_ready';
  if (status.state === 'draining' && status.drainReason === 'user_grace') return 'warm_ready';
  if (status.state === 'draining' && status.drainReason === 'failed_bootstrap') return 'warm_join';
  if (status.state === 'provisioning') {
    if (opts?.orphanBootReconnect) return 'warm_join';
    if (opts?.poolWasProvisioning || status.refCount > 1) return 'warm_join';
  }
  return 'cold';
}

export function isOrphanBootReconnectStatus(status: GPUPoolStatus | null, userActive: boolean): boolean {
  return Boolean(
    status &&
      !userActive &&
      status.state === 'provisioning' &&
      (status.refCount ?? 0) === 0
  );
}

export function canStartGpuSession(input: {
  available: boolean;
  loading: boolean;
  userActive: boolean;
  isDraining: boolean;
  isUserGraceDraining: boolean;
  hasEnoughCreditsToStart: boolean;
  state?: GPUPoolStatus['state'];
  refCount?: number;
  hasStatus: boolean;
  drainReason?: GPUPoolStatus['drainReason'] | null;
}): boolean {
  const canJoinPoolBoot =
    input.state === 'provisioning' && (input.refCount ?? 0) > 0 && !input.userActive;
  const orphanBootReconnect =
    input.state === 'provisioning' && (input.refCount ?? 0) === 0 && !input.userActive;
  const canResumeFailedBootstrap =
    input.state === 'draining' && input.drainReason === 'failed_bootstrap' && !input.userActive;

  return (
    input.available &&
    !input.loading &&
    !input.userActive &&
    (!input.isDraining || input.isUserGraceDraining || canResumeFailedBootstrap) &&
    input.hasEnoughCreditsToStart &&
    (input.state === 'idle' ||
      input.state === 'failed' ||
      input.state === 'ready' ||
      input.isUserGraceDraining ||
      canResumeFailedBootstrap ||
      orphanBootReconnect ||
      canJoinPoolBoot ||
      !input.hasStatus)
  );
}

interface UseGpuPoolOptions {
  serviceTag: string;
  available: boolean;
  creditBalance?: number | null;
  refreshCredits?: () => Promise<void>;
}

export function useGpuPool({ serviceTag, available, creditBalance = null, refreshCredits }: UseGpuPoolOptions) {
  const [status, setStatus] = useState<GPUPoolStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Locked once per session: from start() click or page-load reattach (resume). */
  const [ceremonyMode, setCeremonyMode] = useState<GpuStartMode | null>(null);
  const userInitiatedStartRef = useRef(false);

  const minCreditsToStart = status?.minCreditsToStart ?? 30;
  const startupCredits = status?.startupCredits ?? 20;
  const creditsPerMinute = status?.creditsPerMinute ?? 2;
  const creditsChargedSession = status?.creditsChargedSession ?? 0;
  const creditsStartupChargedSession = status?.creditsStartupChargedSession ?? 0;
  const creditsGpuTimeSession = status?.creditsGpuTimeSession ?? 0;
  const billingActive = Boolean(status?.billingActive);
  const nextMeterChargeAt = status?.nextMeterChargeAt ?? null;
  const sessionEndReason = status?.sessionEndReason ?? null;
  const drainReason = status?.drainReason ?? null;
  const destroyAt = status?.destroyAt ?? null;
  const gracePeriodSec = status?.gracePeriodSec ?? 300;

  const applyStatus = useCallback((next: GPUPoolStatus) => {
    setStatus(next);
    setError(null);
    if (next.userActive) {
      if (userInitiatedStartRef.current) {
        return;
      }
      setCeremonyMode((prev) => prev ?? 'resume');
    } else {
      userInitiatedStartRef.current = false;
      setCeremonyMode(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!serviceTag) return null;
    try {
      const next = await apiService.getGpuPoolStatus(serviceTag);
      applyStatus(next);
      void refreshCredits?.();
      return next;
    } catch (err) {
      const message = err instanceof Error ? err.message : getExtraResourceCopy().failedLoadStatus;
      setError(message);
      return null;
    }
  }, [serviceTag, refreshCredits, applyStatus]);

  const start = useCallback(async () => {
    if (!serviceTag) return null;
    const poolWasProvisioning =
      status?.state === 'provisioning' && (status?.refCount ?? 0) > 0 && !status?.userActive;
    const orphanBootReconnect = isOrphanBootReconnectStatus(status, Boolean(status?.userActive));
  const isGraceReuse =
      status?.state === 'draining' &&
      (status?.drainReason === 'user_grace' || status?.drainReason === 'failed_bootstrap');
    const optimisticMode: GpuStartMode | null =
      status?.state === 'ready' || (status?.state === 'draining' && status?.drainReason === 'user_grace')
        ? 'warm_ready'
        : status?.state === 'draining' && status?.drainReason === 'failed_bootstrap'
          ? 'warm_join'
        : orphanBootReconnect || poolWasProvisioning || (status?.state === 'provisioning' && (status?.refCount ?? 0) > 0)
          ? 'warm_join'
          : 'cold';

    setLoading(true);
    setError(null);
    userInitiatedStartRef.current = true;
    setCeremonyMode(optimisticMode);
    try {
      const next = await apiService.startGpuPool(serviceTag);
      const mode = deriveGpuCeremonyMode(next, {
        poolWasProvisioning,
        orphanBootReconnect: isOrphanBootReconnectStatus(status, false),
      });
      setCeremonyMode(mode);
      setStatus(next);
      setError(null);
      void refreshCredits?.();
      return next;
    } catch (err) {
      userInitiatedStartRef.current = false;
      setCeremonyMode(null);
      const message = err instanceof Error ? err.message : getExtraResourceCopy().failedStart;
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [serviceTag, refreshCredits, status]);

  const stop = useCallback(async () => {
    if (!serviceTag) return;
    setLoading(true);
    setError(null);
    try {
      const next = await apiService.stopGpuPool(serviceTag);
      userInitiatedStartRef.current = false;
      setCeremonyMode(null);
      setStatus(next);
      void refreshCredits?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : getExtraResourceCopy().failedStop;
      setError(message);
      console.error('gpu pool stop:', err);
    } finally {
      setLoading(false);
    }
  }, [serviceTag, refreshCredits]);

  useEffect(() => {
    if (!available || !serviceTag) {
      setStatus(null);
      setError(null);
      userInitiatedStartRef.current = false;
      setCeremonyMode(null);
      return;
    }
    void refresh();
  }, [available, serviceTag, refresh]);

  const shouldPoll = available && Boolean(serviceTag);

  useEffect(() => {
    if (!shouldPoll) return;
    const id = window.setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [shouldPoll, refresh]);

  const isReady = status?.state === 'ready';
  const isStarting = status?.state === 'provisioning';
  const isFailed = status?.state === 'failed';
  const userActive = Boolean(status?.userActive);
  const isDraining = status?.state === 'draining';
  const isUserGraceDraining = isDraining && drainReason === 'user_grace';
  const reconnectEligible = Boolean(status?.reconnectEligible);
  const reconnectUntil = status?.reconnectUntil ?? null;
  const minRequiredCredits = reconnectEligible
    ? (status?.creditsPerMinute ?? creditsPerMinute)
    : minCreditsToStart;
  const hasEnoughCreditsToStart =
    creditBalance === null ||
    creditBalance === undefined ||
    creditBalance >= minRequiredCredits;

  const canStart = canStartGpuSession({
    available,
    loading,
    userActive,
    isDraining,
    isUserGraceDraining,
    hasEnoughCreditsToStart,
    state: status?.state,
    refCount: status?.refCount,
    hasStatus: Boolean(status),
    drainReason,
  });

  const canStop = available && !loading && userActive;

  return {
    status,
    loading,
    error,
    isReady,
    isStarting,
    isFailed,
    isDraining,
    userActive,
    canStart,
    canStop,
    ceremonyMode,
    minCreditsToStart,
    startupCredits,
    creditsPerMinute,
    creditsChargedSession,
    creditsStartupChargedSession,
    creditsGpuTimeSession,
    billingActive,
    nextMeterChargeAt,
    sessionEndReason,
    drainReason,
    destroyAt,
    gracePeriodSec,
    hasEnoughCreditsToStart,
    refresh,
    start,
    stop,
    reconnectEligible,
    reconnectUntil,
  };
}
