'use client';

import React, { useState } from 'react';
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
  placement?: 'footer' | 'inline';
}

type WizardStep = 'confirm' | 'correct';

const actionButtonClass =
  'rounded-lg border border-gray-700 bg-gray-800/70 px-3 py-2 text-xs font-medium text-gray-200 transition-colors hover:border-gray-600 hover:bg-gray-800 disabled:opacity-50';

export default function BetaFeedbackPanel({
  serviceSlug,
  solutionType,
  session,
  thumbnails,
  insufficientCredits,
  onSubmitted,
  placement = 'footer',
}: BetaFeedbackPanelProps) {
  const [step, setStep] = useState<WizardStep>('confirm');
  const [expectedClassification, setExpectedClassification] = useState('');
  const [expectedScore, setExpectedScore] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isInline = placement === 'inline';
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

      if (response.creditsRefunded === 0) {
        setSuccessMessage(
          'Feedback submitted. Monthly refund cap reached — no credits were added this time.'
        );
      } else {
        setSuccessMessage(
          `Feedback submitted — ${response.creditsRefunded} credit${response.creditsRefunded === 1 ? '' : 's'} added.`
        );
      }

      window.setTimeout(() => {
        onSubmitted(response.remainingCredits);
      }, 1800);
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
      <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3">
        <p className="text-sm text-blue-200">{successMessage}</p>
      </div>
    );
  }

  const shellClass = isInline
    ? 'bg-blue-900/20 border border-blue-500 rounded-lg p-3 h-full flex flex-col space-y-2 overflow-hidden'
    : 'bg-blue-900/20 border border-blue-500 rounded-lg p-3 space-y-2.5';

  const headerText = insufficientCredits
    ? `Not enough credits to run again. Rate your last test to earn up to ${refundAmount} credits back.`
    : `Rate your last test · earn ${refundAmount} credits back`;

  return (
    <div className={shellClass}>
      <div className="flex-shrink-0">
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <h4 className="text-sm font-semibold text-blue-400">Feedback</h4>
        </div>
        <p className="text-xs text-blue-300">{headerText}</p>
      </div>

      {thumbnails.length > 0 && (
        <div className="flex-shrink-0 space-y-1">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {thumbnails.map((thumb, index) => (
              <img
                key={`${session.id}-${index}`}
                src={thumb.startsWith('data:') ? thumb : `data:image/jpeg;base64,${thumb}`}
                alt={`Test input ${index + 1}`}
                className="h-10 w-10 flex-shrink-0 rounded border border-blue-500/40 object-cover bg-gray-900"
              />
            ))}
          </div>
          <p className="text-[10px] text-blue-300/70">
            Previews kept only on this device.
          </p>
        </div>
      )}

      {session.failureMessage && (
        <div className="rounded border border-red-500/30 bg-red-950/20 px-2 py-1.5 text-[11px] text-red-300">
          {session.failureMessage}
        </div>
      )}

      {hasActual && (
        <div className="rounded border border-blue-500/30 bg-blue-950/20 px-2 py-1.5 text-[11px] text-blue-200/80">
          Model returned:{' '}
          <span className="text-blue-100">
            {actualLabel}
            {actualScore !== null ? ` · ${actualScore.toFixed(1)}%` : ''}
          </span>
        </div>
      )}

      {step === 'confirm' && (
        <div className={`space-y-1.5 ${isInline ? 'flex-1 min-h-0' : ''}`}>
          <p className="text-xs text-blue-200">
            {isFailedRun ? 'Was this error or outcome expected?' : 'Was this API result correct?'}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleConfirmYes()}
              className={actionButtonClass}
            >
              {submitting ? 'Submitting…' : 'Yes, as expected'}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmNo}
              className={actionButtonClass}
            >
              No, I expected something else
            </button>
          </div>
        </div>
      )}

      {step === 'correct' && (
        <form
          onSubmit={(e) => void handleCorrectSubmit(e)}
          className={`space-y-1.5 ${isInline ? 'flex-1 min-h-0 overflow-y-auto pr-0.5' : 'space-y-2'}`}
        >
          <fieldset>
            <legend className="text-[11px] font-medium text-blue-300/80 mb-1">Expected classification</legend>
            <div className="flex flex-wrap gap-1.5">
              {classificationOptions.map((option) => (
                <label
                  key={option.value}
                  className={`inline-flex items-center rounded border px-2 py-1 text-[11px] cursor-pointer ${
                    expectedClassification === option.value
                      ? 'border-blue-500/50 bg-blue-500/15 text-blue-200'
                      : 'border-blue-500/30 bg-blue-950/20 text-blue-200/80'
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
            <label className="text-[11px] font-medium text-blue-300/80 block mb-1">
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
              className="w-full rounded-md border border-blue-500/30 bg-gray-900/60 px-2.5 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:border-blue-500/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-blue-300/80 block mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else we should know?"
              rows={isInline ? 1 : 2}
              className="w-full rounded-md border border-blue-500/30 bg-gray-900/60 px-2.5 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:border-blue-500/40 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep('confirm')}
              className="text-[11px] text-blue-300/70 hover:text-blue-200"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400`}
            >
              {submitting ? 'Submitting…' : `Submit & earn ${refundAmount} credits`}
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
