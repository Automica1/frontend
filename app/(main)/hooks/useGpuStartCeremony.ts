'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildCeremonyThresholds,
  computeCeremonyState,
  isDevSite,
  resolveWarmPadMs,
  STEP_LABELS,
  STEP_SHORT_LABELS,
  type CeremonyStepView,
  type CeremonyThresholds,
  type GpuCeremonyStep,
  type GpuStartMode,
} from './gpuCeremonyState';

export type { CeremonyStepView, GpuCeremonyStep, GpuStartMode };
export { STEP_LABELS, STEP_SHORT_LABELS };

/** Opaque start ritual: dual-clock pacing; compare unlock requires backend ready. */
export function useGpuStartCeremony(options: {
  sessionActive: boolean;
  backendReady: boolean;
  startMode: GpuStartMode;
  startupCredits?: number;
}) {
  const { sessionActive, backendReady, startMode, startupCredits = 20 } = options;
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const lockedModeRef = useRef<GpuStartMode | null>(null);
  const thresholdsRef = useRef<CeremonyThresholds | null>(null);
  const warmPadRef = useRef(0);
  const readyAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (sessionActive && startedAt === null) {
      lockedModeRef.current = startMode;
      readyAtRef.current = null;
      const isDev = isDevSite(process.env.NEXT_PUBLIC_KINDE_SITE_URL);
      warmPadRef.current = resolveWarmPadMs(isDev);
      thresholdsRef.current = buildCeremonyThresholds(startMode, warmPadRef.current);
      setStartedAt(Date.now());
    }
    if (!sessionActive) {
      setStartedAt(null);
      lockedModeRef.current = null;
      thresholdsRef.current = null;
      warmPadRef.current = 0;
      readyAtRef.current = null;
    }
  }, [sessionActive, startedAt, startMode]);

  useEffect(() => {
    if (!sessionActive || startedAt === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 400);
    return () => window.clearInterval(id);
  }, [sessionActive, startedAt]);

  const elapsedMs = startedAt === null ? 0 : now - startedAt;

  useEffect(() => {
    if (backendReady && readyAtRef.current === null && startedAt !== null) {
      readyAtRef.current = Date.now() - startedAt;
    }
  }, [backendReady, startedAt]);

  const lockedMode = lockedModeRef.current ?? startMode;

  const ceremony = useMemo(() => {
    if (!sessionActive || startedAt === null || !thresholdsRef.current) {
      return {
        step: 0 as GpuCeremonyStep,
        steps: [] as CeremonyStepView[],
        lingerStep: 0,
        ceremonyComplete: false,
        canRunTests: false,
      };
    }

    return computeCeremonyState({
      elapsedMs,
      backendReady,
      startMode: lockedMode,
      warmPadMs: warmPadRef.current,
      thresholds: thresholdsRef.current,
      readyAtMs: readyAtRef.current,
    });
  }, [sessionActive, startedAt, elapsedMs, backendReady, lockedMode]);

  const inCeremony =
    sessionActive && !ceremony.canRunTests && lockedMode !== 'resume';

  const subline =
    lockedMode === 'resume'
      ? 'Resuming your session…'
      : `${startupCredits} credits charged — preparing your session…`;

  return {
    step: ceremony.step,
    steps: ceremony.steps,
    stepLabels: STEP_LABELS,
    canRunTests: sessionActive && ceremony.canRunTests,
    inCeremony,
    subline,
    elapsedMs: sessionActive ? elapsedMs : 0,
    startMode: lockedMode,
  };
}
