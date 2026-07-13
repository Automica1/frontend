import type { ExtraResourceCopy } from '../../lib/extraResourceCopy';

export function formatGpuCountdown(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function destroyCountdownCopy(input: {
  secondsToDestroy: number | null;
  drainReason?: 'user_grace' | 'admin_grace' | null;
  copy: ExtraResourceCopy;
}): string | null {
  if (input.secondsToDestroy === null) return null;
  if (input.secondsToDestroy <= 0) return input.copy.shutdownDue;
  if (input.drainReason === 'admin_grace') {
    return `${input.copy.retiredCountdown} ${formatGpuCountdown(input.secondsToDestroy)}.`;
  }
  return `${input.copy.shutdownCountdown} ${formatGpuCountdown(input.secondsToDestroy)} — Start session again to keep it running.`;
}
