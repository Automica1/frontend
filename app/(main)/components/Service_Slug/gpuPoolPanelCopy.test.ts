import { describe, expect, it } from 'vitest';
import {
  isEarlyStopReconnect,
  isFreshGpuVisitor,
  isPoolBootInProgress,
  isPriorProvisionFailed,
  isUserGraceStandby,
  poolPanelDetailLine,
  poolPanelHeadline,
  sharedPoolJoinMode,
  showGpuIdleIntroPanel,
} from './gpuPoolPanelCopy';

describe('gpuPoolPanelCopy', () => {
  it('detects shared pool boot while another user is starting (internal only)', () => {
    expect(
      isPoolBootInProgress({
        userActive: false,
        state: 'provisioning',
        refCount: 1,
      })
    ).toBe(true);
  });

  it('does not treat stale provision_failed as current during shared boot', () => {
    const input = {
      userActive: false,
      sessionEndReason: 'provision_failed',
      state: 'provisioning' as const,
      refCount: 1,
    };
    expect(isPriorProvisionFailed(input)).toBe(false);
    expect(sharedPoolJoinMode(input)).toBe('provisioning');
    expect(poolPanelHeadline(input)).toBe('Resource session');
    expect(poolPanelDetailLine(input)).toBeNull();
  });

  it('shows beta intro when another user has the pool (no reserve/join copy)', () => {
    const input = {
      userActive: false,
      state: 'ready' as const,
      refCount: 1,
    };
    expect(sharedPoolJoinMode(input)).toBe('ready');
    expect(showGpuIdleIntroPanel(input)).toBe(true);
  });

  it('shows beta intro after prior stop when reconnect expired (A6)', () => {
    const input = {
      userActive: false,
      sessionEndReason: 'user_stop',
      reconnectEligible: false,
      state: 'idle' as const,
      refCount: 0,
    };
    expect(isFreshGpuVisitor(input)).toBe(false);
    expect(showGpuIdleIntroPanel(input)).toBe(true);
  });

  it('shows standby headline during user-grace drain for returning user (A4)', () => {
    expect(isUserGraceStandby({
      userActive: false,
      state: 'draining',
      drainReason: 'user_grace',
      sessionEndReason: 'user_stop',
    })).toBe(true);
    expect(
      poolPanelHeadline({
        userActive: false,
        state: 'draining',
        drainReason: 'user_grace',
        sessionEndReason: 'user_stop',
      })
    ).toBe('Resource on standby');
    expect(showGpuIdleIntroPanel({
      userActive: false,
      state: 'draining',
      drainReason: 'user_grace',
      sessionEndReason: 'user_stop',
    })).toBe(false);
  });

  it('shows beta intro for fresh visitor during another user grace drain', () => {
    expect(isFreshGpuVisitor({ userActive: false, state: 'draining', drainReason: 'user_grace' })).toBe(true);
    expect(showGpuIdleIntroPanel({ userActive: false, state: 'draining', drainReason: 'user_grace' })).toBe(true);
  });

  it('detects fresh visitor only before any session', () => {
    expect(isFreshGpuVisitor({ userActive: false })).toBe(true);
    expect(isFreshGpuVisitor({ userActive: false, reconnectEligible: true })).toBe(false);
    expect(isFreshGpuVisitor({ userActive: false, sessionEndReason: 'user_stop' })).toBe(false);
  });

  it('shows A1 idle intro for early-stop reconnect (A3), not generic reserve copy', () => {
    const input = {
      userActive: false,
      reconnectEligible: true,
      state: 'provisioning' as const,
      refCount: 0,
    };
    expect(isEarlyStopReconnect(input)).toBe(true);
    expect(showGpuIdleIntroPanel(input)).toBe(true);
    expect(poolPanelHeadline(input)).toBe('Resource session');
  });

  it('A4 user-grace standby is not A3 intro', () => {
    const input = {
      userActive: false,
      reconnectEligible: true,
      state: 'draining' as const,
      drainReason: 'user_grace' as const,
      sessionEndReason: 'user_stop',
    };
    expect(isEarlyStopReconnect(input)).toBe(false);
    expect(isUserGraceStandby(input)).toBe(true);
    expect(showGpuIdleIntroPanel(input)).toBe(false);
    expect(poolPanelHeadline(input)).toBe('Resource on standby');
  });

  it('shows refund copy only when pool is failed after provision_failed', () => {
    const input = {
      userActive: false,
      sessionEndReason: 'provision_failed',
      state: 'failed' as const,
      refCount: 0,
    };
    expect(isPriorProvisionFailed(input)).toBe(true);
    expect(poolPanelHeadline(input)).toBe('Resources busy — try again soon');
    expect(poolPanelDetailLine(input)).toContain('15 minutes');
  });
});
