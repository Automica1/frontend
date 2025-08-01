// components/TabbedResponseSection/ProcessedImageTab.tsx
import React, { useState } from 'react';
import { Copy, Check, Download, Image as ImageIcon, FileText, AlertCircle, Info } from 'lucide-react';
import { SolutionType } from '../../types/solution';
import { getFileRequirementText, getProcessingMessage, getDownloadFileName } from '../../../utils/solutionHelpers';

interface ProcessedImageTabProps {
  solutionType: SolutionType;
  loading: boolean;
  maskedBase64?: string;
  fileName?: string;
  hasProcessedImage: boolean;
  copiedBase64: boolean;
  onCopyBase64: (base64: string) => void;
  error?: string | null;
  errorDetails?: any | null;
  fileType?: 'image' | 'pdf'; // New prop to specify file type
  mimeType?: string; // Optional mime type for more specific handling
  tabTitle?: string; // Optional custom tab title
}

export const ProcessedImageTab: React.FC<ProcessedImageTabProps> = ({
  solutionType,
  loading,
  maskedBase64,
  fileName,
  hasProcessedImage,
  copiedBase64,
  onCopyBase64,
  error,
  errorDetails,
  fileType = 'image', // Default to image for backward compatibility
  mimeType,
  tabTitle
}) => {
  // Determine actual file type and mime type
  const getActualFileType = (): 'image' | 'pdf' => {
    if (mimeType) {
      if (mimeType.includes('pdf')) return 'pdf';
      if (mimeType.includes('image')) return 'image';
    }
    return fileType;
  };

  const getActualMimeType = (): string => {
    if (mimeType) return mimeType;
    const actualFileType = getActualFileType();
    return actualFileType === 'pdf' ? 'application/pdf' : 'image/png';
  };

  const actualFileType = getActualFileType();
  const actualMimeType = getActualMimeType();

  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const downloadBase64File = (base64: string, filename: string) => {
    try {
      const blob = base64ToBlob(base64, actualMimeType);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert(`Failed to download ${actualFileType}. Please try again.`);
    }
  };

  const getDefaultFileName = (): string => {
    const baseFileName = getDownloadFileName(solutionType, fileName);
    if (actualFileType === 'pdf') {
      return baseFileName.replace(/\.(png|jpg|jpeg)$/i, '.pdf');
    }
    return baseFileName;
  };

  const renderPreview = () => {
    if (actualFileType === 'pdf') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          <FileText className="w-16 h-16 text-gray-400 mb-4" />
          {/* <p className="text-gray-300 text-center mb-2">PDF Document</p>
          <p className="text-gray-500 text-sm text-center mb-4">
            Click "Download PDF" to view the processed document
          </p> */}
          {/* Optional: Add embedded PDF viewer */}
          <div className="w-full max-w-md border border-gray-600 rounded bg-gray-600">
            <iframe
              src={`data:${actualMimeType};base64,${maskedBase64}`}
              width="100%"
              height="200"
              className="rounded"
              title="PDF Preview"
              onError={() => console.error('PDF preview failed')}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-full h-full flex items-center justify-center p-2">
          <img 
            src={`data:${actualMimeType};base64,${maskedBase64}`} 
            alt="Processed Image" 
            className="max-w-full max-h-full object-contain w-auto h-auto"
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%',
              width: 'auto',
              height: 'auto'
            }}
            onError={(e) => {
              console.error('Failed to load image preview');
              console.log('Base64 length:', maskedBase64?.length);
              console.log('Base64 preview:', maskedBase64?.substring(0, 100) + '...');
            }}
            onLoad={() => console.log('Image loaded successfully')}
          />
        </div>
      );
    }
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            {actualFileType === 'pdf' ? 'PDF' : 'Image'} Processing Failed
          </h3>
        </div>

        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-400 mb-3 text-lg">Technical Error</h4>
              <p className="text-red-300 mb-4 leading-relaxed">{error}</p>
              
              {errorDetails?.technical_message && (
                <div className="">
                  <div>
                    <p className="text-gray-300 text-sm">{errorDetails.technical_message}</p>
                  </div>
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

  if (!hasProcessedImage) {
    return (
      <div className="text-center py-12 h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          {actualFileType === 'pdf' ? (
            <FileText className="w-8 h-8 text-gray-600" />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-600" />
          )}
        </div>
        <p className="text-gray-400">
          {loading ? getProcessingMessage(solutionType) : `${getFileRequirementText(solutionType)} to see the processed ${actualFileType}`}
        </p>
        {loading && (
          <div className="w-16 h-16 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mt-4" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="bg-gray-800 rounded-lg p-4 flex-1 flex flex-col min-h-0">
        <p className="text-sm text-gray-400 mb-2 flex-shrink-0">Preview:</p>
        <div className="flex-1 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden min-h-0 relative">
          {renderPreview()}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
        <button
          onClick={() => onCopyBase64(maskedBase64!)}
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
          onClick={() => downloadBase64File(maskedBase64!, getDefaultFileName())}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors duration-300"
        >
          <Download className="w-4 h-4" />
          <span>Download {actualFileType === 'pdf' ? 'PDF' : 'Image'}</span>
        </button>
      </div>

      <div className="text-xs text-gray-500 mt-2 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
          <span>Base64 length: {maskedBase64?.length.toLocaleString()} characters</span>
          <span>Type: {actualFileType.toUpperCase()} ({actualMimeType})</span>
        </div>
      </div>
    </div>
  );
};