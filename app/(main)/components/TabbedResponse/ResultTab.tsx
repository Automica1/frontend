// components/TabbedResponseSection/ResultTab.tsx
import React from 'react';
import { QrCode, Shield, AlertCircle } from 'lucide-react';
import { Solution, SolutionType } from '../../types/solution';
import {
  extractProcessedImageBase64,
  getFileRequirementText,
  getProcessingMessage,
  isImageOutputSolution,
} from '../../../utils/solutionHelpers';
import { QrExtractionResult } from './QrExtractionResult';
import { VerificationResult } from './VerificationResult';
import { ProcessedImageTab } from './ProcessedImageTab';

interface ResultTabProps {
  solutionType: SolutionType;
  data: any;
  loading: boolean;
  solution: Solution;
  error?: string | null;
  errorDetails?: any | null;
  compactResult?: boolean;
  processedImageBase64?: string;
  fileName?: string;
  copiedBase64?: boolean;
  onCopyBase64?: (base64: string) => void;
  fileType?: 'image' | 'pdf';
  mimeType?: string;
}

export const ResultTab: React.FC<ResultTabProps> = ({
  solutionType,
  data,
  loading,
  solution,
  error,
  errorDetails,
  compactResult = false,
  processedImageBase64,
  fileName,
  copiedBase64 = false,
  onCopyBase64,
  fileType = 'image',
  mimeType,
}) => {
  const isVerificationSolution = solutionType === 'face-verify' || solutionType === 'signature-verification';
  const isQrExtractSolution = solutionType === 'qr-extract';
  const imageBase64 = processedImageBase64 || extractProcessedImageBase64(solutionType, data);

  if (error) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            {isQrExtractSolution ? 'QR Code Extraction Failed' :
             isVerificationSolution ? 'Verification Failed' : 'Processing Failed'}
          </h3>
        </div>

        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-400 mb-3 text-lg">Technical Error</h4>
              <p className="text-red-300 mb-4 leading-relaxed">{error}</p>

              {errorDetails?.technical_message && (
                <div>
                  <p className="text-gray-300 text-sm">{errorDetails.technical_message}</p>
                </div>
              )}

              {errorDetails?.status && (
                <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-800/30 rounded">
                  <span>Status: {errorDetails.status}</span>
                  {errorDetails.type && <span className="ml-4">Type: {errorDetails.type}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12 h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          {isQrExtractSolution ? (
            <QrCode className="w-8 h-8 text-gray-600" />
          ) : (
            <Shield className="w-8 h-8 text-gray-600" />
          )}
        </div>
        <p className="text-gray-400">{getProcessingMessage(solutionType)}</p>
        <div className="w-16 h-16 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mt-4" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          {isQrExtractSolution ? (
            <QrCode className="w-8 h-8 text-gray-600" />
          ) : (
            <Shield className="w-8 h-8 text-gray-600" />
          )}
        </div>
        <p className="text-gray-400">
          {`${getFileRequirementText(solutionType)} to see the ${isQrExtractSolution ? 'extraction' : isImageOutputSolution(solutionType) ? 'processed' : 'verification'} result`}
        </p>
      </div>
    );
  }

  if (isQrExtractSolution && data.qrResult) {
    return <QrExtractionResult qrResult={data.qrResult} />;
  }

  if (isVerificationSolution) {
    return (
      <VerificationResult
        solutionType={solutionType}
        data={data}
        compact={compactResult}
      />
    );
  }

  if (isImageOutputSolution(solutionType)) {
    return (
      <ProcessedImageTab
        solutionType={solutionType}
        loading={loading}
        maskedBase64={imageBase64}
        fileName={fileName}
        hasProcessedImage={Boolean(imageBase64 && imageBase64.length > 0)}
        copiedBase64={copiedBase64}
        onCopyBase64={onCopyBase64 || (() => undefined)}
        error={error}
        errorDetails={errorDetails}
        fileType={fileType}
        mimeType={mimeType}
      />
    );
  }

  return (
    <div className="text-center py-12 h-full flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-gray-600" />
      </div>
      <p className="text-gray-400">No result data available</p>
    </div>
  );
};
