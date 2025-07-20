// components/TabbedResponseSection/index.tsx
import React, { useState, useEffect } from 'react';
import { Solution, SolutionType } from '../../types/solution';
import { TabType } from '../../types/tabTypes';
import { TabNavigation } from './TabNavigation';
import { ApiResponseTab } from './ApiResponseTab';
import { ProcessedImageTab } from './ProcessedImageTab';
import { ResultTab } from './ResultTab';
import { useClipboard } from '../../hooks/useClipboard';
import '../terminal.css';

interface TabbedResponseSectionProps {
  solution: Solution;
  solutionType: SolutionType;
  data: any;
  loading: boolean;
  error: string | null;
  errorDetails?: any | null;
  maskedBase64?: string;
  fileName?: string;
}

export const TabbedResponseSection: React.FC<TabbedResponseSectionProps> = ({
  solution,
  solutionType,
  data,
  loading,
  error,
  errorDetails,
  maskedBase64,
  fileName
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('processed-image');
  const { copiedBase64, copyBase64 } = useClipboard();
  
  // Determine if this is a verification solution type or QR extract
  const isVerificationSolution = solutionType === 'face-verify' || solutionType === 'signature-verification';
  const isQrExtractSolution = solutionType === 'qr-extract';

  // Set initial tab based on solution type
  useEffect(() => {
    if (isVerificationSolution || isQrExtractSolution) {
      setActiveTab('result');
    } else {
      setActiveTab('processed-image');
    }
  }, [isVerificationSolution, isQrExtractSolution]);

  // REMOVED: Auto-switch to API response tab when error occurs
  // The error will now be handled in the Result tab instead

  // Show processed image tab only for non-verification and non-QR extract solutions
  const showProcessedImageTab = !isVerificationSolution && !isQrExtractSolution;
  const showResultTab = isVerificationSolution || isQrExtractSolution;
  
  // Check if we have processed image data - could be from maskedBase64 or from API response
  const hasProcessedImage = Boolean(
    maskedBase64 && maskedBase64.length > 0 || 
    (data && data.result && typeof data.result === 'string' && data.result.length > 0)
  );
  
  // Get the actual base64 data - prefer maskedBase64 prop, fallback to data.result
  const imageBase64 = maskedBase64 || (data && data.result) || '';

  // Don't disable tabs when there's an error - let users navigate freely
  const isProcessedImageTabDisabled = false;
  const isResultTabDisabled = false;

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden h-full flex flex-col">
      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showProcessedImageTab={showProcessedImageTab}
        showResultTab={showResultTab}
        isProcessedImageTabDisabled={isProcessedImageTabDisabled}
        isResultTabDisabled={isResultTabDisabled}
        isQrExtractSolution={isQrExtractSolution}
      />

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'api-response' && (
          <ApiResponseTab
            solution={solution}
            solutionType={solutionType}
            data={data}
            loading={loading}
            error={error}
            errorDetails={errorDetails}
          />
        )}
        
        {activeTab === 'result' && (
          <div className="p-6 h-full overflow-auto">
            <ResultTab
              data={data}
              solutionType={solutionType}
              loading={loading}
              solution={solution}
              error={error}
              errorDetails={errorDetails}
            />
          </div>
        )}
        
        {activeTab === 'processed-image' && (
          <div className="p-6 h-full overflow-hidden">
            <ProcessedImageTab
              maskedBase64={imageBase64}
              loading={loading}
              solutionType={solutionType}
              fileName={fileName}
              hasProcessedImage={hasProcessedImage}
              copiedBase64={copiedBase64}
              onCopyBase64={copyBase64}
            />
          </div>
        )}
      </div>
    </div>
  );
};