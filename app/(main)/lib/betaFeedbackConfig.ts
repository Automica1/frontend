import type { SolutionType } from '../types/solution';

export interface ClassificationOption {
  value: string;
  label: string;
}

const signatureVerificationClassifications: ClassificationOption[] = [
  { value: 'Genuine', label: 'Genuine' },
  { value: 'Forged', label: 'Forged' },
  { value: 'Manual Review', label: 'Manual Review' },
  { value: 'Not-Detected', label: 'Not-Detected' },
];

const classificationBySolution: Partial<Record<SolutionType, ClassificationOption[]>> = {
  'signature-verification': signatureVerificationClassifications,
};

export function getClassificationOptions(solutionType: SolutionType): ClassificationOption[] {
  return classificationBySolution[solutionType] ?? signatureVerificationClassifications;
}

export function formatClassificationLabel(value?: string | null): string {
  if (!value) return '—';
  const normalized = value.trim();
  const legacy: Record<string, string> = {
    match: 'Genuine',
    no_match: 'Forged',
    uncertain: 'Manual Review',
  };
  if (legacy[normalized.toLowerCase()]) {
    return legacy[normalized.toLowerCase()];
  }
  return normalized;
}

export function normalizeClassificationForSubmit(value: string): string {
  const trimmed = value.trim();
  const legacyMap: Record<string, string> = {
    match: 'Genuine',
    no_match: 'Forged',
    uncertain: 'Manual Review',
  };
  const lower = trimmed.toLowerCase();
  if (legacyMap[lower]) return legacyMap[lower];
  const options = signatureVerificationClassifications;
  const match = options.find((o) => o.value.toLowerCase() === lower);
  return match?.value ?? trimmed;
}

export function classificationsMatch(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  return normalizeClassificationForSubmit(a).toLowerCase() === normalizeClassificationForSubmit(b).toLowerCase();
}
