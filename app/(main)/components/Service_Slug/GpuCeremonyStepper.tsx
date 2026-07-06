'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { CeremonyStepView } from '../../hooks/gpuCeremonyState';

interface GpuCeremonyStepperProps {
  steps: CeremonyStepView[];
}

/** Vertical offset so connectors align with node centers (h-5 = 20px). */
const CONNECTOR_TOP_PX = 9;

/** S2 connector — matches design/gpu-ceremony-preview/stepper.html */
function Connector({ prev, next }: { prev: CeremonyStepView; next: CeremonyStepView }) {
  const done = prev.state === 'done' && next.state !== 'pending';
  const linger = prev.linger;
  const half = prev.state === 'active' && !prev.linger;

  return (
    <div className="relative h-0.5 w-full min-w-[6px] overflow-hidden bg-zinc-700">
      {done && <div className="absolute inset-0 bg-emerald-400" />}
      {!done && half && <div className="absolute inset-y-0 left-0 w-1/2 bg-amber-400" />}
      {!done && linger && (
        <div className="absolute inset-0 animate-[ceremony-slide_1.4s_ease_infinite] bg-gradient-to-r from-amber-400 to-transparent" />
      )}
    </div>
  );
}

function Node({ step }: { step: CeremonyStepView }) {
  const stateClass =
    step.state === 'done'
      ? 'border-emerald-400 bg-emerald-400/15 text-emerald-400'
      : step.state === 'active'
        ? 'border-amber-400 bg-amber-400/20 text-amber-300'
        : 'border-zinc-600 bg-zinc-950 text-zinc-500';

  return (
    <div
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[0.5rem] font-semibold transition-colors ${
        step.linger ? 'animate-pulse' : ''
      } ${stateClass}`}
      aria-label={step.label}
      title={step.label}
    >
      {step.state === 'done' ? (
        <Check className="h-2.5 w-2.5" strokeWidth={3} />
      ) : (
        step.n
      )}
    </div>
  );
}

function labelClass(state: CeremonyStepView['state']): string {
  if (state === 'done') return 'text-emerald-400/80';
  if (state === 'active') return 'font-medium text-amber-100';
  return 'text-zinc-500';
}

/**
 * S2 labeled stepper — design/gpu-ceremony-preview/stepper.html (s2-labeled).
 * Column per step (flex-1); connectors flex between columns on the node row.
 */
export default function GpuCeremonyStepper({ steps }: GpuCeremonyStepperProps) {
  if (steps.length === 0) return null;

  return (
    <div className="w-full py-1">
      <div className="flex w-full items-start">
        {steps.map((step, index) => (
          <React.Fragment key={step.label}>
            {index > 0 && (
              <div
                className="flex min-w-[6px] flex-1 items-center self-start"
                style={{ paddingTop: CONNECTOR_TOP_PX }}
              >
                <Connector prev={steps[index - 1]} next={step} />
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <Node step={step} />
              <span
                className={`mt-1 flex min-h-[2.35em] w-full items-start justify-center px-0.5 text-center text-[10px] leading-[1.2] ${labelClass(
                  step.state
                )}`}
              >
                {step.shortLabel}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
