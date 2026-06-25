'use client';

import React, { useState } from 'react';
import { MessageSquareText, Sparkles } from 'lucide-react';
import { apiService, type BetaFeedbackExpectedResult, type BetaFeedbackSessionSummary } from '../../lib/apiService';

interface BetaFeedbackPanelProps {
  serviceSlug: string;
  session: BetaFeedbackSessionSummary;
  thumbnails: string[];
  credits: number | null;
  onSubmitted: (remainingCredits: number) => void;
  compact?: boolean;
}

const classificationOptions = [
  { value: 'match', label: 'Match' },
  { value: 'no_match', label: 'No match' },
  { value: 'uncertain', label: 'Uncertain' },
] as const;

export default function BetaFeedbackPanel({
  serviceSlug,
  session,
  thumbnails,
  credits,
  onSubmitted,
  compact = false,
}: BetaFeedbackPanelProps) {
  const [expectedClassification, setExpectedClassification] = useState('');
  const [similarityMin, setSimilarityMin] = useState('');
  const [similarityMax, setSimilarityMax] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const zeroCredits = credits === 0;
  const refundAmount = session.creditsCharged;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expectedClassification) {
      setError('Please select what you expected the model to return.');
      return;
    }

    const expectedResult: BetaFeedbackExpectedResult = {
      expectedClassification,
      notes: notes.trim() || undefined,
    };

    if (similarityMin.trim()) {
      const parsed = Number(similarityMin);
      if (!Number.isNaN(parsed)) {
        expectedResult.expectedSimilarityMin = parsed;
      }
    }
    if (similarityMax.trim()) {
      const parsed = Number(similarityMax);
      if (!Number.isNaN(parsed)) {
        expectedResult.expectedSimilarityMax = parsed;
      }
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await apiService.submitBetaFeedback(session.id, expectedResult);
      onSubmitted(response.remainingCredits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-lg border ${
        zeroCredits ? 'border-amber-500/40 bg-amber-950/20' : 'border-blue-500/30 bg-blue-900/15'
      } px-3 py-3 space-y-3`}
    >
      <div className="flex items-start gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-md ${
            zeroCredits ? 'bg-amber-500/20' : 'bg-blue-500/20'
          }`}
        >
          {zeroCredits ? (
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <MessageSquareText className="h-3.5 w-3.5 text-blue-400" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${zeroCredits ? 'text-amber-200' : 'text-blue-200'}`}>
            Help improve your custom model
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Share what you expected — we&apos;ll credit back what you spent on this test ({refundAmount} credits).
          </p>
        </div>
      </div>

      {!compact && thumbnails.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {thumbnails.map((thumb, index) => (
            <img
              key={`${session.id}-${index}`}
              src={thumb.startsWith('data:') ? thumb : `data:image/jpeg;base64,${thumb}`}
              alt={`Test input ${index + 1}`}
              className="h-16 w-16 flex-shrink-0 rounded-md border border-gray-700 object-cover bg-gray-900"
            />
          ))}
        </div>
      )}

      {session.actualResult && (
        <div className="rounded-md border border-gray-700/80 bg-gray-900/50 px-2.5 py-2 text-xs text-gray-400">
          Model returned:{' '}
          <span className="text-gray-200">
            {session.actualResult.classification || 'n/a'}
            {typeof session.actualResult.similarity_percentage === 'number'
              ? ` · ${session.actualResult.similarity_percentage.toFixed(1)}%`
              : ''}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <fieldset>
          <legend className="text-xs font-medium text-gray-300 mb-1.5">Expected result</legend>
          <div className="flex flex-wrap gap-2">
            {classificationOptions.map((option) => (
              <label
                key={option.value}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs cursor-pointer ${
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

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={similarityMin}
            onChange={(e) => setSimilarityMin(e.target.value)}
            placeholder="Min similarity % (optional)"
            className="w-full rounded-md border border-gray-700 bg-gray-900/60 px-2.5 py-2 text-xs text-gray-200 placeholder:text-gray-500 focus:border-blue-500/40 focus:outline-none"
          />
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={similarityMax}
            onChange={(e) => setSimilarityMax(e.target.value)}
            placeholder="Max similarity % (optional)"
            className="w-full rounded-md border border-gray-700 bg-gray-900/60 px-2.5 py-2 text-xs text-gray-200 placeholder:text-gray-500 focus:border-blue-500/40 focus:outline-none"
          />
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          className="w-full rounded-md border border-gray-700 bg-gray-900/60 px-2.5 py-2 text-xs text-gray-200 placeholder:text-gray-500 focus:border-blue-500/40 focus:outline-none resize-none"
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
            zeroCredits
              ? 'bg-amber-500/90 text-gray-900 hover:bg-amber-400'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          {submitting ? 'Submitting…' : `Submit & earn ${refundAmount} credits back`}
        </button>
      </form>
    </div>
  );
}
