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
    failed: 'Not-Detected',
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

export interface VerificationActualResult {
  classification?: string;
  similarity_percentage?: number;
}

/** Pull classification + score from a live Try API response payload. */
export function extractVerificationFromApiResponse(
  data: unknown,
  solutionType: SolutionType
): VerificationActualResult | null {
  if (!data || typeof data !== 'object') return null;

  const record = data as Record<string, unknown>;
  let verificationData: Record<string, unknown> | null = null;

  if (solutionType === 'signature-verification' && record.verification_result) {
    const vr = record.verification_result as Record<string, unknown>;
    if (vr.data && typeof vr.data === 'object') {
      verificationData = vr.data as Record<string, unknown>;
    }
  } else if (solutionType === 'face-verify' && record.faceResult) {
    const fr = record.faceResult as Record<string, unknown>;
    if (Array.isArray(fr.data) && fr.data[0] && typeof fr.data[0] === 'object') {
      verificationData = fr.data[0] as Record<string, unknown>;
    }
  }

  if (!verificationData) return null;

  const classification =
    typeof verificationData.classification === 'string' ? verificationData.classification : undefined;
  const scoreKey = Object.keys(verificationData).find(
    (k) => k.toLowerCase().includes('similarity') || k.toLowerCase().includes('percentage')
  );
  const rawScore = scoreKey ? verificationData[scoreKey] : undefined;
  const similarity_percentage =
    typeof rawScore === 'number' ? rawScore : typeof rawScore === 'string' ? Number(rawScore) : undefined;

  return {
    classification,
    similarity_percentage: Number.isFinite(similarity_percentage) ? similarity_percentage : undefined,
  };
}
