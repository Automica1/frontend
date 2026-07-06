import { describe, expect, it } from 'vitest';
import {
  isPoolBootInProgress,
  isPriorProvisionFailed,
  poolPanelDetailLine,
  poolPanelHeadline,
  sharedPoolJoinMode,
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
    expect(poolPanelHeadline(input)).toBe('GPU session');
    expect(poolPanelDetailLine(input)).toBeNull();
  });

  it('shows generic idle copy when pool is ready with another session (no infra leak)', () => {
    const input = {
      userActive: false,
      state: 'ready' as const,
      refCount: 1,
    };
    expect(sharedPoolJoinMode(input)).toBe('ready');
    expect(poolPanelHeadline(input)).toBe('GPU session');
    expect(poolPanelDetailLine(input)).toBeNull();
  });

  it('shows standby headline during user-grace drain', () => {
    expect(
      poolPanelHeadline({
        userActive: false,
        state: 'draining',
        drainReason: 'user_grace',
      })
    ).toBe('GPU on standby');
  });

  it('shows orphan-boot reconnect headline', () => {
    expect(
      poolPanelHeadline({
        userActive: false,
        state: 'provisioning',
        refCount: 0,
      })
    ).toBe('Continuing setup…');
    expect(
      poolPanelDetailLine({
        userActive: false,
        state: 'provisioning',
        refCount: 0,
      })
    ).toContain('no extra startup charge');
  });

  it('shows refund copy only when pool is failed after provision_failed', () => {
    const input = {
      userActive: false,
      sessionEndReason: 'provision_failed',
      state: 'failed' as const,
      refCount: 0,
    };
    expect(isPriorProvisionFailed(input)).toBe(true);
    expect(poolPanelHeadline(input)).toBe('GPUs busy — try again soon');
    expect(poolPanelDetailLine(input)).toContain('15 minutes');
  });
});
