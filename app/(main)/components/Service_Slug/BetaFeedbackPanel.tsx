'use client';

import React, { useState } from 'react';
import { MessageSquareText } from 'lucide-react';
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
  credits: number | null;
  onSubmitted: (remainingCredits: number) => void;
  embedded?: boolean;
  variant?: 'default' | 'embedded' | 'integrated';
}

type WizardStep = 'confirm' | 'correct';

export default function BetaFeedbackPanel({
  serviceSlug,
  solutionType,
  session,
  thumbnails,
  credits,
  onSubmitted,
  embedded = false,
  variant,
}: BetaFeedbackPanelProps) {
  const panelVariant = variant ?? (embedded ? 'embedded' : 'default');
  const [step, setStep] = useState<WizardStep>('confirm');
  const [expectedClassification, setExpectedClassification] = useState('');
  const [expectedScore, setExpectedScore] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const zeroCredits = credits === 0;
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

  const submitFeedback = async (payload: BetaFeedbackExpectedResult) => {
    try {
      setSubmitting(true);
      setError(null);
      const response = await apiService.submitBetaFeedback(session.id, payload);
      onSubmitted(response.remainingCredits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
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

  const shellClass =
    panelVariant === 'integrated'
      ? 'space-y-3'
      : panelVariant === 'embedded'
        ? 'space-y-2.5'
        : 'rounded-lg border border-gray-700/80 bg-gray-900/40 px-3 py-3 space-y-2.5';

  return (
    <div className={shellClass}>
      {panelVariant === 'integrated' ? (
        <div className="border-b border-gray-700/60 pb-2">
          <p className="text-sm font-medium text-gray-200">
            {zeroCredits ? 'Earn credits to keep testing' : 'Rate this result'}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Was the API outcome correct? Submit feedback for a {refundAmount}-credit refund.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/15 flex-shrink-0">
            <MessageSquareText className="h-3.5 w-3.5 text-blue-400" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-200">
              {zeroCredits ? 'Earn credits to keep testing' : 'Help improve your custom model'}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Share feedback on this test — we&apos;ll credit back {refundAmount} credits. We store the
              feedback you submit, not your uploaded documents.
            </p>
          </div>
        </div>
      )}

      {thumbnails.length > 0 && panelVariant !== 'integrated' && (
        <div className="space-y-1">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {thumbnails.map((thumb, index) => (
              <img
                key={`${session.id}-${index}`}
                src={thumb.startsWith('data:') ? thumb : `data:image/jpeg;base64,${thumb}`}
                alt={`Test input ${index + 1}`}
                className="h-12 w-12 flex-shrink-0 rounded border border-gray-700 object-cover bg-gray-900"
              />
            ))}
          </div>
          <p className="text-[10px] text-gray-500">
            Previews are kept only on this device. Documents are not stored on our servers.
          </p>
        </div>
      )}

      {session.failureMessage && (
        <div className="rounded border border-red-500/30 bg-red-950/20 px-2 py-1.5 text-[11px] text-red-300">
          {session.failureMessage}
        </div>
      )}

      {hasActual && (
        <div className="rounded border border-gray-700/60 bg-gray-800/40 px-2 py-1.5 text-[11px] text-gray-400">
          Model returned:{' '}
          <span className="text-gray-200">
            {actualLabel}
            {actualScore !== null ? ` · ${actualScore.toFixed(1)}%` : ''}
          </span>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-2">
          <p className="text-xs text-gray-300">
            {isFailedRun
              ? 'Was this error or outcome expected?'
              : 'Was this API result correct?'}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleConfirmYes()}
              className="rounded-md border border-blue-500/40 bg-blue-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Yes, as expected'}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmNo}
              className="rounded-md border border-gray-600 bg-gray-800/60 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-gray-800 disabled:opacity-50"
            >
              No, I expected something else
            </button>
          </div>
        </div>
      )}

      {step === 'correct' && (
        <form onSubmit={(e) => void handleCorrectSubmit(e)} className="space-y-2">
          <fieldset>
            <legend className="text-[11px] font-medium text-gray-400 mb-1">Expected classification</legend>
            <div className="flex flex-wrap gap-1.5">
              {classificationOptions.map((option) => (
                <label
                  key={option.value}
                  className={`inline-flex items-center rounded border px-2 py-1 text-[11px] cursor-pointer ${
                    expectedClassification === option.value
                      ? 'border-blue-500/50 bg-blue-500/15 text-blue-200'
                      : 'border-gray-700 bg-gray-900/40 text-gray-300'
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
            <label className="text-[11px] font-medium text-gray-400 block mb-1">
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
              className="w-full rounded-md border border-gray-700 bg-gray-900/60 px-2.5 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:border-blue-500/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-gray-400 block mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else we should know?"
              rows={2}
              className="w-full rounded-md border border-gray-700 bg-gray-900/60 px-2.5 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:border-blue-500/40 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep('confirm')}
              className="text-[11px] text-gray-500 hover:text-gray-300"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                zeroCredits
                  ? 'bg-amber-500/90 text-gray-900 hover:bg-amber-400'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              {submitting ? 'Submitting…' : `Submit & earn ${refundAmount} credits`}
            </button>
          </div>
        </form>
      )}

      {error && step === 'confirm' && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
