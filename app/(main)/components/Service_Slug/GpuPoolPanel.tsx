'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Cpu, Play, Square } from 'lucide-react';
import type { GPUPoolStatus } from '../../lib/apiService';
import type { GpuCeremonyStep, GpuStartMode } from '../../hooks/useGpuStartCeremony';
import type { CeremonyStepView } from '../../hooks/gpuCeremonyState';
import { formatCeremonyElapsed } from '../../hooks/gpuCeremonyState';
import GpuCeremonyStepper from './GpuCeremonyStepper';
import { poolPanelDetailLine } from './gpuPoolPanelCopy';
import { getExtraResourceCopy } from '../../lib/extraResourceCopy';
import {
  activeSessionBillingLine,
  buildGpuPoolViewPresentation,
  deriveGpuPoolScenario,
  introCostLine,
} from './gpuPoolViewState';
import { destroyCountdownCopy, formatGpuCountdown } from './gpuPoolCountdownCopy';

interface GpuPoolPanelProps {
  status: GPUPoolStatus | null;
  loading: boolean;
  error: string | null;
  isReady: boolean;
  isStarting: boolean;
  isFailed: boolean;
  isDraining?: boolean;
  userActive: boolean;
  canStart: boolean;
  canStop: boolean;
  onStart: () => void;
  onStop: () => void;
  ceremonyStep?: GpuCeremonyStep;
  ceremonySteps?: CeremonyStepView[];
  ceremonySubline?: string;
  ceremonyTicker?: string | null;
  ceremonyElapsedMs?: number;
  ceremonyStartMode?: GpuStartMode;
  inCeremony?: boolean;
  canRunTests?: boolean;
  isAdmin?: boolean;
  compact?: boolean;
  minCreditsToStart?: number;
  startupCredits?: number;
  creditsPerMinute?: number;
  comparisonCost?: number;
  creditsChargedSession?: number;
  creditsStartupChargedSession?: number;
  creditsGpuTimeSession?: number;
  billingActive?: boolean;
  creditBalance?: number | null;
  hasEnoughCreditsToStart?: boolean;
  nextMeterChargeAt?: string | null;
  sessionEndReason?: string | null;
  drainReason?: 'user_grace' | 'admin_grace' | 'failed_bootstrap' | null;
  destroyAt?: string | null;
  gracePeriodSec?: number;
  reconnectEligible?: boolean;
  reconnectUntil?: string | null;
  useStockCopy?: boolean;
}

