// Fixed TryAPIComponent.tsx with proper face verification support
"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { Solution, SolutionType } from '../../types/solution';
import { useSolutionType } from '../../hooks/useSolutionType';
import { useSolutionApi } from '../../hooks/useSolutionApi';
import { useCredits } from '../../hooks/useCredits';
import { fileToBase64, filesToBase64 } from '../../../utils/fileUtils';
import { extractProcessedImageBase64 } from '../../../utils/solutionHelpers';
import { FileUpload2 } from '../ui/file-upload2';
import { FileUpload } from '../ui/file-upload';
import { TabbedResponseSection } from '../TabbedResponse/index';
import { ProcessingActionCard } from '../TabbedResponse/ProcessingActionCard';
import { loadBetaKeyPrefs, storeBetaKeyPrefs } from '../../lib/betaKeyStorage';
import { clearGuestPassKey, loadGuestPassKey, normalizeGuestPassKey, storeGuestPassKey } from '../../lib/guestPassStorage';
import { getServiceRunCost } from '../../lib/serviceRunCosts';
import BetaAccessPanel from './BetaAccessPanel';
import GpuPoolPanel from './GpuPoolPanel';
import TryAPISetupPanel from './TryAPISetupPanel';
import BetaFeedbackPanel from './BetaFeedbackPanel';
import {
  apiService,
  createThumbnail,
  type BetaFeedbackSessionSummary,
} from '../../lib/apiService';
import {
  clearBetaSessionCache,
  loadBetaSessionCache,
  saveBetaSessionCache,
} from '../../lib/betaSessionCache';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { useGpuPool } from '../../hooks/useGpuPool';
import { useBetaKeyResolve } from '../../hooks/useBetaKeyResolve';
import { useGpuStartCeremony } from '../../hooks/useGpuStartCeremony';
import { sharedPoolJoinMode } from './gpuPoolPanelCopy';

interface TryAPIComponentProps {
  solution: Solution;
  initialAccessCode?: string;
  isAdmin?: boolean;
}

