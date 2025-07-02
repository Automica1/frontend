// components/TabbedResponseSection.tsx
import React, { useState } from 'react';
import { Copy, Check, Download, Image as ImageIcon, Code, FileText } from 'lucide-react';
import { Solution, SolutionType } from '../types/solution';
import { getFileRequirementText, getProcessingMessage, getDownloadFileName } from '../../utils/solutionHelpers';

interface TabbedResponseSectionProps {
  solution: Solution;
  solutionType: SolutionType;
  data: any;
  loading: boolean;
  error: string | null;
  maskedBase64?: string;
  fileName?: string;
}

type TabType = 'api-response' | 'processed-image';

export const TabbedResponseSection: React.FC<TabbedResponseSectionProps> = ({
  solution,
  solutionType,
  data,
  loading,
  error,
  maskedBase64,
  fileName
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('processed-image');
  const [copiedBase64, setCopiedBase64] = useState(false);
  
  const Icon = solution.IconComponent;

  // Show processed image tab only if we have a processed image
  const showProcessedImageTab = maskedBase64 && maskedBase64.length > 0;

  const base64ToBlob = (base64: string, mimeType: string = 'image/png'): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const downloadBase64Image = (base64: string, filename: string = 'processed-image.png') => {
    try {
      const blob = base64ToBlob(base64);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedBase64(true);
      setTimeout(() => setCopiedBase64(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text:', err);
      alert('Failed to copy to clipboard');
    });
  };

  const renderTabContent = () => {
    if (activeTab === 'api-response') {
      return (
        <div className="space-y-4">
          {!data && !loading && !error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400">
                {getFileRequirementText(solutionType)} to see the API response
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">{getProcessingMessage(solutionType)}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 bg-red-500 rounded-full" />
                <h4 className="font-semibold text-red-400">Error</h4>
              </div>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {data && (
            <div className="bg-black rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'processed-image' && maskedBase64) {
      return (
        <div className="space-y-4">
          {/* Preview Image */}
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Preview:</p>
            <div className="max-w-full max-h-64 overflow-hidden rounded-lg bg-gray-700 flex items-center justify-center">
              <img 
                src={`data:image/png;base64,${maskedBase64}`} 
                alt="Processed Image" 
                className="max-w-full max-h-64 object-contain"
                onError={(e) => {
                  console.error('Failed to load image preview');
                  console.log('Base64 length:', maskedBase64.length);
                  console.log('Base64 preview:', maskedBase64.substring(0, 100) + '...');
                }}
                onLoad={() => console.log('Image loaded successfully')}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => copyToClipboard(maskedBase64)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors duration-300"
            >
              {copiedBase64 ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Base64 Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Base64</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => downloadBase64Image(maskedBase64, getDownloadFileName(solutionType, fileName))}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors duration-300"
            >
              <Download className="w-4 h-4" />
              <span>Download Image</span>
            </button>
          </div>

          <div className="text-xs text-gray-500 mt-2">
            Base64 length: {maskedBase64.length.toLocaleString()} characters
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
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
        <button
          onClick={() => setActiveTab('processed-image')}
          disabled={!showProcessedImageTab}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 font-medium transition-colors duration-200 ${
            activeTab === 'processed-image' && showProcessedImageTab
              ? 'bg-purple-600 text-white border-b-2 border-purple-400'
              : showProcessedImageTab
              ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
              : 'text-gray-600 cursor-not-allowed'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Processed Image</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};