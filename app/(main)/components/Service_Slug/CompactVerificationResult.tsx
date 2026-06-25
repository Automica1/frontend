'use client';

import React from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import type { SolutionType } from '../../types/solution';
import { formatClassificationLabel } from '../../lib/betaFeedbackConfig';

interface CompactVerificationResultProps {
  data: unknown;
  solutionType: SolutionType;
  error?: string | null;
  errorDetails?: { technical_message?: string; status?: string } | null;
}

function getStatusStyles(classification: string) {
  const lower = classification.toLowerCase();
  if (lower === 'genuine' || lower === 'match') {
    return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' };
  }
  if (lower === 'fake' || lower === 'forged' || lower === 'no match') {
    return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' };
  }
  return { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
}

function extractVerificationData(data: unknown, solutionType: SolutionType) {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  if (solutionType === 'face-verify' && record.faceResult && typeof record.faceResult === 'object') {
    const face = record.faceResult as { data?: Record<string, unknown> };
    return face.data ?? null;
  }
  if (
    solutionType === 'signature-verification' &&
    record.verification_result &&
    typeof record.verification_result === 'object'
  ) {
    const verify = record.verification_result as { data?: Record<string, unknown> };
    return verify.data ?? null;
  }
  return null;
}

export default function CompactVerificationResult({
  data,
  solutionType,
  error,
  errorDetails,
}: CompactVerificationResultProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-3">
        <p className="text-sm font-medium text-red-300">Request failed</p>
        <p className="mt-1 text-xs text-red-200/80 leading-relaxed">{error}</p>
        {errorDetails?.technical_message && (
          <p className="mt-2 text-[11px] text-gray-400">{errorDetails.technical_message}</p>
        )}
      </div>
    );
  }

  const verificationData = extractVerificationData(data, solutionType);
  if (!verificationData) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800/40 px-3 py-3 text-xs text-gray-400">
        No result data available.
      </div>
    );
  }

  const classification = String(verificationData.classification ?? 'Unknown');
  const label = formatClassificationLabel(classification);
  const scoreKey = Object.keys(verificationData).find((k) =>
    k.toLowerCase().includes('similarity') || k.toLowerCase().includes('percentage')
  );
  const score = scoreKey ? verificationData[scoreKey] : null;
  const styles = getStatusStyles(classification);
  const Icon = styles.icon;

  return (
    <div className={`rounded-lg border px-3 py-3 ${styles.bg}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={`h-5 w-5 flex-shrink-0 ${styles.color}`} />
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${styles.color}`}>{label}</p>
            <p className="text-[11px] text-gray-400">
              {solutionType === 'signature-verification' ? 'Signature verification' : 'Face verification'}
            </p>
          </div>
        </div>
        {score !== null && score !== undefined && (
          <p className="text-lg font-semibold text-white tabular-nums flex-shrink-0">
            {typeof score === 'number' ? score.toFixed(1) : String(score)}%
          </p>
        )}
      </div>
    </div>
  );
}
