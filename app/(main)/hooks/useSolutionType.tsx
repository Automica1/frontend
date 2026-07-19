// hooks/useSolutionType.ts
import { useMemo } from 'react';
import { SolutionType } from '../types/solution';

type SolutionLike = {
  slug?: string;
  title: string;
};

export function resolveSolutionType({ slug, title }: SolutionLike): SolutionType {
  const normalizedSlug = slug?.toLowerCase();
  const normalizedTitle = title.toLowerCase();

  if (normalizedSlug === 'qr-extract' || normalizedTitle.includes('qr extract')) {
    return 'qr-extract';
  }
  if (
    normalizedSlug === 'qr-mask' ||
    normalizedSlug === 'qr-masking' ||
    normalizedTitle.includes('qr mask')
  ) {
    return 'qr-mask';
  }
  if (normalizedSlug === 'signature-verification' || normalizedTitle.includes('signature verification')) {
    return 'signature-verification';
  }
  if (normalizedSlug === 'id-crop' || normalizedSlug === 'id-cropping' || normalizedTitle.includes('id crop')) {
    return 'id-crop';
  }
  if (normalizedSlug === 'document-enhancement' || normalizedTitle.includes('document enhancement')) {
    return 'document-enhancement';
  }
  if (normalizedSlug === 'ocr' || normalizedTitle.includes('ocr')) {
    return 'ocr';
  }
  if (normalizedSlug === 'face-verify' || normalizedSlug === 'face-verification' || normalizedTitle.includes('face verify')) {
    return 'face-verify';
  }
  if (normalizedSlug === 'face-cropping' || normalizedSlug === 'face-crop' || normalizedTitle.includes('face crop')) {
    return 'face-cropping';
  }

  return 'unknown';
}

export const useSolutionType = (solution: SolutionLike): SolutionType => {
  return useMemo(() => {
    return resolveSolutionType(solution);
  }, [solution.slug, solution.title]);
};
