'use client';

import React from 'react';
import { Solution, SolutionType } from '../../types/solution';
import { ProcessingActionCard } from '../TabbedResponse/ProcessingActionCard';
import BetaAccessPanel from './BetaAccessPanel';
import BetaFeedbackPanel from './BetaFeedbackPanel';
import BetaFeedbackDeviceBanner from './BetaFeedbackDeviceBanner';
import BetaRunResultsPanel from './BetaRunResultsPanel';
import type { BetaFeedbackSessionSummary } from '../../lib/apiService';

interface TryAPIRightPanelProps {
  solution: Solution;
  solutionType: SolutionType;
  files: File[];
  hasStartedProcessing: boolean;
  loading: boolean;
  data: unknown;
  error: string | null;
  errorDetails: unknown;
  maskedBase64?: string;
  fileName?: string;
  betaEnabled: boolean;
  betaKey: string;
  onBetaEnabledChange: (enabled: boolean) => void;
  onBetaKeyChange: (key: string) => void;
  onSubmit: () => void;
  onRetry: () => void;
  onReset: () => void;
  submitBlocked: boolean;
  submitBlockedMessage?: string;
  pendingSession: BetaFeedbackSessionSummary | null;
  pendingThumbnails: string[];
  credits: number | null;
  onFeedbackSubmitted: (remainingCredits: number) => void;
  serviceSlug: string;
}

export default function TryAPIRightPanel({
  solution,
  solutionType,
  files,
  hasStartedProcessing,
  loading,
  data,
  error,
  errorDetails,
  betaEnabled,
  betaKey,
  onBetaEnabledChange,
  onBetaKeyChange,
  onSubmit,
  onRetry,
  onReset,
  submitBlocked,
  submitBlockedMessage,
  pendingSession,
  pendingThumbnails,
  credits,
  onFeedbackSubmitted,
  serviceSlug,
}: TryAPIRightPanelProps) {
  const canShowFeedbackForm = Boolean(pendingSession && pendingThumbnails.length > 0);
  const showDeviceBanner = Boolean(pendingSession && pendingThumbnails.length === 0);
  const deviceBanner = showDeviceBanner ? <BetaFeedbackDeviceBanner compact /> : undefined;

  const betaControls =
    solution.hasBeta && solution.slug ? (
      <BetaAccessPanel
        serviceSlug={solution.slug}
        enabled={betaEnabled}
        betaKey={betaKey}
        onEnabledChange={onBetaEnabledChange}
        onBetaKeyChange={onBetaKeyChange}
        variant="inline"
      />
    ) : undefined;

  const feedbackPanel =
    canShowFeedbackForm && pendingSession ? (
      <BetaFeedbackPanel
        serviceSlug={serviceSlug}
        solutionType={solutionType}
        session={pendingSession}
        thumbnails={pendingThumbnails}
        credits={credits}
        onSubmitted={onFeedbackSubmitted}
        variant="integrated"
      />
    ) : null;

  const showPendingFeedbackGate = !hasStartedProcessing && submitBlocked && canShowFeedbackForm;

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 h-full flex flex-col overflow-hidden">
      {hasStartedProcessing ? (
        <BetaRunResultsPanel
          solutionType={solutionType}
          data={data}
          loading={loading}
          error={error}
          errorDetails={
            errorDetails as { technical_message?: string; status?: string } | null | undefined
          }
          pendingSession={pendingSession}
          pendingThumbnails={pendingThumbnails}
          credits={credits}
          canShowFeedbackForm={canShowFeedbackForm}
          showDeviceBanner={showDeviceBanner}
          serviceSlug={serviceSlug}
          onFeedbackSubmitted={onFeedbackSubmitted}
          onRetry={onRetry}
          onReset={onReset}
        />
      ) : showPendingFeedbackGate ? (
        <div className="flex flex-col h-full min-h-0">
          <div className="flex-shrink-0 border-b border-amber-500/20 bg-amber-950/20 px-3 py-2">
            <p className="text-xs text-amber-200">
              Rate your last test to earn credits back and continue testing.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3">{feedbackPanel}</div>
        </div>
      ) : (
        <ProcessingActionCard
          solution={solution}
          solutionType={solutionType}
          files={files}
          onSubmit={onSubmit}
          loading={loading}
          submitBlocked={submitBlocked}
          submitBlockedMessage={submitBlockedMessage}
          deviceBanner={deviceBanner}
          compact
          betaControls={betaControls}
        />
      )}
    </div>
  );
}
