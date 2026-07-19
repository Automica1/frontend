import type { SolutionType } from '../types/solution';

/** Credit cost per Try API run — must match backend handlers. */
const SERVICE_RUN_COSTS: Record<SolutionType, number> = {
  'signature-verification': 2,
  'face-verify': 2,
  'qr-extract': 1,
  'qr-mask': 1,
  'id-crop': 1,
  'document-enhancement': 1,
  'ocr': 4,
  'face-cropping': 1,
  unknown: 1,
};

export function getServiceRunCost(solutionType: SolutionType): number {
  return SERVICE_RUN_COSTS[solutionType] ?? 1;
}