export default function GpuPoolPanel({
  status,
  loading,
  error,
  isReady,
  isFailed,
  isDraining,
  userActive,
  canStart,
  canStop,
  onStart,
  onStop,
  ceremonyStep = 0,
  ceremonySteps = [],
  ceremonySubline = '20 credits charged — preparing your session…',
  ceremonyTicker = null,
  ceremonyElapsedMs = 0,
  ceremonyStartMode,
  inCeremony = false,
  canRunTests = false,
  isAdmin = false,
  compact = false,
  minCreditsToStart = 30,
  startupCredits = 20,
  creditsPerMinute = 2,
  comparisonCost = 2,
  creditsChargedSession = 0,
  creditsStartupChargedSession = 0,
  creditsGpuTimeSession = 0,
  billingActive = false,
  creditBalance = null,
  hasEnoughCreditsToStart = true,
  nextMeterChargeAt = null,
  sessionEndReason = null,
  drainReason = null,
  destroyAt = null,
  reconnectEligible = false,
  reconnectUntil = null,
  useStockCopy = false,
}: GpuPoolPanelProps) {
  const [secondsToNextCharge, setSecondsToNextCharge] = useState<number | null>(null);
  const [secondsToDestroy, setSecondsToDestroy] = useState<number | null>(null);
  const [secondsToReconnect, setSecondsToReconnect] = useState<number | null>(null);

  useEffect(() => {
    if (!billingActive || !nextMeterChargeAt) {
      setSecondsToNextCharge(null);
      return;
    }
    const update = () => {
      const ms = new Date(nextMeterChargeAt).getTime() - Date.now();
      setSecondsToNextCharge(Math.max(0, Math.ceil(ms / 1000)));
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [billingActive, nextMeterChargeAt]);

  useEffect(() => {
    if (!isDraining || !destroyAt) {
      setSecondsToDestroy(null);
      return;
    }
    const update = () => {
      const ms = new Date(destroyAt).getTime() - Date.now();
      setSecondsToDestroy(Math.max(0, Math.ceil(ms / 1000)));
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [isDraining, destroyAt]);

  useEffect(() => {
    if (!reconnectEligible || userActive || !reconnectUntil) {
      setSecondsToReconnect(null);
      return;
    }
    const update = () => {
      const ms = new Date(reconnectUntil).getTime() - Date.now();
      setSecondsToReconnect(Math.max(0, Math.ceil(ms / 1000)));
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [reconnectEligible, userActive, reconnectUntil]);

  const ceremonyComplete = canRunTests || ceremonyStep >= 5;
  const isResume = ceremonyStartMode === 'resume';
  const showCeremonyStepper =
    ceremonySteps.length > 0 &&
    !isResume &&
    (inCeremony || (userActive && !ceremonyComplete));
  const showAdminElapsed =
    isAdmin && userActive && ceremonyElapsedMs > 0 && !ceremonyComplete;
  const startupCharged =
    creditsStartupChargedSession > 0 ? creditsStartupChargedSession : startupCredits;
  const resourceCopy = getExtraResourceCopy();

  const copyInput = useMemo(
    () => ({
      userActive,
      sessionEndReason,
      reconnectEligible,
      state: status?.state,
      refCount: status?.refCount,
      drainReason,
    }),
    [userActive, sessionEndReason, reconnectEligible, status?.state, status?.refCount, drainReason]
  );

  const scenario = deriveGpuPoolScenario({
    ...copyInput,
    inCeremony: Boolean(inCeremony),
    ceremonyComplete,
    isReady,
    isResume,
    isFailed,
    showCeremonyStepper,
  });

  const view = useMemo(() => {
    if (useStockCopy) {
      const headline = (() => {
        if (userActive && ceremonyComplete) return 'AI Ready';
        if (userActive && !ceremonyComplete) return resourceCopy.startingSession;
        if (status?.state === 'provisioning') return resourceCopy.startingSession;
        if (status?.state === 'draining' && drainReason === 'user_grace') return resourceCopy.onStandby;
        if (status?.state === 'draining' && drainReason === 'failed_bootstrap') return resourceCopy.couldNotStart;
        if (status?.state === 'draining') return resourceCopy.endingSession;
        return resourceCopy.session;
      })();
      const detail =
        error ??
        (status?.state === 'failed' ? resourceCopy.couldNotStart : null);
      return {
        scenario,
        showIntro: false,
        headline,
        detail,
        showReconnectCountdown: false,
        showDestroyCountdown: false,
        variant: (status?.state === 'failed' ? 'red' : status?.state === 'ready' ? 'emerald' : 'amber') as
          | 'amber'
          | 'emerald'
          | 'red',
      };
    }
    return buildGpuPoolViewPresentation(scenario, resourceCopy, {
      ceremonySubline,
      isResume,
      ceremonyComplete,
      error,
      detailLine: poolPanelDetailLine(copyInput),
      lastError: status?.lastError,
      showCeremonyStepper,
    });
  }, [
    useStockCopy,
    scenario,
    resourceCopy,
    ceremonySubline,
    isResume,
    ceremonyComplete,
    error,
    copyInput,
    status?.lastError,
    showCeremonyStepper,
    userActive,
    status?.state,
    drainReason,
  ]);

  const showBetaIntro = !useStockCopy && view.showIntro && !error;
  const sessionTotalLine =
    scenario === 'A_ready'
      ? activeSessionBillingLine({
          creditsChargedSession,
          creditsStartupChargedSession,
          creditsGpuTimeSession,
          startupCredits,
          creditsPerMinute,
          billingActive,
          sessionTimeLabel: resourceCopy.sessionTimeLabel,
        })
      : null;

  const showStaleInsufficientCredits =
    scenario === 'A_insufficient' &&
    creditBalance !== null &&
    creditBalance !== undefined &&
    creditBalance < minCreditsToStart;

  const showLowBalanceNudge =
    billingActive &&
    creditBalance !== null &&
    creditBalance !== undefined &&
    creditBalance < creditsPerMinute;

  const destroyCountdownLine =
    view.showDestroyCountdown && isDraining && secondsToDestroy !== null
      ? destroyCountdownCopy({ secondsToDestroy, drainReason, copy: resourceCopy })
      : null;

  const reconnectCountdownLine =
    view.showReconnectCountdown && secondsToReconnect !== null
      ? `Save your ${startupCharged} startup credits — Start within ${formatGpuCountdown(secondsToReconnect)}. No extra startup charge.`
      : null;

  const betaCostLine = introCostLine(
    scenario,
    startupCredits,
    creditsPerMinute,
    comparisonCost,
    creditsStartupChargedSession,
    creditsGpuTimeSession
  );

  const startBlockedReason =
    !hasEnoughCreditsToStart && creditBalance !== null && creditBalance !== undefined
      ? reconnectEligible
        ? `Need at least ${creditsPerMinute} credits to continue (you have ${creditBalance}).`
        : `Need ${minCreditsToStart} credits to start a session (you have ${creditBalance}).`
      : null;

  const borderClass =
    view.variant === 'red'
      ? 'border-red-500/30 bg-red-500/10'
      : view.variant === 'emerald'
        ? 'border-emerald-500/30 bg-emerald-500/10'
        : 'border-amber-500/30 bg-amber-500/10';

  const textClass =
    view.variant === 'red'
      ? 'text-red-100'
      : view.variant === 'emerald'
        ? 'text-emerald-100'
        : 'text-amber-100';

  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${compact ? '' : 'mb-0'} ${borderClass} ${textClass}`}>
      <div className="space-y-2">
        <div className="flex min-w-0 items-start gap-2">
          <Cpu className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              {showBetaIntro ? (
                <div className="space-y-1 text-xs opacity-90">
                  <p>{resourceCopy.betaIntroLine1}</p>
                  <p>{resourceCopy.betaIntroLine2}</p>
                  <p className="font-medium opacity-100">{betaCostLine}</p>
                  {reconnectCountdownLine && (
                    <p className="font-medium text-amber-200 opacity-100">{reconnectCountdownLine}</p>
                  )}
                  {scenario === 'A1' && isDraining && drainReason === 'admin_grace' && (
                    <p className="opacity-80">{resourceCopy.shuttingDownWait}</p>
                  )}
                </div>
              ) : (
                <>
                  <p className="font-medium">{view.headline}</p>
                  {showStaleInsufficientCredits ? (
                    <p className="text-xs opacity-80">
                      {resourceCopy.insufficientCreditsDetail}{' '}
                      <Link href="/subscription" className="underline hover:opacity-100">
                        Add credits
                      </Link>{' '}
                      to start again.
                    </p>
                  ) : scenario === 'A_insufficient' ? (
                    <p className="text-xs opacity-80">
                      Previous session ended when credits ran out — you can start again.
                    </p>
                  ) : view.detail ? (
                    <p className="text-xs opacity-80">{error ?? view.detail}</p>
                  ) : error ? (
                    <p className="text-xs opacity-80">{error}</p>
                  ) : null}
                </>
              )}
              {sessionTotalLine && (
                <p className="mt-1 text-xs font-medium opacity-90">{sessionTotalLine}</p>
              )}
              {reconnectCountdownLine && !showBetaIntro && (
                <p className="mt-1 text-xs font-medium text-amber-200">{reconnectCountdownLine}</p>
              )}
              {destroyCountdownLine && !showBetaIntro && (
                <p className="mt-1 text-xs font-medium text-amber-200">{destroyCountdownLine}</p>
              )}
              {showLowBalanceNudge && secondsToNextCharge !== null && (
                <p className="mt-1 text-xs text-amber-200">
                  Session ends in ~{secondsToNextCharge}s —{' '}
                  <Link href="/subscription" className="underline hover:opacity-100">
                    Add credits
                  </Link>
                </p>
              )}
              {startBlockedReason && !userActive && (
                <p className="mt-1 text-xs text-red-200">{startBlockedReason}</p>
              )}
            </div>

            {showCeremonyStepper && <GpuCeremonyStepper steps={ceremonySteps} />}

            {showCeremonyStepper && ceremonyTicker && (
              <p key={ceremonyTicker} className="text-xs opacity-80">
                {ceremonyTicker}
              </p>
            )}

            {showAdminElapsed && (
              <p className="font-mono text-[0.6rem] text-zinc-400">
                Actual: {formatCeremonyElapsed(ceremonyElapsedMs)}
                {isAdmin && ceremonyStartMode ? ` · ${ceremonyStartMode}` : ''}
                {isAdmin ? ` · API ${isReady ? 'ready' : 'waiting'}` : ''}
              </p>
            )}
          </div>
        </div>

        {(canStart || canStop) && (
          <div className="flex flex-wrap justify-end gap-2">
            {canStart && (
              <button
                type="button"
                onClick={onStart}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1 text-xs font-medium text-black hover:bg-amber-400 disabled:opacity-50"
              >
                <Play className="h-3 w-3" />
                Start session
              </button>
            )}
            {canStop && (
              <button
                type="button"
                onClick={onStop}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-md border border-white/20 px-2.5 py-1 text-xs font-medium hover:bg-white/10 disabled:opacity-50"
              >
                <Square className="h-3 w-3" />
                Stop session
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
