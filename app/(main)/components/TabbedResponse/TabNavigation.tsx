// components/TabbedResponseSection/TabNavigation.tsx
import React from 'react';
import { ImageIcon, Code, Shield, QrCode, MessageSquareText } from 'lucide-react';
import { TabType } from '../../types/tabTypes';

interface TabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  showProcessedImageTab: boolean;
  showResultTab: boolean;
  showFeedbackTab?: boolean;
  isProcessedImageTabDisabled: boolean;
  isResultTabDisabled: boolean;
  isQrExtractSolution: boolean;
  fileType: 'image' | 'pdf';
  tabBadge?: Partial<Record<TabType, string>>;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  showProcessedImageTab,
  showResultTab,
  showFeedbackTab = false,
  isProcessedImageTabDisabled,
  isResultTabDisabled,
  isQrExtractSolution,
  tabBadge,
}) => {
  const tabClass = (tab: TabType, disabled = false) =>
    `flex-1 flex items-center justify-center space-x-2 px-3 py-3 text-sm font-medium transition-colors duration-200 ${
      activeTab === tab
        ? 'bg-purple-600 text-white border-b-2 border-purple-400'
        : disabled
          ? 'text-gray-600 bg-gray-800 cursor-not-allowed'
          : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
    }`;

  const feedbackButton = showFeedbackTab ? (
    <button type="button" onClick={() => setActiveTab('feedback')} className={tabClass('feedback')}>
      <MessageSquareText className="w-4 h-4" />
      <span>Feedback</span>
      {tabBadge?.feedback && activeTab !== 'feedback' && (
        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-200">
          {tabBadge.feedback}
        </span>
      )}
    </button>
  ) : null;

  const resultButton = showResultTab ? (
    <button
      type="button"
      onClick={() => !isResultTabDisabled && setActiveTab('result')}
      disabled={isResultTabDisabled}
      className={tabClass('result', isResultTabDisabled)}
    >
      {isQrExtractSolution ? (
        <QrCode className={`w-4 h-4 ${isResultTabDisabled ? 'text-gray-600' : ''}`} />
      ) : (
        <Shield className={`w-4 h-4 ${isResultTabDisabled ? 'text-gray-600' : ''}`} />
      )}
      <span>Result</span>
    </button>
  ) : null;

  const apiButton = (
    <button type="button" onClick={() => setActiveTab('api-response')} className={tabClass('api-response')}>
      <Code className="w-4 h-4" />
      <span className="hidden sm:inline">API Response</span>
      <span className="sm:hidden">API</span>
    </button>
  );

  return (
    <div className="flex border-b border-gray-700 flex-shrink-0">
      {showFeedbackTab ? (
        <>
          {feedbackButton}
          {resultButton}
          {apiButton}
        </>
      ) : (
        <>
          {resultButton}
          {showProcessedImageTab && (
            <button
              type="button"
              onClick={() => !isProcessedImageTabDisabled && setActiveTab('processed-image')}
              disabled={isProcessedImageTabDisabled}
              className={tabClass('processed-image', isProcessedImageTabDisabled)}
            >
              <ImageIcon className={`w-4 h-4 ${isProcessedImageTabDisabled ? 'text-gray-600' : ''}`} />
              <span className="hidden sm:inline">Processed</span>
              <span className="sm:hidden">Image</span>
            </button>
          )}
          {apiButton}
        </>
      )}
    </div>
  );
};
