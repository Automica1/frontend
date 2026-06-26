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
  return (
    <div className="flex border-b border-gray-700 flex-shrink-0">
      {showResultTab && (
        <button
          onClick={() => !isResultTabDisabled && setActiveTab('result')}
          disabled={isResultTabDisabled}
          className={`flex-1 flex items-center justify-center space-x-2 px-3 py-3 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'result'
              ? 'bg-purple-600 text-white border-b-2 border-purple-400'
              : isResultTabDisabled
                ? 'text-gray-600 bg-gray-800 cursor-not-allowed'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
          }`}
        >
          {isQrExtractSolution ? (
            <QrCode className={`w-4 h-4 ${isResultTabDisabled ? 'text-gray-600' : ''}`} />
          ) : (
            <Shield className={`w-4 h-4 ${isResultTabDisabled ? 'text-gray-600' : ''}`} />
          )}
          <span>Result</span>
        </button>
      )}

      {showProcessedImageTab && (
        <button
          onClick={() => !isProcessedImageTabDisabled && setActiveTab('processed-image')}
          disabled={isProcessedImageTabDisabled}
          className={`flex-1 flex items-center justify-center space-x-2 px-3 py-3 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'processed-image'
              ? 'bg-purple-600 text-white border-b-2 border-purple-400'
              : isProcessedImageTabDisabled
                ? 'text-gray-600 bg-gray-800 cursor-not-allowed'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
          }`}
        >
          <ImageIcon className={`w-4 h-4 ${isProcessedImageTabDisabled ? 'text-gray-600' : ''}`} />
          <span className="hidden sm:inline">Processed</span>
          <span className="sm:hidden">Image</span>
        </button>
      )}

      <button
        onClick={() => setActiveTab('api-response')}
        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-3 text-sm font-medium transition-colors duration-200 ${
          activeTab === 'api-response'
            ? 'bg-purple-600 text-white border-b-2 border-purple-400'
            : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
        }`}
      >
        <Code className="w-4 h-4" />
        <span className="hidden sm:inline">API Response</span>
        <span className="sm:hidden">API</span>
      </button>

      {showFeedbackTab && (
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 flex items-center justify-center space-x-2 px-3 py-3 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'feedback'
              ? 'bg-purple-600 text-white border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
          }`}
        >
          <MessageSquareText className="w-4 h-4" />
          <span>Feedback</span>
          {tabBadge?.feedback && activeTab !== 'feedback' && (
            <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-medium text-blue-300">
              {tabBadge.feedback}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
