'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  sublabel,
  active,
  onClick,
  highlight,
}: {
  label: string;
  sublabel?: string;
  active: boolean;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 px-2 py-2 text-xs font-medium transition-colors ${
        active
          ? 'bg-purple-600 text-white border-b-2 border-purple-400'
          : highlight
            ? 'text-blue-200 bg-blue-950/50 border-b-2 border-blue-500/60 animate-pulse hover:bg-blue-950/70'
            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
      }`}
    >
      <span className="block truncate">{label}</span>
      {sublabel && (
        <span
          className={`mt-0.5 block truncate text-[10px] font-semibold ${
            active ? 'text-blue-100' : highlight ? 'text-blue-300' : 'text-gray-500'
          }`}
        >
          {sublabel}
        </span>
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
  const autoOpenedForSessionRef = useRef<string | null>(null);
  const userLeftFeedbackRef = useRef(false);

  const canShowFeedbackForm = Boolean(pendingSession && pendingThumbnails.length > 0);
  const showFeedbackTab = Boolean(
    pendingSession || (hasStartedProcessing && betaEnabled)
  );
  const showDeviceBanner = Boolean(pendingSession && pendingThumbnails.length === 0);
  const deviceBanner = showDeviceBanner ? <BetaFeedbackDeviceBanner compact /> : undefined;
  const feedbackCredits = pendingSession?.creditsCharged ?? 0;

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

  const handleTabChange = (tab: RightPanelTab) => {
    if (activeTab === 'feedback' && tab !== 'feedback' && canShowFeedbackForm) {
      userLeftFeedbackRef.current = true;
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    if (!hasStartedProcessing) {
      autoOpenedForSessionRef.current = null;
      userLeftFeedbackRef.current = false;
    }
  }, [hasStartedProcessing]);

  useEffect(() => {
    if (hasStartedProcessing) {
      setActiveTab('result');
    } else {
      setActiveTab('setup');
    }
  }, [hasStartedProcessing]);

  useEffect(() => {
    if (!hasStartedProcessing && canShowFeedbackForm && submitBlocked) {
      setActiveTab('feedback');
    }
  }, [hasStartedProcessing, canShowFeedbackForm, submitBlocked]);

  useEffect(() => {
    if (!hasStartedProcessing || !canShowFeedbackForm || !pendingSession) return;
    if (userLeftFeedbackRef.current) return;
    if (autoOpenedForSessionRef.current === pendingSession.id) return;

    autoOpenedForSessionRef.current = pendingSession.id;
    setActiveTab('feedback');
  }, [hasStartedProcessing, canShowFeedbackForm, pendingSession]);

  useEffect(() => {
    if (!showFeedbackTab && activeTab === 'feedback') {
      setActiveTab(hasStartedProcessing ? 'result' : 'setup');
    }
  }, [activeTab, showFeedbackTab, hasStartedProcessing]);

  const openFeedback = () => handleTabChange('feedback');

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

  const feedbackNudge =
    canShowFeedbackForm && pendingSession ? (
      <BetaFeedbackResultNudge
        creditsToRefund={pendingSession.creditsCharged}
        onOpenFeedback={openFeedback}
      />
    ) : null;

  const feedbackTabLabel = 'Rate result';
  const feedbackTabSublabel =
    feedbackCredits > 0 ? `+${feedbackCredits} credits` : undefined;

  const tabs: { id: RightPanelTab; label: string; sublabel?: string; show: boolean }[] =
    hasStartedProcessing
      ? [
          { id: 'setup', label: 'Setup', show: true },
          { id: 'result', label: 'Result', show: true },
          {
            id: 'feedback',
            label: feedbackTabLabel,
            sublabel: feedbackTabSublabel,
            show: showFeedbackTab,
          },
        ]
      : [
          { id: 'setup', label: 'Setup', show: true },
          {
            id: 'feedback',
            label: feedbackTabLabel,
            sublabel: feedbackTabSublabel,
            show: showFeedbackTab,
          },
        ];

  const visibleTabs = tabs.filter((t) => t.show);
  const highlightFeedbackTab = canShowFeedbackForm && activeTab !== 'feedback';

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 h-full flex flex-col overflow-hidden">
      {visibleTabs.length > 1 && (
        <div className="flex border-b border-gray-700 flex-shrink-0">
          {visibleTabs.map((tab) => (
            <RightPanelTabButton
              key={tab.id}
              label={tab.label}
              sublabel={tab.sublabel}
              active={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
              highlight={tab.id === 'feedback' && highlightFeedbackTab}
            />
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
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
          <>
            {feedbackNudge && (
              <BetaFeedbackResultNudge
                creditsToRefund={pendingSession!.creditsCharged}
                onOpenFeedback={openFeedback}
                variant="banner"
              />
            )}
            <div className="flex-1 min-h-0">
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
                resultAddon={feedbackNudge}
              />
            </div>
          </>
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
