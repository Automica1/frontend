import { describe, expect, it } from 'vitest';
import { getExtraResourceCopy } from '../../lib/extraResourceCopy';
import { destroyCountdownCopy, formatGpuCountdown } from './gpuPoolCountdownCopy';

const copy = getExtraResourceCopy();

describe('gpuPoolCountdownCopy', () => {
  it('does not tell users to keep a resource running when shutdown is already due', () => {
    expect(
      destroyCountdownCopy({
        secondsToDestroy: 0,
        drainReason: 'user_grace',
        copy,
      })
    ).toBe('It is due to shut down now. Start again to request it.');
  });

  it('keeps the positive grace countdown copy before shutdown is due', () => {
    expect(
      destroyCountdownCopy({
        secondsToDestroy: 61,
        drainReason: 'user_grace',
        copy,
      })
    ).toContain('1m 1s');
  });

  it('formats countdowns compactly', () => {
    expect(formatGpuCountdown(9)).toBe('9s');
    expect(formatGpuCountdown(65)).toBe('1m 5s');
  });
});
