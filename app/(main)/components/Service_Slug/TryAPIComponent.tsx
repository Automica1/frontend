// Fixed TryAPIComponent.tsx with proper face verification support
"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { Solution, SolutionType } from '../../types/solution';
import { useSolutionType } from '../../hooks/useSolutionType';
import { useSolutionApi } from '../../hooks/useSolutionApi';
import { useCredits } from '../../hooks/useCredits';
// import { getFileRequirementText } from '../../../utils/solutionHelpers';
import { fileToBase64, filesToBase64 } from '../../../utils/fileUtils';
import { FileUpload2 } from '../ui/file-upload2';
import { FileUpload } from '../ui/file-upload';
// import { TabbedResponseSection } from '../../TabbedResponseSection';
import {TabbedResponseSection} from '../TabbedResponse/index'
import { ProcessingActionCard } from '../TabbedResponse/ProcessingActionCard';
import BetaAccessPanel from './BetaAccessPanel';
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

  const handleFeedbackSubmitted = async (remainingCredits: number) => {
    updateCredits(remainingCredits);
    setPendingSession(null);
    setPendingThumbnails([]);
    if (serviceSlug) {
      await clearBetaSessionCache(serviceSlug);
    }
  };

  const betaRunBlocked = Boolean(solution.hasBeta && betaEnabled && pendingSession);
  const zeroCreditBetaGate = Boolean(solution.hasBeta && betaEnabled && credits === 0 && pendingSession);

  const Icon = solution.IconComponent;

  const handleFileUpload = (uploadedFiles: File[]) => {
    // For signature verification and face verification, limit to 2 files
    if ((solutionType === 'signature-verification' || solutionType === 'face-verify') && uploadedFiles.length > 2) {
      alert(`Please upload only 2 images for ${solutionType === 'signature-verification' ? 'signature verification' : 'face verification'}`);
      return;
    }
    
    setFiles(uploadedFiles);
    currentApi.reset();
    // Reset processing state when new files are uploaded
    setHasStartedProcessing(false);
    console.log('Files uploaded:', uploadedFiles);
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;

    if (solution.hasBeta && betaEnabled && !betaKey.trim()) {
      alert('Please enter your beta key to use the beta version.');
      return;
    }

    if (betaRunBlocked) {
      alert('Please submit expected results for your last custom model test before running another beta request.');
      return;
    }
    
    // Set processing state to true to show results section
    setHasStartedProcessing(true);
    
    console.log('Submitting with solution type:', solutionType);
    
    try {
      switch (solutionType) {
        case 'signature-verification':
          if (files.length !== 2) {
            throw new Error('Please upload exactly 2 signature images');
          }
          const base64Images = await filesToBase64(files);
          console.log('Calling signature verification API');
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
          console.log('Calling face verify API with 2 images');
          await currentApi.execute(faceBase64Images[0], faceBase64Images[1]);
          break;
          
        case 'qr-extract':
          const qrBase64 = await fileToBase64(files[0]);
          console.log('Calling QR extract API');
          await currentApi.execute(qrBase64);
          break;
          
        case 'qr-mask':
          const qrMaskBase64 = await fileToBase64(files[0]);
          console.log('Calling QR mask API');
          await currentApi.execute(qrMaskBase64);
          break;
          
        case 'id-crop':
          const idBase64 = await fileToBase64(files[0]);
          console.log('Calling ID crop API');
          await currentApi.execute(idBase64);
          break;
          
        case 'face-cropping':
          const faceCropBase64 = await fileToBase64(files[0]);
          console.log('Calling face crop API');
          await currentApi.execute(faceCropBase64);
          break;
          
        default:
          console.error('Unknown solution type in handleSubmit:', solutionType);
          throw new Error(`Unsupported solution type: ${solutionType}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  useEffect(() => {
    const persistBetaSession = async () => {
      if (!solution.hasBeta || !betaEnabled || !serviceSlug || !currentApi.data) return;

      const sessionId = (currentApi.data as { beta_feedback_session_id?: string }).beta_feedback_session_id;
      if (!sessionId || solutionType !== 'signature-verification' || files.length !== 2) return;

      try {
        const base64Images = await filesToBase64(files);
        const thumbnails = await Promise.all(base64Images.map((img) => createThumbnail(img)));
        await saveBetaSessionCache(serviceSlug, {
          sessionId,
          thumbnails,
          capturedAt: new Date().toISOString(),
          creditsCharged: 2,
        });
        await refreshPendingFeedback();
        setPendingThumbnails(thumbnails);
      } catch (error) {
        console.error('Failed to cache beta session thumbnails:', error);
      }
    };

    persistBetaSession();
  }, [
    betaEnabled,
    currentApi.data,
    files,
    refreshPendingFeedback,
    serviceSlug,
    solution.hasBeta,
    solutionType,
  ]);

  const handleRetry = () => {
    currentApi.reset();
    setHasStartedProcessing(false);
  };

  const handleReset = () => {
    setFiles([]);
    setHasStartedProcessing(false);
    setUploadKey((key) => key + 1);
    currentApi.reset();
  };

  // Get the masked base64 from response
  const getMaskedBase64 = () => {
    const data = currentApi.data;
    console.log('Getting masked base64 for solution type:', solutionType);
    console.log('Current data:', data);
    
    // For face detection/verification, check faceResult.data[0]
    if (solutionType === 'face-verify' || solutionType === 'face-cropping') {
      if (data && typeof data === 'object' && 'faceResult' in data) {
        const faceResult = (data as any).faceResult;
        if (faceResult && typeof faceResult === 'object' && 'data' in faceResult && Array.isArray(faceResult.data) && faceResult.data.length > 0) {
          console.log('Found face result data:', faceResult.data[0]);
          return faceResult.data[0];
        }
      }
      
      // Fallback to other possible properties
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
    
    // Type guard for cropResult property
    const hasCropResult = (obj: any): obj is { cropResult: { result?: string } } =>
      obj && typeof obj === 'object' && 'cropResult' in obj;
    
    if (solutionType === 'qr-extract') {
      // Type guard for masked_base64 property
      if (data && typeof data === 'object' && 'masked_base64' in data) {
        return (data as any).masked_base64;
      }
      return undefined;
    }
    
    if (solutionType === 'qr-mask') {
      // For qr-mask, get masked_base64 from qrResult
      if (data && typeof data === 'object' && 'qrResult' in data) {
        const qrResult = (data as any).qrResult;
        if (qrResult && typeof qrResult === 'object' && 'masked_base64' in qrResult) {
          return qrResult.masked_base64;
        }
      }
      
      // Fallback to direct masked_base64 property
      if (data && typeof data === 'object' && 'masked_base64' in data) {
        return (data as any).masked_base64;
      }
      
      // Also check for other possible response properties
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
      // Only return processed_image if it exists on the data object
      return (data && 'result' in data && data.result)
        || (data && 'processed_image' in data && (data as any).processed_image);
    }
    
    // Generic fallback for other solution types
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
  console.log('Final masked base64 length:', maskedBase64 ? maskedBase64.length : 0);

  // Determine which file upload component to use
  const shouldUseFileUpload2 = solutionType === 'signature-verification' || solutionType === 'face-verify';
  
  // Determine height based on solution type
  const containerHeight = shouldUseFileUpload2 ? 'h-[500px]' : 'h-[500px]';
  return (
    <div className="md:pt-24 pt-16 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {/* <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className={`w-12 h-12 bg-gradient-to-br ${solution.gradient} rounded-xl flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Try {solution.title}
            </h1>
          </div>
        </div> */}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - File Upload */}
          <div className="space-y-6">
            {/* Conditional FileUpload component usage with dynamic height */}
            <div className={`w-full max-w-4xl mx-auto min-h-96 ${containerHeight} border border-dashed bg-black border-neutral-800 rounded-lg`}>
              {shouldUseFileUpload2 ? (
                <FileUpload2 key={uploadKey} onChange={handleFileUpload} />
              ) : (
                <FileUpload key={uploadKey} onChange={handleFileUpload} />
              )}
            </div>
          </div>

          {/* Right Column - Conditional Content */}
          <div className={`space-y-6 h-${containerHeight}`}>
            {!hasStartedProcessing ? (
              /* Show Processing Action Card before processing */
              <div className="space-y-4 h-full flex flex-col">
                {solution.hasBeta && pendingSession && (
                  <BetaFeedbackPanel
                    serviceSlug={serviceSlug}
                    session={pendingSession}
                    thumbnails={pendingThumbnails}
                    credits={credits}
                    onSubmitted={handleFeedbackSubmitted}
                  />
                )}
                <div className="flex-1 min-h-0">
                  <ProcessingActionCard
                    solution={solution}
                    solutionType={solutionType}
                    files={files}
                    onSubmit={handleSubmit}
                    loading={currentApi.loading}
                    submitBlocked={betaRunBlocked}
                    submitBlockedMessage={
                      zeroCreditBetaGate
                        ? 'Submit feedback on your last test to earn credits back, or buy more credits to continue.'
                        : 'Submit feedback on your last custom model test before running another beta request.'
                    }
                    betaControls={
                      solution.hasBeta && solution.slug ? (
                        <BetaAccessPanel
                          serviceSlug={solution.slug}
                          enabled={betaEnabled}
                          betaKey={betaKey}
                          onEnabledChange={setBetaEnabled}
                          onBetaKeyChange={setBetaKey}
                        />
                      ) : undefined
                    }
                  />
                </div>
              </div>
            ) : (
              /* Show Results Section after processing starts with matching height */
              <div className={containerHeight}>
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
                  showBetaFeedbackNudge={Boolean(
                    solution.hasBeta &&
                      betaEnabled &&
                      (currentApi.data as { beta_feedback_pending?: boolean })?.beta_feedback_pending
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}