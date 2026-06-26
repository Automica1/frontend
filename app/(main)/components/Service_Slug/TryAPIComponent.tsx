// Fixed TryAPIComponent.tsx with proper face verification support
"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Solution, SolutionType } from '../../types/solution';
import { useSolutionType } from '../../hooks/useSolutionType';
import { useSolutionApi } from '../../hooks/useSolutionApi';
import { useCredits } from '../../hooks/useCredits';
import { fileToBase64, filesToBase64 } from '../../../utils/fileUtils';
import { FileUpload2 } from '../ui/file-upload2';
import { FileUpload } from '../ui/file-upload';
import { TabbedResponseSection } from '../TabbedResponse/index';
import { ProcessingActionCard } from '../TabbedResponse/ProcessingActionCard';
import BetaAccessPanel from './BetaAccessPanel';
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
import { extractVerificationFromApiResponse } from '../../lib/betaFeedbackConfig';

const BETA_RUN_COST = 2;

interface TryAPIComponentProps {
  solution: Solution;
}

export default function TryAPIComponent({ solution }: TryAPIComponentProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [hasStartedProcessing, setHasStartedProcessing] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const [betaEnabled, setBetaEnabled] = useState(false);
  const [betaKey, setBetaKey] = useState('');
  const [pendingSession, setPendingSession] = useState<BetaFeedbackSessionSummary | null>(null);
  const [pendingThumbnails, setPendingThumbnails] = useState<string[]>([]);
  const [submitValidationError, setSubmitValidationError] = useState<string | null>(null);
  const solutionType = useSolutionType(solution);
  const currentApi = useSolutionApi(solutionType);
  const { credits, updateCredits } = useCredits();

  const serviceSlug = solution.slug || solutionType;

  const refreshPendingFeedback = useCallback(async () => {
    if (!solution.hasBeta || !serviceSlug) return;

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
  }, [solution.hasBeta, serviceSlug]);

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

  const insufficientCredits = credits !== null && credits < BETA_RUN_COST;
  const canShowFeedback = Boolean(
    solution.hasBeta && betaEnabled && pendingSession && pendingThumbnails.length > 0
  );
  const postRunShowFeedback = Boolean(canShowFeedback && !currentApi.loading);

  const feedbackSession = useMemo(() => {
    if (!pendingSession) return null;

    const responseSessionId =
      (currentApi.data as { beta_feedback_session_id?: string } | null)?.beta_feedback_session_id ??
      (currentApi.errorData?.beta_feedback_session_id as string | undefined);

    if (!responseSessionId || responseSessionId !== pendingSession.id) {
      return pendingSession;
    }

    const liveResult = extractVerificationFromApiResponse(currentApi.data, solutionType);
    if (!liveResult?.classification) {
      return pendingSession;
    }

    return {
      ...pendingSession,
      actualResult: {
        classification: liveResult.classification,
        similarity_percentage: liveResult.similarity_percentage ?? pendingSession.actualResult?.similarity_percentage,
      },
    };
  }, [currentApi.data, currentApi.errorData, pendingSession, solutionType]);

  const feedbackBadge = pendingSession ? `+${pendingSession.creditsCharged}` : undefined;
  const setupDefaultTab =
    insufficientCredits || files.length === 0 ? 'feedback' : 'setup';

  const feedbackPanel = (panelContext: 'setup' | 'post-run') =>
    canShowFeedback && feedbackSession ? (
      <BetaFeedbackPanel
        key={feedbackSession.id}
        serviceSlug={serviceSlug}
        solutionType={solutionType}
        session={feedbackSession}
        thumbnails={pendingThumbnails}
        insufficientCredits={insufficientCredits}
        onSubmitted={handleFeedbackSubmitted}
        context={panelContext}
        fillHeight={panelContext === 'post-run'}
      />
    ) : null;

  const submitBlockedMessage =
    insufficientCredits && canShowFeedback && pendingSession
      ? `Not enough credits to run again. Submit feedback to earn up to ${pendingSession.creditsCharged} credits back, or buy more credits.`
      : insufficientCredits
        ? 'Not enough credits to run this test.'
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
      setSubmitValidationError('Enter your beta key to use your custom model.');
      return;
    }

    if (insufficientCredits && canShowFeedback) {
      setSubmitValidationError(
        `Not enough credits. Submit feedback to earn up to ${pendingSession?.creditsCharged ?? BETA_RUN_COST} credits back.`
      );
      return;
    }

    if (insufficientCredits) {
      setSubmitValidationError('Not enough credits to run this test.');
      return;
    }

    setSubmitValidationError(null);
    setPendingThumbnails([]);
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
          creditsCharged: BETA_RUN_COST,
        });
        await refreshPendingFeedback();
        setPendingThumbnails(thumbnails);
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

  const getMaskedBase64 = () => {
    const data = currentApi.data;

    if (solutionType === 'face-verify' || solutionType === 'face-cropping') {
      if (data && typeof data === 'object' && 'faceResult' in data) {
        const faceResult = (data as any).faceResult;
        if (faceResult && typeof faceResult === 'object' && 'data' in faceResult && Array.isArray(faceResult.data) && faceResult.data.length > 0) {
          return faceResult.data[0];
        }
      }

      if (data && typeof data === 'object') {
        if ('processed_image' in data && typeof (data as any).processed_image === 'string') {
          return (data as any).processed_image;
        }
        if ('result_image' in data && typeof (data as any).result_image === 'string') {
          return (data as any).result_image;
        }
        if ('cropped_face' in data && typeof (data as any).cropped_face === 'string') {
          return (data as any).cropped_face;
        }
      }
      return undefined;
    }

    const hasCropResult = (obj: any): obj is { cropResult: { result?: string } } =>
      obj && typeof obj === 'object' && 'cropResult' in obj;

    if (solutionType === 'qr-extract') {
      if (data && typeof data === 'object' && 'masked_base64' in data) {
        return (data as any).masked_base64;
      }
      return undefined;
    }

    if (solutionType === 'qr-mask') {
      if (data && typeof data === 'object' && 'qrResult' in data) {
        const qrResult = (data as any).qrResult;
        if (qrResult && typeof qrResult === 'object' && 'masked_base64' in qrResult) {
          return qrResult.masked_base64;
        }
      }

      if (data && typeof data === 'object' && 'masked_base64' in data) {
        return (data as any).masked_base64;
      }

      if (data && typeof data === 'object' && 'result' in data) {
        return (data as any).result;
      }
      if (data && typeof data === 'object' && 'processed_image' in data) {
        return (data as any).processed_image;
      }
      return undefined;
    }

    if (solutionType === 'id-crop') {
      if (hasCropResult(data) && data.cropResult?.result) {
        return data.cropResult.result;
      }
      return (data && 'result' in data && data.result)
        || (data && 'processed_image' in data && (data as any).processed_image);
    }

    if (data && typeof data === 'object') {
      if ('processed_image' in data && typeof (data as any).processed_image === 'string') {
        return (data as any).processed_image;
      }
      if ('result_image' in data && typeof (data as any).result_image === 'string') {
        return (data as any).result_image;
      }
      if ('masked_base64' in data && typeof (data as any).masked_base64 === 'string') {
        return (data as any).masked_base64;
      }
    }
    return undefined;
  };

  const maskedBase64 = getMaskedBase64();
  const shouldUseFileUpload2 = solutionType === 'signature-verification' || solutionType === 'face-verify';
  const containerHeight = 'h-[500px]';
  const uploadShellClass = `w-full max-w-4xl mx-auto ${containerHeight}`;

  const setupCard = (
    <ProcessingActionCard
      solution={solution}
      solutionType={solutionType}
      files={files}
      onSubmit={handleSubmit}
      loading={currentApi.loading}
      submitBlocked={insufficientCredits}
      submitBlockedMessage={submitBlockedMessage}
      validationMessage={submitValidationError ?? undefined}
      embedded={canShowFeedback}
      betaControls={
        solution.hasBeta && solution.slug ? (
          <BetaAccessPanel
            serviceSlug={solution.slug}
            enabled={betaEnabled}
            betaKey={betaKey}
            onEnabledChange={setBetaEnabled}
            onBetaKeyChange={setBetaKey}
            variant="embedded"
          />
        ) : undefined
      }
    />
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
                />
              ) : (
                <FileUpload key={uploadKey} onChange={handleFileUpload} />
              )}
            </div>
          </div>

          <div className={`${containerHeight} min-h-0 flex flex-col`}>
            {!hasStartedProcessing ? (
              canShowFeedback ? (
                <TryAPISetupPanel
                  setupContent={setupCard}
                  feedbackContent={feedbackPanel('setup')}
                  feedbackBadge={feedbackBadge}
                  defaultTab={setupDefaultTab}
                  insufficientCredits={insufficientCredits}
                />
              ) : (
                setupCard
              )
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
