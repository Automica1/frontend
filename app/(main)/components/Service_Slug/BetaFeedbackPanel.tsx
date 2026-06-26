'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
  apiService,
  type BetaFeedbackExpectedResult,
  type BetaFeedbackSessionSummary,
} from '../../lib/apiService';
import {
  formatClassificationLabel,
  getClassificationOptions,
  normalizeClassificationForSubmit,
} from '../../lib/betaFeedbackConfig';
import type { SolutionType } from '../../types/solution';

interface BetaFeedbackPanelProps {
  serviceSlug: string;
  solutionType: SolutionType;
  session: BetaFeedbackSessionSummary;
  thumbnails: string[];
  insufficientCredits: boolean;
  onSubmitted: (remainingCredits: number) => void;
  context?: 'setup' | 'post-run';
}

type WizardStep = 'confirm' | 'correct';

const actionButtonClass =
  'rounded-lg border border-gray-700 bg-gray-800/70 px-4 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:border-gray-600 hover:bg-gray-800 disabled:opacity-50';

const fieldClass =
  'w-full rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:border-gray-600 focus:outline-none';

export default function BetaFeedbackPanel({
  serviceSlug,
  solutionType,
  session,
  thumbnails,
  insufficientCredits,
  onSubmitted,
  context = 'post-run',
}: BetaFeedbackPanelProps) {
  const [step, setStep] = useState<WizardStep>('confirm');
  const [expectedClassification, setExpectedClassification] = useState('');
  const [expectedScore, setExpectedScore] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refundAmount = session.creditsCharged;
  const classificationOptions = getClassificationOptions(solutionType);
  const hasActual = Boolean(session.actualResult?.classification);
  const isFailedRun = session.runOutcome === 'failed' && !hasActual;

  const actualLabel = session.actualResult?.classification
    ? formatClassificationLabel(session.actualResult.classification)
    : null;
  const actualScore =
    typeof session.actualResult?.similarity_percentage === 'number'
      ? session.actualResult.similarity_percentage
      : null;

  const getStatusColor = (classification: string) => {
    const lower = classification?.toLowerCase();
    if (lower === 'genuine' || lower === 'match') return 'text-green-400';
    if (lower === 'fake' || lower === 'forged' || lower === 'no match') return 'text-red-400';
    return 'text-yellow-400';
  };

  const getStatusIcon = (classification: string) => {
    const lower = classification?.toLowerCase();
    if (lower === 'genuine' || lower === 'match') return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (lower === 'fake' || lower === 'forged' || lower === 'no match') return <XCircle className="w-5 h-5 text-red-400" />;
    return <AlertCircle className="w-5 h-5 text-yellow-400" />;
  };

  const submitFeedback = async (payload: BetaFeedbackExpectedResult) => {
    try {
      setSubmitting(true);
      setError(null);
      const response = await apiService.submitBetaFeedback(session.id, payload);

      if (response.creditsRefunded === 0) {
        setSuccessMessage('Feedback saved. Monthly refund limit reached — no credits were added.');
      } else {
        setSuccessMessage(
          `Feedback submitted — ${response.creditsRefunded} credit${response.creditsRefunded === 1 ? '' : 's'} added.`
        );
      }

      window.setTimeout(() => {
        onSubmitted(response.remainingCredits);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
      setSubmitting(false);
    }
  };

  const handleConfirmYes = async () => {
    if (hasActual && session.actualResult?.classification) {
      const classification = normalizeClassificationForSubmit(session.actualResult.classification);
      const payload: BetaFeedbackExpectedResult = {
        expectedClassification: classification,
        responseAsExpected: true,
      };
      if (actualScore !== null) {
        payload.expectedSimilarityMin = actualScore;
        payload.expectedSimilarityMax = actualScore;
      }
      await submitFeedback(payload);
      return;
    }

    if (isFailedRun) {
      await submitFeedback({
        expectedClassification: 'Not-Detected',
        responseAsExpected: true,
        notes: notes.trim() || undefined,
      });
    }
  };

  const handleConfirmNo = () => {
    setStep('correct');
    setError(null);
  };

  const handleCorrectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expectedClassification) {
      setError('Please select the classification you expected.');
      return;
    }
    if (!expectedScore.trim()) {
      setError('Please enter the similarity score you expected (0–100).');
      return;
    }
    const score = Number(expectedScore);
    if (Number.isNaN(score) || score < 0 || score > 100) {
      setError('Similarity score must be between 0 and 100.');
      return;
    }

    await submitFeedback({
      expectedClassification: normalizeClassificationForSubmit(expectedClassification),
      expectedSimilarityMin: score,
      expectedSimilarityMax: score,
      notes: notes.trim() || undefined,
      responseAsExpected: false,
    });
  };

  if (successMessage) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
        <p className="text-sm text-gray-200">{successMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insufficientCredits && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-950/20 px-4 py-3">
          <p className="text-sm text-amber-100">
            You have <span className="font-semibold">0 credits</span>.{' '}
            <Link href="/credits" className="text-amber-200 underline hover:text-white">
              Buy credits
            </Link>{' '}
            or submit feedback below to earn up to {refundAmount} credits back.
          </p>
        </div>
      )}

      {!insufficientCredits && context === 'setup' && (
        <p className="text-sm text-gray-400">
          Rate your previous test · earn {refundAmount} credits back.
        </p>
      )}

      {context === 'post-run' && hasActual && actualLabel && (
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-2">Model result</p>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {getStatusIcon(actualLabel)}
              <span className={`text-base font-semibold ${getStatusColor(actualLabel)}`}>{actualLabel}</span>
            </div>
            {actualScore !== null && (
              <span className="text-lg font-semibold text-blue-400 tabular-nums">{actualScore.toFixed(1)}%</span>
            )}
          </div>
        </div>
      )}

      {session.failureMessage && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2 text-sm text-red-300">
          {session.failureMessage}
        </div>
      )}

      {thumbnails.length > 0 && context === 'setup' && (
        <div className="flex gap-2">
          {thumbnails.map((thumb, index) => (
            <img
              key={`${session.id}-${index}`}
              src={thumb.startsWith('data:') ? thumb : `data:image/jpeg;base64,${thumb}`}
              alt={`Test input ${index + 1}`}
              className="h-12 w-12 rounded-lg border border-gray-700 object-cover bg-gray-900"
            />
          ))}
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-white">
            {isFailedRun ? 'Was this error or outcome expected?' : 'Was this result correct?'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleConfirmYes()}
              className={`${actionButtonClass} sm:flex-1`}
            >
              {submitting ? 'Submitting…' : 'Yes, as expected'}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmNo}
              className={`${actionButtonClass} sm:flex-1`}
            >
              No, I expected something else
            </button>
          </div>
        </div>
      )}

      {step === 'correct' && (
        <form onSubmit={(e) => void handleCorrectSubmit(e)} className="space-y-3">
          <fieldset>
            <legend className="text-sm font-medium text-gray-300 mb-2">Expected classification</legend>
            <div className="flex flex-wrap gap-2">
              {classificationOptions.map((option) => (
                <label
                  key={option.value}
                  className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm cursor-pointer ${
                    expectedClassification === option.value
                      ? 'border-gray-500 bg-gray-700 text-white'
                      : 'border-gray-700 bg-gray-800/60 text-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`expected-${serviceSlug}`}
                    value={option.value}
                    checked={expectedClassification === option.value}
                    onChange={() => setExpectedClassification(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">
              Expected similarity % <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={expectedScore}
              onChange={(e) => setExpectedScore(e.target.value)}
              placeholder="0–100"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else we should know?"
              rows={2}
              className={`${fieldClass} resize-none`}
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep('confirm')}
              className="text-sm text-gray-500 hover:text-gray-300"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : `Submit & earn ${refundAmount} credits`}
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
