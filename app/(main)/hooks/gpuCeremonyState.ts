import { getExtraResourceCopy } from '../lib/extraResourceCopy';

export type GpuStartMode = 'cold' | 'warm_join' | 'warm_ready' | 'resume';
export type GpuCeremonyStep = 0 | 1 | 2 | 3 | 4 | 5;
export type CeremonyStepState = 'pending' | 'active' | 'done';

const resourceCopy = getExtraResourceCopy();

export const STEP_LABELS = [
  'Requesting session',
  resourceCopy.allocateStep,
  'Preparing environment',
  'Starting AI',
  'AI Ready',
] as const;

export const STEP_SHORT_LABELS = ['Request', 'Allocate', 'Prepare', 'Starting', 'Ready'] as const;

export type CeremonyStepView = {
  n: number;
  label: string;
  shortLabel: string;
  state: CeremonyStepState;
  linger: boolean;
};

export type CeremonyThresholds = {
  step1Ms: number;
  postReady3Ms: number;
  postReady4Ms: number;
  postReady5Ms: number;
  warmCumulativeMs: number[];
};

export type CeremonyState = {
  step: GpuCeremonyStep;
  steps: CeremonyStepView[];
  lingerStep: number;
  ceremonyComplete: boolean;
  canRunTests: boolean;
};

export function jitter(baseMs: number, spreadMs: number, rng: () => number = Math.random): number {
  return baseMs + Math.floor(rng() * (spreadMs + 1));
}

export function isDevSite(siteUrl?: string): boolean {
  return (siteUrl ?? '').includes('dev.');
}

/** Total theatrical pad for warm_ready: dev 10–20s, prod 60–120s. */
export function resolveWarmPadMs(isDev: boolean, rng: () => number = Math.random): number {
  return isDev ? jitter(10_000, 10_000, rng) : jitter(60_000, 60_000, rng);
}

function splitWarmPadCumulative(totalMs: number, rng: () => number): number[] {
  const cuts = [rng(), rng(), rng(), rng()].sort((a, b) => a - b);
  const portions = [
    cuts[0],
    cuts[1] - cuts[0],
    cuts[2] - cuts[1],
    cuts[3] - cuts[2],
    1 - cuts[3],
  ];
  const durations = portions.map((p) => Math.floor(p * totalMs));
  const used = durations.slice(0, 4).reduce((sum, value) => sum + value, 0);
  durations[4] = Math.max(0, totalMs - used);
  let cumulative = 0;
  return durations.map((duration) => {
    cumulative += duration;
    return cumulative;
  });
}

export function buildCeremonyThresholds(
  mode: GpuStartMode,
  warmPadMs: number,
  rng: () => number = Math.random
): CeremonyThresholds {
  const step1Ms = jitter(2000, 2000, rng);
  const postReady3Ms = jitter(700, 500, rng);
  const postReady4Ms = jitter(600, 400, rng);
  const postReady5Ms = jitter(500, 400, rng);
  const warmCumulativeMs =
    mode === 'warm_ready' ? splitWarmPadCumulative(warmPadMs, rng) : [];

  return { step1Ms, postReady3Ms, postReady4Ms, postReady5Ms, warmCumulativeMs };
}

function buildStepViews(
  step: GpuCeremonyStep,
  ceremonyComplete: boolean,
  lingerStep: number
): CeremonyStepView[] {
  return STEP_LABELS.map((label, index) => {
    const n = index + 1;
    let state: CeremonyStepState = 'pending';
    if (ceremonyComplete || step > n) state = 'done';
    else if (step === n) state = 'active';
    return {
      n,
      label,
      shortLabel: STEP_SHORT_LABELS[index],
      state,
      linger: lingerStep === n && state === 'active',
    };
  });
}

