'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SolutionType } from '../../types/solution';
import type { BetaFeedbackSessionSummary } from '../../lib/apiService';
import CompactVerificationResult from './CompactVerificationResult';
import BetaFeedbackPanel from './BetaFeedbackPanel';
import BetaFeedbackDeviceBanner from './BetaFeedbackDeviceBanner';

interface BetaRunResultsPanelProps {
  solutionType: SolutionType;
  data: unknown;
  loading: boolean;
  error: string | null;
  errorDetails?: { technical_message?: string; status?: string } | null;
  pendingSession: BetaFeedbackSessionSummary | null;
  pendingThumbnails: string[];
  credits: number | null;
  canShowFeedbackForm: boolean;
  showDeviceBanner: boolean;
  serviceSlug: string;
  onFeedbackSubmitted: (remainingCredits: number) => void;
  onRetry: () => void;
  onReset: () => void;
}

export default function BetaRunResultsPanel({
  solutionType,
  data,
  loading,
  error,
  errorDetails,
  pendingSession,
  pendingThumbnails,
  credits,
  canShowFeedbackForm,
  showDeviceBanner,
  serviceSlug,
  onFeedbackSubmitted,
  onRetry,
  onReset,
}: BetaRunResultsPanelProps) {
  const [apiOpen, setApiOpen] = useState(false);

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin" />
            <p className="text-sm text-gray-400">Processing…</p>
          </div>
        ) : (
          <>
            <CompactVerificationResult
              data={data}
              solutionType={solutionType}
              error={error}
              errorDetails={errorDetails}
            />

            {showDeviceBanner && <BetaFeedbackDeviceBanner compact />}

            {canShowFeedbackForm && pendingSession && (
              <div className="rounded-lg border border-gray-700/70 bg-gray-800/25 p-3">
                <BetaFeedbackPanel
                serviceSlug={serviceSlug}
                solutionType={solutionType}
                session={pendingSession}
                thumbnails={pendingThumbnails}
                credits={credits}
                onSubmitted={onFeedbackSubmitted}
                variant="integrated"
              />
              </div>
            )}

            {!canShowFeedbackForm && pendingSession && !showDeviceBanner && (
              <p className="text-xs text-gray-500 text-center py-2">Preparing feedback…</p>
            )}

            {data && (
              <div className="border-t border-gray-800 pt-1">
                <button
                  type="button"
                  onClick={() => setApiOpen((open) => !open)}
                  className="flex w-full items-center justify-between py-2 text-xs text-gray-500 hover:text-gray-300"
                >
                  <span>API response</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${apiOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {apiOpen && (
                  <pre className="max-h-36 overflow-auto rounded-md border border-gray-800 bg-gray-950/60 p-2 text-[10px] leading-relaxed text-gray-400">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-gray-700 p-3">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onRetry}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800/70 px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-gray-800 disabled:opacity-50"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800/70 px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-gray-800 disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
