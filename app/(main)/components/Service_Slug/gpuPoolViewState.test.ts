import { describe, expect, it } from 'vitest';
import {
  buildGpuPoolViewPresentation,
  deriveGpuPoolScenario,
  introCostLine,
} from './gpuPoolViewState';
import { getExtraResourceCopy } from '../../lib/extraResourceCopy';

const copy = getExtraResourceCopy();

const idle = {
  inCeremony: false,
  ceremonyComplete: false,
  isReady: false,
  isResume: false,
  isFailed: false,
  showCeremonyStepper: false,
};

describe('deriveGpuPoolScenario', () => {
  it('A1 — beta key in, no Start yet', () => {
    expect(deriveGpuPoolScenario({ ...idle, userActive: false })).toBe('A1');
  });

  it('A1 — second user while pool ready with another session (no join copy)', () => {
    expect(
      deriveGpuPoolScenario({
        ...idle,
        userActive: false,
        state: 'ready',
        refCount: 1,
      })
    ).toBe('A1');
  });

  it('A2 — boot in progress', () => {
    expect(
      deriveGpuPoolScenario({
        ...idle,
        userActive: true,
        state: 'provisioning',
      })
    ).toBe('A2');
  });

  it('A3 — reconnect window (pool idle after destroy)', () => {
    expect(
      deriveGpuPoolScenario({
        ...idle,
        userActive: false,
        reconnectEligible: true,
        state: 'idle',
        sessionEndReason: 'user_stop',
      })
    ).toBe('A3');
  });

  it('A4 — compare worked then Stop (user grace)', () => {
    expect(
      deriveGpuPoolScenario({
        ...idle,
        userActive: false,
        state: 'draining',
        drainReason: 'user_grace',
        sessionEndReason: 'user_stop',
      })
    ).toBe('A4');
  });

  it('A6 — prior stop, reconnect expired', () => {
    expect(
      deriveGpuPoolScenario({
        ...idle,
        userActive: false,
        reconnectEligible: false,
        sessionEndReason: 'user_stop',
        state: 'idle',
      })
    ).toBe('A6');
  });

  it('A7 — provision failed', () => {
    expect(
      deriveGpuPoolScenario({
        ...idle,
        userActive: false,
        sessionEndReason: 'provision_failed',
        state: 'failed',
      })
    ).toBe('A7');
  });

  it('A_ready — ceremony complete, pool ready', () => {
    expect(
      deriveGpuPoolScenario({
        ...idle,
        userActive: true,
        ceremonyComplete: true,
        isReady: true,
        state: 'ready',
      })
    ).toBe('A_ready');
  });
});

describe('buildGpuPoolViewPresentation', () => {
  it('A3 uses intro, not reserve copy', () => {
    const p = buildGpuPoolViewPresentation('A3', copy, {
      ceremonySubline: '',
      isResume: false,
      ceremonyComplete: false,
      error: null,
      detailLine: null,
      showCeremonyStepper: false,
    });
    expect(p.showIntro).toBe(true);
    expect(p.showReconnectCountdown).toBe(true);
    expect(p.detail).toBeNull();
  });

  it('A_ready shows compare hint not startup pricing', () => {
    const p = buildGpuPoolViewPresentation('A_ready', copy, {
      ceremonySubline: '',
      isResume: false,
      ceremonyComplete: true,
      error: null,
      detailLine: null,
      showCeremonyStepper: false,
    });
    expect(p.headline).toBe('AI Ready');
    expect(p.detail).toContain('Compare below');
    expect(p.variant).toBe('emerald');
  });
});

describe('introCostLine', () => {
  it('A3 shows startup already paid', () => {
    expect(introCostLine('A3', 20, 2, 2, 6)).toContain('startup already paid');
  });
});