function computeColdOrJoin(
  elapsedMs: number,
  backendReady: boolean,
  readyAtMs: number | null,
  thresholds: CeremonyThresholds
): Pick<CeremonyState, 'step' | 'lingerStep' | 'ceremonyComplete'> {
  if (!backendReady) {
    const step: GpuCeremonyStep = elapsedMs < thresholds.step1Ms ? 1 : 2;
    return { step, lingerStep: step === 2 ? 2 : 0, ceremonyComplete: false };
  }

  const sinceReady = readyAtMs === null ? 0 : Math.max(0, elapsedMs - readyAtMs);
  const t3 = thresholds.postReady3Ms;
  const t4 = t3 + thresholds.postReady4Ms;
  const t5 = t4 + thresholds.postReady5Ms;

  let step: GpuCeremonyStep = 5;
  if (sinceReady < t3) step = 3;
  else if (sinceReady < t4) step = 4;
  else if (sinceReady < t5) step = 5;

  return {
    step,
    lingerStep: 0,
    ceremonyComplete: sinceReady >= t5,
  };
}

function computeWarmReady(
  elapsedMs: number,
  warmPadMs: number,
  thresholds: CeremonyThresholds
): Pick<CeremonyState, 'step' | 'lingerStep' | 'ceremonyComplete'> {
  const cumulative = thresholds.warmCumulativeMs;
  if (cumulative.length < 5) {
    return { step: 1, lingerStep: 0, ceremonyComplete: false };
  }

  let step: GpuCeremonyStep = 1;
  if (elapsedMs >= cumulative[3]) step = 5;
  else if (elapsedMs >= cumulative[2]) step = 4;
  else if (elapsedMs >= cumulative[1]) step = 3;
  else if (elapsedMs >= cumulative[0]) step = 2;

  const ceremonyComplete = elapsedMs >= warmPadMs;
  return { step, lingerStep: 0, ceremonyComplete };
}

export function computeCeremonyState(input: {
  elapsedMs: number;
  backendReady: boolean;
  startMode: GpuStartMode;
  warmPadMs: number;
  thresholds: CeremonyThresholds;
  readyAtMs: number | null;
}): CeremonyState {
  const { elapsedMs, backendReady, startMode, warmPadMs, thresholds, readyAtMs } = input;

  if (startMode === 'resume') {
    const step: GpuCeremonyStep = backendReady ? 5 : 2;
    const ceremonyComplete = backendReady;
    const steps = buildStepViews(step, ceremonyComplete, backendReady ? 0 : 2);
    return {
      step,
      steps,
      lingerStep: backendReady ? 0 : 2,
      ceremonyComplete,
      canRunTests: backendReady && ceremonyComplete,
    };
  }

  let partial: Pick<CeremonyState, 'step' | 'lingerStep' | 'ceremonyComplete'>;

  if (startMode === 'warm_ready') {
    partial = computeWarmReady(elapsedMs, warmPadMs, thresholds);
  } else {
    partial = computeColdOrJoin(elapsedMs, backendReady, readyAtMs, thresholds);
  }

  const { step, lingerStep, ceremonyComplete } = partial;
  const steps = buildStepViews(step, ceremonyComplete, lingerStep);

  const canRunTests =
    backendReady &&
    ceremonyComplete &&
    (startMode !== 'warm_ready' || elapsedMs >= warmPadMs);

  return { step, steps, lingerStep, ceremonyComplete, canRunTests };
}

export function resolveCeremonyStartMode(
  clickedStartMode: GpuStartMode | null,
  userActive: boolean
): GpuStartMode {
  if (clickedStartMode) return clickedStartMode;
  if (userActive) return 'resume';
  return 'cold';
}

export function formatCeremonyElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export const CEREMONY_TICKER_INTERVAL_MS = 7_000;

const COLD_CEREMONY_TICKERS = [
  'Hang tight — your resource is getting ready.',
  'This can take about 10 minutes on a cold start.',
  "We're allocating compute and preparing your environment.",
  "You'll be able to compare as soon as setup finishes.",
] as const;

const WARM_CEREMONY_TICKERS = [
  'Hang tight — your resource is getting ready.',
  'Warming up your session…',
  'Almost ready — finishing the last steps.',
] as const;

/** Rotating reassurance copy while the ceremony stepper is visible. */
export function resolveCeremonyTicker(
  elapsedMs: number,
  startMode: GpuStartMode,
  intervalMs: number = CEREMONY_TICKER_INTERVAL_MS
): string {
  const messages =
    startMode === 'warm_ready' || startMode === 'warm_join'
      ? WARM_CEREMONY_TICKERS
      : COLD_CEREMONY_TICKERS;
  const index = Math.floor(Math.max(0, elapsedMs) / intervalMs) % messages.length;
  return messages[index];
}
