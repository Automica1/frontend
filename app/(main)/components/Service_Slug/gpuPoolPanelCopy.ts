import type { GPUPoolStatus } from '../../lib/apiService';

/** Shown only after a GPU beta key is validated (GpuPoolPanel visible). */
export const GPU_BETA_PRICING_HINT =
  '30 to start (20 upfront) · 2/min active · 2/compare · feedback refunds compares, not GPU time';

export type GpuPoolPanelCopyInput = {
  userActive: boolean;
  sessionEndReason?: string | null;
  state?: GPUPoolStatus['state'];
  refCount?: number;
  drainReason?: GPUPoolStatus['drainReason'] | null;
};

/** Internal: pool is live with another session; used to suppress stale errors, not for user-facing copy. */
export function sharedPoolJoinMode(
  input: GpuPoolPanelCopyInput
): 'provisioning' | 'ready' | false {
  if (input.userActive || (input.refCount ?? 0) === 0) return false;
  if (input.state === 'provisioning') return 'provisioning';
  if (input.state === 'ready') return 'ready';
  return false;
}

export function isPoolBootInProgress(input: GpuPoolPanelCopyInput): boolean {
  return sharedPoolJoinMode(input) === 'provisioning';
}

/** Only show a past provision_failed notice when the pool is idle/failed — not while another session is live. */
export function isPriorProvisionFailed(input: GpuPoolPanelCopyInput): boolean {
  if (input.userActive || input.sessionEndReason !== 'provision_failed') return false;
  if (sharedPoolJoinMode(input)) return false;
  return input.state === 'failed' || input.state === 'idle';
}

export function poolPanelHeadline(
  input: GpuPoolPanelCopyInput & {
    inCeremony?: boolean;
    ceremonyComplete?: boolean;
    isResume?: boolean;
    showActiveFailure?: boolean;
  }
): string {
  const {
    userActive,
    inCeremony,
    ceremonyComplete,
    isResume,
    showActiveFailure,
    state,
    sessionEndReason,
  } = input;
  const sharedJoin = sharedPoolJoinMode(input);
  const priorProvisionFailed = isPriorProvisionFailed(input);
  const priorPoolNotLive =
    !userActive && sessionEndReason === 'pool_not_live' && !sharedJoin;
  const priorInsufficientCredits =
    !userActive && sessionEndReason === 'insufficient_credits' && !sharedJoin;

  if (priorProvisionFailed) return 'Start failed — credits refunded';
  if (
    !userActive &&
    sessionEndReason === 'provision_failed' &&
    !sharedJoin &&
    (state === 'provisioning' || state === 'draining')
  ) {
    return 'Start failed — credits refunded';
  }
  if (priorPoolNotLive) return 'GPU is not running';
  if (priorInsufficientCredits) return 'Session ended — low credits';
  if (isResume && !ceremonyComplete) return 'Resuming GPU session…';
  if (inCeremony) return 'Starting GPU session…';
  if (state === 'ready' && userActive && ceremonyComplete) return 'AI Ready';
  if (userActive && !ceremonyComplete) return 'Starting GPU session…';
  if (state === 'draining') {
    return input.drainReason === 'user_grace' ? 'GPU on standby' : 'Ending GPU session…';
  }
  if (showActiveFailure) return 'Could not start GPU session';
  if (userActive) return 'GPU session active';
  return 'GPU session';
}

export function poolPanelDetailLine(input: GpuPoolPanelCopyInput): string | null {
  if (isPriorProvisionFailed(input)) {
    return 'Credits refunded — tap Start to try again.';
  }
  return null;
}
