'use client';

import React, { useEffect, useState } from 'react';
import { Solution, SolutionType } from '../../types/solution';
import { ProcessingActionCard } from '../TabbedResponse/ProcessingActionCard';
import { TabbedResponseSection } from '../TabbedResponse/index';
import BetaAccessPanel from './BetaAccessPanel';
import BetaFeedbackPanel from './BetaFeedbackPanel';
import BetaFeedbackDeviceBanner from './BetaFeedbackDeviceBanner';
import BetaFeedbackResultNudge from './BetaFeedbackResultNudge';
import type { BetaFeedbackSessionSummary } from '../../lib/apiService';

type RightPanelTab = 'setup' | 'result' | 'feedback';

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

function RightPanelTabButton({
  label,
  active,
  onClick,
  showBadge,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  showBadge?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
        active
          ? 'bg-purple-600 text-white border-b-2 border-purple-400'
          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
      }`}
    >
      {label}
      {showBadge && !active && (
        <span className="absolute right-3 top-2 h-1.5 w-1.5 rounded-full bg-blue-400" aria-hidden />
      )}
    </button>
  );
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
  maskedBase64,
  fileName,
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
  const [activeTab, setActiveTab] = useState<RightPanelTab>('setup');

  const canShowFeedbackForm = Boolean(pendingSession && pendingThumbnails.length > 0);
  const showFeedbackTab = Boolean(
    pendingSession || (hasStartedProcessing && betaEnabled)
  );
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

  useEffect(() => {
    if (hasStartedProcessing) {
      setActiveTab('result');
    } else {
      setActiveTab(canShowFeedbackForm && submitBlocked ? 'feedback' : 'setup');
    }
  }, [hasStartedProcessing, canShowFeedbackForm, submitBlocked]);

  useEffect(() => {
    if (!showFeedbackTab && activeTab === 'feedback') {
      setActiveTab(hasStartedProcessing ? 'result' : 'setup');
    }
  }, [activeTab, showFeedbackTab, hasStartedProcessing]);

  const feedbackPanel =
    canShowFeedbackForm && pendingSession ? (
      <BetaFeedbackPanel
        serviceSlug={serviceSlug}
        solutionType={solutionType}
        session={pendingSession}
        thumbnails={pendingThumbnails}
        credits={credits}
        onSubmitted={onFeedbackSubmitted}
        embedded
      />
    ) : showDeviceBanner ? (
      deviceBanner
    ) : (
      <p className="text-xs text-gray-400">Loading feedback session…</p>
    );

  const resultAddon =
    canShowFeedbackForm && pendingSession ? (
      <BetaFeedbackResultNudge
        creditsToRefund={pendingSession.creditsCharged}
        onOpenFeedback={() => setActiveTab('feedback')}
      />
    ) : null;

  const tabs: { id: RightPanelTab; label: string; show: boolean }[] = hasStartedProcessing
    ? [
        { id: 'setup', label: 'Setup', show: true },
        { id: 'result', label: 'Result', show: true },
        { id: 'feedback', label: 'Feedback', show: showFeedbackTab },
      ]
    : [
        { id: 'setup', label: 'Setup', show: true },
        { id: 'feedback', label: 'Feedback', show: showFeedbackTab },
      ];

  const visibleTabs = tabs.filter((t) => t.show);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 h-full flex flex-col overflow-hidden">
      {visibleTabs.length > 1 && (
        <div className="flex border-b border-gray-700 flex-shrink-0">
          {visibleTabs.map((tab) => (
            <RightPanelTabButton
              key={tab.id}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              showBadge={tab.id === 'feedback' && canShowFeedbackForm}
            />
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'setup' && (
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

        {activeTab === 'result' && hasStartedProcessing && (
          <TabbedResponseSection
            solution={solution}
            solutionType={solutionType}
            data={data}
            loading={loading}
            error={error}
            errorDetails={errorDetails}
            maskedBase64={maskedBase64}
            fileName={fileName}
            compact
            embedded
            resultAddon={resultAddon}
          />
        )}

        {activeTab === 'feedback' && showFeedbackTab && (
          <div className="h-full overflow-y-auto p-3">{feedbackPanel}</div>
        )}
      </div>

      {hasStartedProcessing && (activeTab === 'result' || activeTab === 'feedback') && (
        <div className="flex-shrink-0 border-t border-gray-700 p-3">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800/70 px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-gray-800"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={onReset}
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800/70 px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-gray-800"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
