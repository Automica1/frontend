import { describe, expect, it } from 'vitest';
import { resolveSolutionType } from './useSolutionType';

describe('resolveSolutionType', () => {
  it('maps qr-masking slug to the qr-mask canonical solution type', () => {
    expect(resolveSolutionType({ slug: 'qr-masking', title: 'QR Masking' })).toBe('qr-mask');
  });

  it('keeps qr-mask slug on the same canonical solution type', () => {
    expect(resolveSolutionType({ slug: 'qr-mask', title: 'QR Mask' })).toBe('qr-mask');
  });

  it('falls back to title matching for qr masking pages', () => {
    expect(resolveSolutionType({ title: 'Enterprise QR Masking API' })).toBe('qr-mask');
  });
});
