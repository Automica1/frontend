import type { GPUPoolStatus } from '../../lib/apiService';
import { getExtraResourceCopy } from '../../lib/extraResourceCopy';

const copy = () => getExtraResourceCopy();

export const GPU_BUSY_RETRY_HINT = copy().busyDetail;

export const GPU_RECONNECT_HINT = copy().reconnectHint;

export type GpuPoolPanelCopyInput = {
  userActive: boolean;
  sessionEndReason?: string | null;
  reconnectEligible?: boolean;
  state?: GPUPoolStatus['state'];
  refCount?: number;
  drainReason?: GPUPoolStatus['drainReason'] | null;
};

/** First visit: beta key in, never started or stopped a session on this pool. */
export function isFreshGpuVisitor(input: GpuPoolPanelCopyInput): boolean {
  if (input.userActive || input.reconnectEligible) return false;
  if (input.sessionEndReason) return false;
  return true;
}

/** A3: stopped before Compare worked; reconnect window open (not A4 user-grace standby). */
export function isEarlyStopReconnect(input: GpuPoolPanelCopyInput): boolean {
  if (input.userActive || !input.reconnectEligible) return false;
  if (input.state === 'draining' && input.drainReason === 'user_grace') return false;
  return true;
}

/** A4: user stopped after Compare — pool in user-grace standby (not A1 intro). */
export function isUserGraceStandby(input: GpuPoolPanelCopyInput): boolean {
  return (
    !input.userActive &&
    input.state === 'draining' &&
    input.drainReason === 'user_grace' &&
    Boolean(input.sessionEndReason)
  );
}

/** A1 idle intro panel, or A3 same intro + reconnect countdown (scenario doc). */
export function showGpuIdleIntroPanel(input: GpuPoolPanelCopyInput): boolean {
  if (input.userActive) return false;
  if (isUserGraceStandby(input)) return false;
  if (input.state === 'draining') {
    // Fresh / second tester while pool is in user-grace but they have no ended session (A1).
    if (input.drainReason === 'user_grace' && !input.sessionEndReason) return true;
    if (input.drainReason === 'failed_bootstrap') return true;
    return false;
  }
  return true;
}

export function isOrphanBootReconnect(input: GpuPoolPanelCopyInput): boolean {
  return !input.userActive && input.state === 'provisioning' && (input.refCount ?? 0) === 0;
}

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
  const c = copy();
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

	if (priorProvisionFailed) return c.couldNotStart;
  if (
    !userActive &&
    sessionEndReason === 'provision_failed' &&
    !sharedJoin &&
    (state === 'provisioning' || state === 'draining')
  ) {
    return c.couldNotStart;
  }
  if (priorPoolNotLive) return c.notRunning;
  if (priorInsufficientCredits) return 'Session ended — low credits';
  if (isResume && !ceremonyComplete) return c.resumingSession;
  if (inCeremony) return c.startingSession;
  if (state === 'ready' && userActive && ceremonyComplete) return 'AI Ready';
  if (userActive && !ceremonyComplete) return c.startingSession;
  if (isUserGraceStandby(input)) {
    return c.onStandby;
  }
  if (state === 'draining') {
    if (input.drainReason === 'user_grace') return c.onStandby;
    if (input.drainReason === 'failed_bootstrap') return c.couldNotStart;
    return c.endingSession;
  }
  if (showActiveFailure) return c.couldNotStart;
  if (userActive) return c.sessionActive;
  return c.session;
}

export function poolPanelDetailLine(input: GpuPoolPanelCopyInput): string | null {
  if (isPriorProvisionFailed(input)) {
    return 'The previous startup failed. Start again to retry.';
  }
  if (input.state === 'draining' && input.drainReason === 'failed_bootstrap') {
    return 'The previous startup failed. Start again to retry on the same node while recovery is still available.';
  }
  return null;
}
