'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cpu, Play, Square } from 'lucide-react';
import type { GPUPoolStatus } from '../../lib/apiService';
import type { GpuCeremonyStep, GpuStartMode } from '../../hooks/useGpuStartCeremony';
import type { CeremonyStepView } from '../../hooks/gpuCeremonyState';
import { formatCeremonyElapsed } from '../../hooks/gpuCeremonyState';
import GpuCeremonyStepper from './GpuCeremonyStepper';
import { isPriorProvisionFailed, sharedPoolJoinMode, poolPanelHeadline, poolPanelDetailLine, GPU_BETA_PRICING_HINT } from './gpuPoolPanelCopy';

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
  drainReason?: 'user_grace' | 'admin_grace' | null;
  destroyAt?: string | null;
  gracePeriodSec?: number;
}

function headline(
  state?: GPUPoolStatus['state'],
  userActive?: boolean,
  inCeremony?: boolean,
  ceremonyComplete?: boolean,
  showUserFailure?: boolean,
  isResume?: boolean,
  copyInput?: {
    sessionEndReason?: string | null;
    refCount?: number;
    drainReason?: GPUPoolStatus['drainReason'];
  }
): string {
  return poolPanelHeadline({
    userActive: Boolean(userActive),
    state,
    sessionEndReason: copyInput?.sessionEndReason,
    refCount: copyInput?.refCount,
    inCeremony,
    ceremonyComplete,
    isResume,
    showActiveFailure: showUserFailure,
  });
}

