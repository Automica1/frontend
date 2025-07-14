// components/TabbedResponseSection/ResultTab.tsx
import React from 'react';
import { QrCode, Shield, AlertCircle } from 'lucide-react';
import { Solution, SolutionType } from '../../types/solution';
import { getFileRequirementText, getProcessingMessage } from '../../../utils/solutionHelpers';
import { QrExtractionResult } from './QrExtractionResult';
import { VerificationResult } from './VerificationResult';

interface ResultTabProps {
  solutionType: SolutionType;
  data: any;
  loading: boolean;
  solution: Solution;
}

export const ResultTab: React.FC<ResultTabProps> = ({
  solutionType,
  data,
  loading,
  solution
}) => {
  // Determine if this is a verification solution type or QR extract
  const isVerificationSolution = solutionType === 'face-verify' || solutionType === 'signature-verification';
  const isQrExtractSolution = solutionType === 'qr-extract';

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
          {loading ? getProcessingMessage(solutionType) : `${getFileRequirementText(solutionType)} to see the ${isQrExtractSolution ? 'extraction' : 'verification'} result`}
        </p>
        {loading && (
          <div className="w-16 h-16 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mt-4" />
        )}
      </div>
    );
  }

  if (isQrExtractSolution && data.qrResult) {
    return <QrExtractionResult qrResult={data.qrResult} />;
  }

  if (isVerificationSolution) {
    return <VerificationResult solutionType={solutionType} data={data} />;
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