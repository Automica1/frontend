// components/TabbedResponseSection/TabNavigation.tsx
import React from 'react';
import { ImageIcon, Code, Shield, QrCode } from 'lucide-react';
import { TabType } from '../../types/tabTypes';

interface TabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  showProcessedImageTab: boolean;
  showResultTab: boolean;
  isProcessedImageTabDisabled: boolean;
  isResultTabDisabled: boolean;
  isQrExtractSolution: boolean;
  fileType: 'image' | 'pdf';
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  showProcessedImageTab,
  showResultTab,
  isProcessedImageTabDisabled,
  isResultTabDisabled,
  isQrExtractSolution
}) => {
  return (
    <div className="flex border-b border-gray-700 flex-shrink-0">
      {/* Result Tab for Verification Solutions and QR Extract */}
      {showResultTab && (
        <button
          onClick={() => !isResultTabDisabled && setActiveTab('result')}
          disabled={isResultTabDisabled}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 font-medium transition-colors duration-200 ${
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

      {/* Processed Image Tab for Non-Verification and Non-QR Extract Solutions */}
      {showProcessedImageTab && (
        <button
          onClick={() => !isProcessedImageTabDisabled && setActiveTab('processed-image')}
          disabled={isProcessedImageTabDisabled}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 font-medium transition-colors duration-200 ${
            activeTab === 'processed-image'
              ? 'bg-purple-600 text-white border-b-2 border-purple-400'
              : isProcessedImageTabDisabled
                ? 'text-gray-600 bg-gray-800 cursor-not-allowed'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
          }`}
        >
          <ImageIcon className={`w-4 h-4 ${isProcessedImageTabDisabled ? 'text-gray-600' : ''}`} />
          <span>Processed Image</span>
        </button>
      )}

      {/* API Response Tab */}
      <button
        onClick={() => setActiveTab('api-response')}
        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 font-medium transition-colors duration-200 ${
          activeTab === 'api-response'
            ? 'bg-purple-600 text-white border-b-2 border-purple-400'
            : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
        }`}
      >
        <Code className="w-4 h-4" />
        <span>API Response</span>
      </button>
    </div>
  );
};