export default function GpuPoolPanel({
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
  onStart,
  onStop,
  ceremonyStep = 0,
  ceremonySteps = [],
  ceremonySubline = '20 credits charged — preparing your session…',
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
  gracePeriodSec = 300,
}: GpuPoolPanelProps) {
  const [secondsToNextCharge, setSecondsToNextCharge] = useState<number | null>(null);
  const [secondsToDestroy, setSecondsToDestroy] = useState<number | null>(null);

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

  const ceremonyComplete = canRunTests || ceremonyStep >= 5;
  const isResume = ceremonyStartMode === 'resume';
  const showCeremonyStepper =
    ceremonySteps.length > 0 &&
    !isResume &&
    (inCeremony || (userActive && !ceremonyComplete));
  const showAdminElapsed =
    isAdmin && userActive && ceremonyElapsedMs > 0 && !ceremonyComplete;
  const startupCharged = creditsStartupChargedSession > 0 ? creditsStartupChargedSession : startupCredits;
  const gpuTimeCharged =
    creditsGpuTimeSession > 0
      ? creditsGpuTimeSession
      : Math.max(0, creditsChargedSession - startupCharged);
  const showSessionTotal = ceremonyComplete && creditsChargedSession > 0;
  const sessionTotalLine =
    gpuTimeCharged > 0
      ? `Session total: ${creditsChargedSession} credits · ${startupCharged} start + ${gpuTimeCharged} GPU time`
      : billingActive
        ? `${startupCharged} credits to start · ${creditsPerMinute}/min while active`
        : `${startupCharged} credits to start`;
  const insufficientCredits = sessionEndReason === 'insufficient_credits';
  const poolNotLive = sessionEndReason === 'pool_not_live';
  const copyInput = {
    userActive,
    sessionEndReason,
    state: status?.state,
    refCount: status?.refCount,
    drainReason,
  };
  const sharedJoin = sharedPoolJoinMode(copyInput);
  const priorProvisionFailed = isPriorProvisionFailed(copyInput);
  const priorPoolNotLive = !userActive && poolNotLive && !sharedJoin;
  const priorInsufficientCredits = !userActive && insufficientCredits && !sharedJoin;
  const showStaleInsufficientCredits =
    priorInsufficientCredits &&
    creditBalance !== null &&
    creditBalance !== undefined &&
    creditBalance < minCreditsToStart;
  const stalePool =
    !userActive &&
    (status?.state === 'failed' || status?.state === 'idle' || !status?.state);
  const showUserFailure = (isFailed && userActive) || priorProvisionFailed;
  const showStaleFailure = priorProvisionFailed || priorPoolNotLive;
  const showLowBalanceNudge =
    billingActive &&
    creditBalance !== null &&
    creditBalance !== undefined &&
    creditBalance < creditsPerMinute;

  const formatCountdown = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const destroyCountdownLine =
    isDraining && secondsToDestroy !== null
      ? drainReason === 'admin_grace'
        ? `This GPU is being retired in ${formatCountdown(secondsToDestroy)}.`
        : `GPU shuts down in ${formatCountdown(secondsToDestroy)} — Start session again to keep it running.`
      : null;

  const borderClass = showUserFailure || showStaleFailure
    ? 'border-red-500/30 bg-red-500/10'
    : ceremonyComplete && isReady && userActive
      ? 'border-emerald-500/30 bg-emerald-500/10'
      : 'border-amber-500/30 bg-amber-500/10';

  const textClass = showUserFailure || showStaleFailure
    ? 'text-red-100'
    : ceremonyComplete && isReady && userActive
      ? 'text-emerald-100'
      : 'text-amber-100';

  const defaultDetail =
    showUserFailure && status?.lastError
      ? status.lastError
      : isResume && !ceremonyComplete
        ? ceremonySubline
        : ceremonyComplete && userActive
          ? 'Compare below when you are ready. Stop session when finished.'
          : isDraining && drainReason === 'user_grace'
            ? 'Start session again to keep this GPU running.'
            : isDraining
            ? 'GPU shutdown scheduled.'
            : showUserFailure
              ? 'Please try Start session again in a few minutes.'
              : stalePool
                ? 'Start session to try the beta GPU.'
                : 'Start session to reserve a GPU, then compare below.';

  const detailLine = poolPanelDetailLine(copyInput);

  const startBlockedReason =
    !hasEnoughCreditsToStart && creditBalance !== null && creditBalance !== undefined
      ? `Need ${minCreditsToStart} credits to start a session (you have ${creditBalance}).`
      : null;

  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${compact ? '' : 'mb-0'} ${borderClass} ${textClass}`}>
      {!compact && (
        <p className="mb-2 text-xs opacity-75">{GPU_BETA_PRICING_HINT}</p>
      )}

      <div className="space-y-2">
        <div className="flex min-w-0 items-start gap-2">
          <Cpu className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="font-medium">
                {headline(
                  status?.state,
                  userActive,
                  inCeremony,
                  ceremonyComplete,
                  showUserFailure && userActive,
                  isResume,
                  { sessionEndReason, refCount: status?.refCount, drainReason }
                )}
              </p>
              {showStaleInsufficientCredits ? (
                <p className="text-xs opacity-80">
                  Session ended — not enough credits for GPU time.{' '}
                  <Link href="/subscription" className="underline hover:opacity-100">
                    Add credits
                  </Link>{' '}
                  to start again.
                </p>
              ) : priorInsufficientCredits ? (
                <p className="text-xs opacity-80">
                  Previous session ended when credits ran out — you can start again.
                </p>
              ) : priorProvisionFailed && detailLine ? (
                <p className="text-xs opacity-80">{detailLine}</p>
              ) : priorPoolNotLive ? (
                <p className="text-xs opacity-80">
                  Previous session ended — GPU is not running. Start again when ready.
                </p>
              ) : (
                !showCeremonyStepper && (
                  <p className="text-xs opacity-80">{error ?? defaultDetail}</p>
                )
              )}
              {showSessionTotal && (
                <p className="mt-1 text-xs font-medium opacity-90">{sessionTotalLine}</p>
              )}
              {destroyCountdownLine && !showStaleInsufficientCredits && !priorInsufficientCredits && !priorPoolNotLive && !priorProvisionFailed && (
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
              {startBlockedReason && !userActive && !isStarting && (
                <p className="mt-1 text-xs text-red-200">{startBlockedReason}</p>
              )}
            </div>

            {showCeremonyStepper && <GpuCeremonyStepper steps={ceremonySteps} />}

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
