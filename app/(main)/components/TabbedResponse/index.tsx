// components/TabbedResponseSection/index.tsx
import React, { useState, useEffect } from 'react';
import { Solution, SolutionType } from '../../types/solution';
import { TabType } from '../../types/tabTypes';
import { TabNavigation } from './TabNavigation';
import { ApiResponseTab } from './ApiResponseTab';
import { ProcessedImageTab } from './ProcessedImageTab';
import { ResultTab } from './ResultTab';
import { RotateCcw, Undo2 } from 'lucide-react';
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
  onRetry?: () => void;
  onReset?: () => void;
  feedbackTab?: React.ReactNode;
  showFeedbackTab?: boolean;
  feedbackTabBadge?: string;
  defaultTab?: TabType;
  hideRetry?: boolean;
}

export const TabbedResponseSection: React.FC<TabbedResponseSectionProps> = ({
  solution,
  solutionType,
  data,
  loading,
  error,
  errorDetails,
  maskedBase64,
  fileName,
  onRetry,
  onReset,
  feedbackTab,
  showFeedbackTab = false,
  feedbackTabBadge,
  defaultTab,
  hideRetry = false,
}) => {
  const isVerificationSolution = solutionType === 'face-verify' || solutionType === 'signature-verification';
  const isQrExtractSolution = solutionType === 'qr-extract';

  const resolveInitialTab = (): TabType => {
    if (defaultTab) return defaultTab;
    if (showFeedbackTab) return 'feedback';
    if (isVerificationSolution || isQrExtractSolution) return 'result';
    return 'processed-image';
  };

  const [activeTab, setActiveTab] = useState<TabType>(resolveInitialTab);
  const { copiedBase64, copyBase64 } = useClipboard();

  useEffect(() => {
    if (!loading && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, loading]);

  useEffect(() => {
    if (showFeedbackTab && !loading) {
      setActiveTab('feedback');
    }
  }, [showFeedbackTab, loading]);

  const detectFileType = (): 'image' | 'pdf' => {
    if (fileName) {
      const extension = fileName.toLowerCase().split('.').pop();
      if (extension === 'pdf') return 'pdf';
      if (['png', 'jpg', 'jpeg'].includes(extension || '')) return 'image';
    }

    const pdfSolutionTypes: SolutionType[] = [];
    if (pdfSolutionTypes.includes(solutionType)) return 'pdf';

    if (data?.mimeType) {
      if (data.mimeType.includes('pdf')) return 'pdf';
      if (data.mimeType.includes('image')) return 'image';
    }

    const base64Data = maskedBase64 || (data && data.result) || '';
    if (base64Data) {
      try {
        const decoded = atob(base64Data.substring(0, 20));
        if (decoded.startsWith('%PDF')) return 'pdf';
      } catch (e) {
        // Ignore decode errors
      }
    }

    return 'image';
  };

  const fileType = detectFileType();
  const mimeType = fileType === 'pdf' ? 'application/pdf' : 'image/png';

  const showProcessedImageTab = !isVerificationSolution && !isQrExtractSolution;
  const showResultTab = isVerificationSolution || isQrExtractSolution;

  const hasProcessedImage = Boolean(
    maskedBase64 && maskedBase64.length > 0 ||
    (data && data.result && typeof data.result === 'string' && data.result.length > 0)
  );

  const imageBase64 = maskedBase64 || (data && data.result) || '';
  const isProcessedImageTabDisabled = false;
  const isResultTabDisabled = false;
  const showRetry = Boolean(onRetry && !hideRetry);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden h-full flex flex-col">
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showProcessedImageTab={showProcessedImageTab}
        showResultTab={showResultTab}
        showFeedbackTab={showFeedbackTab}
        isProcessedImageTabDisabled={isProcessedImageTabDisabled}
        isResultTabDisabled={isResultTabDisabled}
        isQrExtractSolution={isQrExtractSolution}
        fileType={fileType}
        tabBadge={feedbackTabBadge ? { feedback: feedbackTabBadge } : undefined}
      />

      <div className="flex-1 min-h-0 overflow-hidden">
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
          <div className="p-4 h-full overflow-y-auto">
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

        {activeTab === 'feedback' && feedbackTab && (
          <div className="p-4 h-full overflow-y-auto">{feedbackTab}</div>
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
              error={error}
              errorDetails={errorDetails}
              fileType={fileType}
              mimeType={mimeType}
            />
          </div>
        )}
      </div>

      {!loading && (showRetry || onReset) && (
        <div className="flex-shrink-0 border-t border-gray-700 p-4">
          <div className={`flex gap-3 ${showRetry && onReset ? '' : ''}`}>
            {showRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800/70 px-4 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:border-gray-600 hover:bg-gray-800"
              >
                <RotateCcw className="h-4 w-4 text-gray-400" />
                Retry
              </button>
            )}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className={`${showRetry ? 'flex-1' : 'w-full'} inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800/70 px-4 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:border-gray-600 hover:bg-gray-800`}
              >
                <Undo2 className="h-4 w-4 text-gray-400" />
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
