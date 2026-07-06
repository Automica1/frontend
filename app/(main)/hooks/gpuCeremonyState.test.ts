import { describe, expect, it } from 'vitest';
import {
  buildCeremonyThresholds,
  computeCeremonyState,
  formatCeremonyElapsed,
  resolveCeremonyStartMode,
  type CeremonyThresholds,
} from './gpuCeremonyState';
import { deriveGpuCeremonyMode } from './useGpuPool';

const fixedThresholds: CeremonyThresholds = {
  step1Ms: 3000,
  postReady3Ms: 800,
  postReady4Ms: 700,
  postReady5Ms: 600,
  warmCumulativeMs: [2000, 4000, 6000, 8000, 10_000],
};

describe('computeCeremonyState', () => {
  it('cold — lingers on step 2 while backend not ready', () => {
    const state = computeCeremonyState({
      elapsedMs: 5 * 60_000,
      backendReady: false,
      startMode: 'cold',
      warmPadMs: 15_000,
      thresholds: fixedThresholds,
      readyAtMs: null,
    });

    expect(state.step).toBe(2);
    expect(state.lingerStep).toBe(2);
    expect(state.steps[1].linger).toBe(true);
    expect(state.ceremonyComplete).toBe(false);
    expect(state.canRunTests).toBe(false);
  });

  it('cold — zips steps 3–5 after backend ready', () => {
    const readyAtMs = 120_000;
    const afterZip = computeCeremonyState({
      elapsedMs: readyAtMs + 2100,
      backendReady: true,
      startMode: 'cold',
      warmPadMs: 15_000,
      thresholds: fixedThresholds,
      readyAtMs,
    });

    expect(afterZip.step).toBe(5);
    expect(afterZip.ceremonyComplete).toBe(true);
    expect(afterZip.canRunTests).toBe(true);
  });

  it('warm_ready — ignores early backend ready before pad', () => {
    const state = computeCeremonyState({
      elapsedMs: 5000,
      backendReady: true,
      startMode: 'warm_ready',
      warmPadMs: 10_000,
      thresholds: fixedThresholds,
      readyAtMs: 200,
    });

    expect(state.ceremonyComplete).toBe(false);
    expect(state.canRunTests).toBe(false);
  });

  it('warm_ready — unlocks after pad', () => {
    const state = computeCeremonyState({
      elapsedMs: 10_000,
      backendReady: true,
      startMode: 'warm_ready',
      warmPadMs: 10_000,
      thresholds: fixedThresholds,
      readyAtMs: 200,
    });

    expect(state.step).toBe(5);
    expect(state.ceremonyComplete).toBe(true);
    expect(state.canRunTests).toBe(true);
  });

  it('warm_join — lingers on allocate until ready', () => {
    const state = computeCeremonyState({
      elapsedMs: 90_000,
      backendReady: false,
      startMode: 'warm_join',
      warmPadMs: 15_000,
      thresholds: fixedThresholds,
      readyAtMs: null,
    });

    expect(state.step).toBe(2);
    expect(state.lingerStep).toBe(2);
  });

  it('resume — completes on backend ready without replay', () => {
    const waiting = computeCeremonyState({
      elapsedMs: 4000,
      backendReady: false,
      startMode: 'resume',
      warmPadMs: 0,
      thresholds: fixedThresholds,
      readyAtMs: null,
    });

    expect(waiting.step).toBe(2);
    expect(waiting.ceremonyComplete).toBe(false);

    const ready = computeCeremonyState({
      elapsedMs: 4500,
      backendReady: true,
      startMode: 'resume',
      warmPadMs: 0,
      thresholds: fixedThresholds,
      readyAtMs: null,
    });

    expect(ready.step).toBe(5);
    expect(ready.ceremonyComplete).toBe(true);
    expect(ready.canRunTests).toBe(true);
  });
});

describe('deriveGpuCeremonyMode', () => {
  it('maps pool state to ceremony mode on start click', () => {
    expect(deriveGpuCeremonyMode({ state: 'ready', refCount: 1 } as never)).toBe('warm_ready');
    expect(deriveGpuCeremonyMode({ state: 'provisioning', refCount: 2 } as never)).toBe('warm_join');
    expect(deriveGpuCeremonyMode({ state: 'provisioning', refCount: 1 } as never)).toBe('cold');
    expect(
      deriveGpuCeremonyMode({ state: 'provisioning', refCount: 1 } as never, {
        poolWasProvisioning: true,
      })
    ).toBe('warm_join');
  });
});

describe('resolveCeremonyStartMode', () => {
  it('prefers clicked start mode over sessionResumed API flag', () => {
    expect(resolveCeremonyStartMode('warm_ready', true)).toBe('warm_ready');
    expect(resolveCeremonyStartMode('cold', true)).toBe('cold');
  });

  it('uses resume only when user active without a fresh start click', () => {
    expect(resolveCeremonyStartMode(null, true)).toBe('resume');
    expect(resolveCeremonyStartMode(null, false)).toBe('cold');
  });
});

describe('formatCeremonyElapsed', () => {
  it('formats seconds and minutes', () => {
    expect(formatCeremonyElapsed(4500)).toBe('4s');
    expect(formatCeremonyElapsed(65_000)).toBe('1m 5s');
  });
});

describe('buildCeremonyThresholds', () => {
  it('warm cumulative ends at warm pad', () => {
    const thresholds = buildCeremonyThresholds('warm_ready', 12_000, () => 0.5);
    expect(thresholds.warmCumulativeMs[4]).toBe(12_000);
  });
});