export default function TryAPIComponent({ solution, initialAccessCode, isAdmin = false }: TryAPIComponentProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [hasStartedProcessing, setHasStartedProcessing] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const [betaEnabled, setBetaEnabled] = useState(false);
  const [betaKey, setBetaKey] = useState('');
  const [pendingSession, setPendingSession] = useState<BetaFeedbackSessionSummary | null>(null);
  const [pendingThumbnails, setPendingThumbnails] = useState<string[]>([]);
  const [submitValidationError, setSubmitValidationError] = useState<string | null>(null);
  const [guestValidating, setGuestValidating] = useState(false);
  const [guestPassReady, setGuestPassReady] = useState(false);
  const [guestServiceAllowed, setGuestServiceAllowed] = useState<boolean | null>(null);
  const [guestValidationFailed, setGuestValidationFailed] = useState(false);
  const { isAuthenticated } = useKindeBrowserClient();
  const solutionType = useSolutionType(solution);
  const currentApi = useSolutionApi(solutionType);
  const { credits, updateCredits, refreshCredits } = useCredits();
  const runCost = getServiceRunCost(solutionType);
  const serviceSlug = solution.slug || solutionType;

  const betaResolve = useBetaKeyResolve({
    serviceName: serviceSlug,
    betaKey,
    enabled: Boolean(isAuthenticated && solution.hasBeta && betaEnabled),
  });

  const needsGpu = Boolean(
    isAuthenticated &&
      solution.hasBeta &&
      betaEnabled &&
      betaResolve.result?.valid &&
      betaResolve.result.requiresGpuPool
  );

  const gpuServiceTag = needsGpu ? (betaResolve.result?.betaServiceTag ?? '') : '';

  const gpuPool = useGpuPool({
    serviceTag: gpuServiceTag,
    available: needsGpu,
    creditBalance: credits,
    refreshCredits,
  });

  const ceremony = useGpuStartCeremony({
    sessionActive: gpuPool.userActive && gpuPool.ceremonyMode !== null,
    backendReady: gpuPool.isReady,
    startMode: gpuPool.ceremonyMode ?? 'cold',
    startupCredits: gpuPool.startupCredits,
  });

  const gpuReadyForCompare = !needsGpu || ceremony.canRunTests;

  const betaKeyBlocked =
    Boolean(
      solution.hasBeta &&
        betaEnabled &&
        betaKey.trim() &&
        !betaResolve.loading &&
        (betaResolve.error || (betaResolve.result && !betaResolve.result.valid))
    );

  const validateGuestAccess = useCallback(async (code: string) => {
    const trimmed = normalizeGuestPassKey(code);
    if (!trimmed) {
      setGuestValidationFailed(false);
      setGuestServiceAllowed(null);
      setGuestPassReady(false);
      return;
    }

    setGuestValidating(true);
    setGuestValidationFailed(false);
    try {
      const result = await apiService.validateGuestPass(trimmed, serviceSlug);
      if (!result.valid) {
        setGuestValidationFailed(true);
        setGuestServiceAllowed(null);
        setGuestPassReady(false);
        return;
      }
      storeGuestPassKey(trimmed);
      if (typeof result.remainingCredits === 'number') {
        updateCredits(result.remainingCredits);
      }
      const allowed = result.serviceAllowed ?? true;
      setGuestServiceAllowed(allowed);
      setGuestPassReady(allowed);
      setGuestValidationFailed(!allowed);
    } catch {
      setGuestValidationFailed(true);
      setGuestServiceAllowed(null);
      setGuestPassReady(false);
    } finally {
      setGuestValidating(false);
    }
  }, [serviceSlug, updateCredits]);

  useEffect(() => {
    if (isAuthenticated) {
      clearGuestPassKey();
      setGuestPassReady(false);
      setGuestServiceAllowed(null);
      setGuestValidationFailed(false);
      return;
    }
    const saved = initialAccessCode || loadGuestPassKey();
    if (saved) {
      void validateGuestAccess(saved);
    }
  }, [isAuthenticated, serviceSlug, initialAccessCode, validateGuestAccess]);

  useEffect(() => {
    const prefs = loadBetaKeyPrefs(serviceSlug);
    setBetaKey(prefs.key);
    setBetaEnabled(isAuthenticated ? prefs.enabled : false);
  }, [isAuthenticated, serviceSlug]);

  const handleBetaEnabledChange = (enabled: boolean) => {
    setBetaEnabled(enabled);
    storeBetaKeyPrefs(serviceSlug, { key: betaKey, enabled });
  };

  const handleBetaKeyChange = (key: string) => {
    setBetaKey(key);
    storeBetaKeyPrefs(serviceSlug, { key, enabled: betaEnabled });
  };

  const refreshPendingFeedback = useCallback(async () => {
    if (!isAuthenticated || !solution.hasBeta || !serviceSlug) return;

    try {
      const response = await apiService.getPendingBetaFeedback(serviceSlug);
      const session = response.session ?? null;
      setPendingSession(session);

      if (session) {
        const cached = await loadBetaSessionCache(serviceSlug);
        if (cached?.sessionId === session.id) {
          setPendingThumbnails(cached.thumbnails);
        } else {
          setPendingThumbnails([]);
        }
      } else {
        setPendingThumbnails([]);
      }
    } catch (error) {
      console.error('Failed to load pending beta feedback:', error);
    }
  }, [isAuthenticated, solution.hasBeta, serviceSlug]);

  useEffect(() => {
    refreshPendingFeedback();
  }, [refreshPendingFeedback]);

  useEffect(() => {
    if (betaEnabled) {
      void refreshPendingFeedback();
    }
  }, [betaEnabled, refreshPendingFeedback]);

  const handleFeedbackSubmitted = async (remainingCredits: number) => {
    updateCredits(remainingCredits);
    setPendingSession(null);
    setPendingThumbnails([]);
    setHasStartedProcessing(false);
    currentApi.reset();
    if (serviceSlug) {
      await clearBetaSessionCache(serviceSlug);
    }
  };

  const insufficientCredits = credits !== null && credits < runCost;
  const guestNeedsLink = !isAuthenticated && !guestPassReady && !guestValidating;
  const guestCreditsPending = !isAuthenticated && guestPassReady && credits === null;
  const guestBlocked = !isAuthenticated && guestServiceAllowed === false;
  const submitBlocked =
    guestNeedsLink ||
    guestValidating ||
    guestCreditsPending ||
    guestBlocked ||
    insufficientCredits ||
    betaKeyBlocked ||
    (needsGpu && !gpuReadyForCompare);
  const canShowFeedback = Boolean(
    isAuthenticated &&
      solution.hasBeta &&
      betaEnabled &&
      pendingSession &&
      (insufficientCredits || hasStartedProcessing)
  );
  const postRunShowFeedback = Boolean(canShowFeedback && !currentApi.loading);

  const feedbackBadge = pendingSession ? `+${pendingSession.creditsCharged}` : undefined;
  const setupDefaultTab = insufficientCredits && canShowFeedback ? 'feedback' : 'setup';

  const feedbackPanel = (panelContext: 'setup' | 'post-run') =>
    canShowFeedback && pendingSession ? (
      <BetaFeedbackPanel
        key={pendingSession.id}
        serviceSlug={serviceSlug}
        solutionType={solutionType}
        session={pendingSession}
        thumbnails={pendingThumbnails}
        insufficientCredits={insufficientCredits}
        onSubmitted={handleFeedbackSubmitted}
        context={panelContext}
        fillHeight={panelContext === 'post-run'}
      />
    ) : null;

  const gpuSharedJoin = needsGpu
    ? sharedPoolJoinMode({
        userActive: gpuPool.userActive,
        state: gpuPool.status?.state,
        refCount: gpuPool.status?.refCount,
        sessionEndReason: gpuPool.sessionEndReason,
      })
    : false;

  const submitBlockedMessage =
    guestValidating
      ? 'Checking access link…'
      : guestNeedsLink
      ? 'Sign in, or open the access link you were given.'
      : guestValidationFailed && !guestBlocked
      ? 'This access link is invalid or expired.'
      : guestBlocked
      ? 'This access link does not include this service.'
      : insufficientCredits && canShowFeedback && pendingSession
      ? `Not enough credits to compare again. Submit feedback to earn up to ${pendingSession.creditsCharged} credits back, or buy more credits.`
      : insufficientCredits
        ? !isAuthenticated
          ? 'No credits remain on this access link.'
          : 'Not enough credits for a comparison (2 credits).'
        : betaKeyBlocked
          ? betaResolve.error ?? 'This beta key is invalid for your account.'
        : needsGpu && ceremony.inCeremony
          ? undefined
        : needsGpu && gpuSharedJoin
          ? undefined
        : needsGpu && !gpuPool.userActive &&
            (gpuPool.status?.state === 'idle' ||
              gpuPool.status?.state === 'failed' ||
              !gpuPool.status)
          ? undefined
        : needsGpu && !gpuPool.userActive
          ? 'Start a GPU session first, then compare below.'
        : needsGpu && !gpuPool.isReady
          ? gpuPool.error ?? 'Starting GPU session…'
        : undefined;

  const handleFileUpload = (uploadedFiles: File[]) => {
    if ((solutionType === 'signature-verification' || solutionType === 'face-verify') && uploadedFiles.length > 2) {
      alert(`Please upload only 2 images for ${solutionType === 'signature-verification' ? 'signature verification' : 'face verification'}`);
      return;
    }

    setFiles(uploadedFiles);
    currentApi.reset();
    setSubmitValidationError(null);
    setHasStartedProcessing(false);
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;

    if (solution.hasBeta && betaEnabled && !betaKey.trim()) {
      setSubmitValidationError('Enter your beta key to continue.');
      return;
    }

    if (insufficientCredits && canShowFeedback) {
      setSubmitValidationError(
        `Not enough credits. Submit feedback to earn up to ${pendingSession?.creditsCharged ?? runCost} credits back.`
      );
      return;
    }

    if (insufficientCredits) {
      setSubmitValidationError('Not enough credits for a comparison (2 credits).');
      return;
    }

    if (needsGpu && !gpuReadyForCompare) {
      setSubmitValidationError('Start a GPU session first, then compare.');
      return;
    }

    setSubmitValidationError(null);
    setHasStartedProcessing(true);

    try {
      switch (solutionType) {
        case 'signature-verification':
          if (files.length !== 2) {
            throw new Error('Please upload exactly 2 signature images');
          }
          const base64Images = await filesToBase64(files);
          await currentApi.execute(
            base64Images,
            solution.hasBeta && betaEnabled ? { betaKey: betaKey.trim() } : undefined
          );
          break;

        case 'face-verify':
          if (files.length !== 2) {
            throw new Error('Please upload exactly 2 face images for verification');
          }
          const faceBase64Images = await filesToBase64(files);
          await currentApi.execute(faceBase64Images[0], faceBase64Images[1]);
          break;

        case 'qr-extract':
          const qrBase64 = await fileToBase64(files[0]);
          await currentApi.execute(qrBase64);
          break;

        case 'qr-mask':
          const qrMaskBase64 = await fileToBase64(files[0]);
          await currentApi.execute(qrMaskBase64);
          break;

        case 'id-crop':
          const idBase64 = await fileToBase64(files[0]);
          await currentApi.execute(idBase64);
          break;

        case 'document-enhancement':
          const enhanceBase64 = await fileToBase64(files[0]);
          await currentApi.execute(enhanceBase64);
          break;

        case 'face-cropping':
          const faceCropBase64 = await fileToBase64(files[0]);
          await currentApi.execute(faceCropBase64);
          break;

        default:
          throw new Error(`Unsupported solution type: ${solutionType}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const cacheBetaSessionThumbnails = useCallback(
    async (sessionId: string) => {
      if (!solution.hasBeta || !betaEnabled || !serviceSlug) return;
      if (solutionType !== 'signature-verification' || files.length !== 2) return;

      try {
        const base64Images = await filesToBase64(files);
        const thumbnails = await Promise.all(base64Images.map((img) => createThumbnail(img)));
        await saveBetaSessionCache(serviceSlug, {
          sessionId,
          thumbnails,
          capturedAt: new Date().toISOString(),
          creditsCharged: runCost,
        });
        setPendingThumbnails(thumbnails);
        await refreshPendingFeedback();
      } catch (error) {
        console.error('Failed to cache beta session thumbnails:', error);
      }
    },
    [betaEnabled, files, refreshPendingFeedback, serviceSlug, solution.hasBeta, solutionType]
  );

  useEffect(() => {
    if (!currentApi.data) return;

    const sessionId = (currentApi.data as { beta_feedback_session_id?: string }).beta_feedback_session_id;
    if (!sessionId) return;

    void cacheBetaSessionThumbnails(sessionId);
  }, [cacheBetaSessionThumbnails, currentApi.data]);

  useEffect(() => {
    if (!currentApi.errorData) return;

    const sessionId = currentApi.errorData.beta_feedback_session_id as string | undefined;
    if (!sessionId) return;

    void cacheBetaSessionThumbnails(sessionId);
  }, [cacheBetaSessionThumbnails, currentApi.errorData]);

  const handleRetry = () => {
    currentApi.reset();
    setHasStartedProcessing(false);
    setSubmitValidationError(null);
  };

  const handleReset = () => {
    setFiles([]);
    setHasStartedProcessing(false);
    setUploadKey((key) => key + 1);
    currentApi.reset();
    setSubmitValidationError(null);
  };

  const maskedBase64 = extractProcessedImageBase64(solutionType, currentApi.data);
  const shouldUseFileUpload2 = solutionType === 'signature-verification' || solutionType === 'face-verify';
  const containerHeight = 'min-h-[560px] lg:h-[560px]';
  const uploadShellClass = `w-full max-w-4xl mx-auto ${containerHeight}`;

  const gpuPanelProps = {
    status: gpuPool.status,
    loading: gpuPool.loading,
    error: gpuPool.error,
    isReady: gpuPool.isReady,
    isStarting: gpuPool.isStarting,
    isFailed: gpuPool.isFailed,
    isDraining: gpuPool.isDraining,
    userActive: gpuPool.userActive,
    canStart: gpuPool.canStart,
    canStop: gpuPool.canStop,
    onStart: () => { void gpuPool.start(); },
    onStop: () => { void gpuPool.stop(); },
    ceremonyStep: ceremony.step,
    ceremonySteps: ceremony.steps,
    ceremonySubline: ceremony.subline,
    ceremonyElapsedMs: ceremony.elapsedMs,
    ceremonyStartMode: ceremony.startMode,
    inCeremony: ceremony.inCeremony,
    canRunTests: ceremony.canRunTests,
    isAdmin,
    minCreditsToStart: gpuPool.minCreditsToStart,
    startupCredits: gpuPool.startupCredits,
    creditsPerMinute: gpuPool.creditsPerMinute,
    comparisonCost: runCost,
    creditsChargedSession: gpuPool.creditsChargedSession,
    creditsStartupChargedSession: gpuPool.creditsStartupChargedSession,
    creditsGpuTimeSession: gpuPool.creditsGpuTimeSession,
    billingActive: gpuPool.billingActive,
    creditBalance: credits,
    hasEnoughCreditsToStart: gpuPool.hasEnoughCreditsToStart,
    nextMeterChargeAt: gpuPool.nextMeterChargeAt,
    sessionEndReason: gpuPool.sessionEndReason,
    drainReason: gpuPool.drainReason,
    destroyAt: gpuPool.destroyAt,
    gracePeriodSec: gpuPool.gracePeriodSec,
  };

  const gpuPanel = needsGpu ? <GpuPoolPanel {...gpuPanelProps} /> : null;
  const gpuPanelCompact = needsGpu ? <GpuPoolPanel {...gpuPanelProps} compact /> : null;

  const setupCard = (
    <>
      <ProcessingActionCard
      solution={solution}
      solutionType={solutionType}
      files={files}
      onSubmit={handleSubmit}
      loading={currentApi.loading}
      submitBlocked={submitBlocked}
      submitBlockedMessage={submitBlockedMessage}
      validationMessage={submitValidationError ?? undefined}
      embedded={canShowFeedback}
      compactRequirements={needsGpu && (gpuPool.userActive || ceremony.inCeremony)}
      gpuSessionPending={needsGpu && !gpuPool.userActive && !gpuReadyForCompare}
      betaControls={
        isAuthenticated && solution.hasBeta && solution.slug ? (
          <BetaAccessPanel
            enabled={betaEnabled}
            betaKey={betaKey}
            onEnabledChange={handleBetaEnabledChange}
            onBetaKeyChange={handleBetaKeyChange}
            variant="embedded"
            keyResolving={betaResolve.loading}
            keyResolveError={betaResolve.error}
            gpuPanel={gpuPanel}
          />
        ) : undefined
      }
    />
    </>
  );

  return (
    <div className="md:pt-24 pt-16 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-stretch">
          <div className="flex flex-col min-h-0">
            <div className={`${uploadShellClass} border border-dashed bg-black border-neutral-800 rounded-lg overflow-hidden`}>
              {shouldUseFileUpload2 ? (
                <FileUpload2
                  key={uploadKey}
                  onChange={handleFileUpload}
                  compactPanel={solution.hasBeta}
                  allowGuestAccess={guestPassReady}
                />
              ) : (
                <FileUpload key={uploadKey} onChange={handleFileUpload} allowGuestAccess={guestPassReady} />
              )}
            </div>
          </div>

          <div className={`${containerHeight} min-h-0 flex flex-col`}>
            {!hasStartedProcessing ? (
              <TryAPISetupPanel
                showFeedbackTab={canShowFeedback}
                setupContent={setupCard}
                feedbackContent={feedbackPanel('setup')}
                feedbackBadge={feedbackBadge}
                defaultTab={setupDefaultTab}
                insufficientCredits={insufficientCredits}
              />
            ) : (
              <div className="h-full min-h-0 flex flex-col gap-2">
                {gpuPanelCompact && (
                  <div className="flex-shrink-0 px-1 pt-1">{gpuPanelCompact}</div>
                )}
                <div className="flex-1 min-h-0">
                  <TabbedResponseSection
                    solution={solution}
                    solutionType={solutionType}
                    data={currentApi.data}
                    loading={currentApi.loading}
                    error={currentApi.error}
                    errorDetails={currentApi.errorData}
                    maskedBase64={maskedBase64}
                    fileName={files[0]?.name}
                    onRetry={handleRetry}
                    onReset={handleReset}
                    hideRetry={Boolean(canShowFeedback && insufficientCredits)}
                    showFeedbackTab={Boolean(solution.hasBeta && betaEnabled && postRunShowFeedback)}
                    feedbackTab={feedbackPanel('post-run')}
                    feedbackTabBadge={feedbackBadge}
                    defaultTab={postRunShowFeedback ? 'feedback' : 'result'}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
