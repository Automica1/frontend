import type { GPUPoolStatus } from '../../lib/apiService';
import type { ExtraResourceCopy } from '../../lib/extraResourceCopy';
import {
  isPriorProvisionFailed,
  isUserGraceStandby,
  sharedPoolJoinMode,
  type GpuPoolPanelCopyInput,
} from './gpuPoolPanelCopy';

/** Signed scenario IDs from gpu-beta-scenario-decisions-2026-07-07.md */
export type GpuPoolScenario =
  | 'A1'
  | 'A2'
  | 'A3'
  | 'A4'
  | 'A6'
  | 'A7'
  | 'A_ready'
  | 'A_insufficient'
  | 'A_pool_not_live'
  | 'A_draining_end'
  | 'A_active_failure';

export type GpuPoolViewInput = GpuPoolPanelCopyInput & {
  inCeremony: boolean;
  ceremonyComplete: boolean;
  isReady: boolean;
  isResume: boolean;
  isFailed: boolean;
  showCeremonyStepper: boolean;
};

export function deriveGpuPoolScenario(input: GpuPoolViewInput): GpuPoolScenario {
  const pool = {
    userActive: input.userActive,
    sessionEndReason: input.sessionEndReason,
    reconnectEligible: input.reconnectEligible,
    state: input.state,
    refCount: input.refCount,
    drainReason: input.drainReason,
  };

  if (input.userActive) {
    if (input.isFailed) return 'A_active_failure';
    if (input.ceremonyComplete && input.isReady) return 'A_ready';
    return 'A2';
  }

  if (isPriorProvisionFailed(pool)) return 'A7';

  const sharedJoin = sharedPoolJoinMode(pool);
  if (input.sessionEndReason === 'pool_not_live' && !sharedJoin) return 'A_pool_not_live';
  if (input.sessionEndReason === 'insufficient_credits' && !sharedJoin) return 'A_insufficient';

  if (isUserGraceStandby(pool)) return 'A4';

  if (input.state === 'draining') {
    if (input.drainReason === 'user_grace' && !input.sessionEndReason) return 'A1';
    return 'A_draining_end';
  }

  if (input.reconnectEligible) return 'A3';

  if (input.sessionEndReason) return 'A6';

  return 'A1';
}

export type GpuPoolViewPresentation = {
  scenario: GpuPoolScenario;
  showIntro: boolean;
  headline: string;
  detail: string | null;
  showReconnectCountdown: boolean;
  showDestroyCountdown: boolean;
  variant: 'amber' | 'emerald' | 'red';
};

export function buildGpuPoolViewPresentation(
  scenario: GpuPoolScenario,
  copy: ExtraResourceCopy,
  opts: {
    ceremonySubline: string;
    isResume: boolean;
    ceremonyComplete: boolean;
    error: string | null;
    detailLine: string | null;
    lastError?: string | null;
    showCeremonyStepper: boolean;
  }
): GpuPoolViewPresentation {
  const base = {
    scenario,
    showIntro: false,
    showReconnectCountdown: scenario === 'A3',
    showDestroyCountdown: scenario === 'A4' || scenario === 'A_draining_end',
    variant: 'amber' as const,
  };

  switch (scenario) {
    case 'A_ready':
      return {
        ...base,
        headline: 'AI Ready',
        detail: 'Compare below when you are ready. Stop session when finished.',
        variant: 'emerald',
      };
    case 'A2':
      return {
        ...base,
        headline: opts.isResume && !opts.ceremonyComplete ? copy.resumingSession : copy.startingSession,
        detail: opts.showCeremonyStepper
          ? null
          : opts.isResume && !opts.ceremonyComplete
            ? opts.ceremonySubline
            : null,
      };
    case 'A_active_failure':
      return {
        ...base,
        headline: copy.couldNotStart,
        detail: opts.lastError ?? 'Please try Start session again in a few minutes.',
        variant: 'red',
      };
    case 'A7':
      return {
        ...base,
        headline: copy.busyHeadline,
        detail: opts.detailLine ?? copy.busyDetail,
        variant: 'red',
      };
    case 'A_pool_not_live':
      return {
        ...base,
        headline: copy.notRunning,
        detail: copy.notRunningDetail,
        variant: 'red',
      };
    case 'A_insufficient':
      return {
        ...base,
        headline: 'Session ended — low credits',
        detail: null,
        variant: 'red',
      };
    case 'A4':
      return {
        ...base,
        headline: copy.onStandby,
        detail: copy.keepRunning,
      };
    case 'A_draining_end':
      return {
        ...base,
        headline: copy.endingSession,
        detail: copy.shutdownScheduled,
      };
    case 'A3':
      return {
        ...base,
        showIntro: !opts.showCeremonyStepper,
        headline: copy.session,
        detail: null,
      };
    case 'A6':
      return {
        ...base,
        showIntro: !opts.showCeremonyStepper,
        headline: copy.session,
        detail: copy.tryBeta,
      };
    case 'A1':
    default:
      return {
        ...base,
        showIntro: !opts.showCeremonyStepper,
        headline: copy.session,
        detail: null,
      };
  }
}

export function introCostLine(
  scenario: GpuPoolScenario,
  startupCredits: number,
  creditsPerMinute: number,
  comparisonCost: number,
  creditsStartupChargedSession: number,
  creditsGpuTimeSession = 0
): string {
  if (scenario === 'A3') {
    const reserved =
      creditsStartupChargedSession > 0 ? creditsStartupChargedSession : startupCredits;
    const rates = `${creditsPerMinute} Credits/minute · ${comparisonCost} Credits/compare`;
    if (creditsGpuTimeSession > 0) {
      return `Cost - ${rates} · ${reserved} startup already paid · ${creditsGpuTimeSession} resource time this session`;
    }
    return `Cost - ${rates} · ${reserved} startup already paid`;
  }
  return `Cost - ${startupCredits} Credits on Session Start · ${creditsPerMinute} Credits/minute · ${comparisonCost} Credits/compare`;
}

export function activeSessionBillingLine(input: {
  creditsChargedSession: number;
  creditsStartupChargedSession: number;
  creditsGpuTimeSession: number;
  startupCredits: number;
  creditsPerMinute: number;
  billingActive: boolean;
  sessionTimeLabel: string;
}): string | null {
  const startupBooked =
    input.creditsStartupChargedSession > 0 ? input.creditsStartupChargedSession : input.startupCredits;
  const startupDebited =
    input.creditsChargedSession >= startupBooked && startupBooked > 0 ? startupBooked : 0;
  const gpuTimeCharged =
    input.creditsGpuTimeSession > 0
      ? input.creditsGpuTimeSession
      : Math.max(0, input.creditsChargedSession - startupDebited);

  if (gpuTimeCharged > 0) {
    const startPart = startupDebited > 0 ? `${startupDebited} start + ` : '';
    return `Session total: ${input.creditsChargedSession} credits · ${startPart}${gpuTimeCharged} ${input.sessionTimeLabel}`;
  }
  if (input.creditsChargedSession > 0) {
    return `${input.creditsChargedSession} credits charged · ${input.creditsPerMinute}/min while active`;
  }
  if (input.billingActive) {
    return `${input.creditsPerMinute}/min while active`;
  }
  return null;
}
