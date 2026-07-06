import { describe, expect, it } from 'vitest';
import { canStartGpuSession, deriveGpuCeremonyMode } from './useGpuPool';
import type { GPUPoolStatus } from '../lib/apiService';

describe('useGpuPool helpers', () => {
  it('allows start during user-grace drain when the node still exists', () => {
    expect(
      canStartGpuSession({
        available: true,
        loading: false,
        userActive: false,
        isDraining: true,
        isUserGraceDraining: true,
        hasEnoughCreditsToStart: true,
        state: 'draining',
        refCount: 0,
        hasStatus: true,
      })
    ).toBe(true);
  });

  it('blocks start during admin-grace drain', () => {
    expect(
      canStartGpuSession({
        available: true,
        loading: false,
        userActive: false,
        isDraining: true,
        isUserGraceDraining: false,
        hasEnoughCreditsToStart: true,
        state: 'draining',
        refCount: 0,
        hasStatus: true,
      })
    ).toBe(false);
  });

  it('treats user-grace drain as warm_ready for ceremony timing', () => {
    const status = {
      state: 'draining',
      drainReason: 'user_grace',
      refCount: 0,
    } as GPUPoolStatus;

    expect(deriveGpuCeremonyMode(status)).toBe('warm_ready');
  });
});
