import type { GPUPoolStatus } from '../../lib/apiService';
import { getExtraResourceCopy } from '../../lib/extraResourceCopy';

const copy = () => getExtraResourceCopy();

export const GPU_BUSY_RETRY_HINT = copy().busyDetail;

export const GPU_RECONNECT_HINT = copy().reconnectHint;

export type GpuPoolPanelCopyInput = {
  userActive: boolean;
  sessionEndReason?: string | null;
  state?: GPUPoolStatus['state'];
  refCount?: number;
  drainReason?: GPUPoolStatus['drainReason'] | null;
};

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

  if (priorProvisionFailed) return c.busyHeadline;
  if (
    !userActive &&
    sessionEndReason === 'provision_failed' &&
    !sharedJoin &&
    (state === 'provisioning' || state === 'draining')
  ) {
    return c.busyHeadline;
  }
  if (priorPoolNotLive) return c.notRunning;
  if (priorInsufficientCredits) return 'Session ended — low credits';
  if (isResume && !ceremonyComplete) return c.resumingSession;
  if (inCeremony) return c.startingSession;
  if (state === 'ready' && userActive && ceremonyComplete) return 'AI Ready';
  if (userActive && !ceremonyComplete) return c.startingSession;
  if (state === 'draining') {
    return input.drainReason === 'user_grace' ? c.onStandby : c.endingSession;
  }
  if (showActiveFailure) return c.couldNotStart;
  if (userActive) return c.sessionActive;
  return c.session;
}

export function poolPanelDetailLine(input: GpuPoolPanelCopyInput): string | null {
  if (isPriorProvisionFailed(input)) {
    return GPU_BUSY_RETRY_HINT;
  }
  return null;
}
