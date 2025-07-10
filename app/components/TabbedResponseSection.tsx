// components/TabbedResponseSection.tsx with enhanced error handling and face detection support
import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, Image as ImageIcon, Code, FileText, AlertCircle, Info, Lightbulb, CheckCircle, XCircle, Shield } from 'lucide-react';
import { Solution, SolutionType } from '../types/solution';
import { getFileRequirementText, getProcessingMessage, getDownloadFileName } from '../../utils/solutionHelpers';
import './terminal.css'

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

type TabType = 'api-response' | 'processed-image' | 'result';

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
  const [copiedBase64, setCopiedBase64] = useState(false);
  const [copiedApiResponse, setCopiedApiResponse] = useState(false);
  
  const Icon = solution.IconComponent;

  // Determine if this is a verification solution type
  const isVerificationSolution = solutionType === 'face-verify' || solutionType === 'signature-verification';

  // Set initial tab based on solution type
  useEffect(() => {
    if (isVerificationSolution) {
      setActiveTab('result');
    } else {
      setActiveTab('processed-image');
    }
  }, [isVerificationSolution]);

  // Switch to API response tab when error occurs
  useEffect(() => {
    if (error) {
      setActiveTab('api-response');
    }
  }, [error]);

  // Show processed image tab only for non-verification solutions
  const showProcessedImageTab = !isVerificationSolution;
  const showResultTab = isVerificationSolution;
  const hasProcessedImage = maskedBase64 && maskedBase64.length > 0;

  // Disable processed image tab when there's an error
  const isProcessedImageTabDisabled = !!error;
  const isResultTabDisabled = !!error;

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

  const copyToClipboard = (text: string, type: 'base64' | 'api-response') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'base64') {
        setCopiedBase64(true);
        setTimeout(() => setCopiedBase64(false), 2000);
      } else {
        setCopiedApiResponse(true);
        setTimeout(() => setCopiedApiResponse(false), 2000);
      }
    }).catch(err => {
      console.error('Failed to copy text:', err);
      alert('Failed to copy to clipboard');
    });
  };

  // Function to format the API response data properly
  const formatApiResponse = (responseData: any) => {
    if (!responseData) return '';
    
    // For face verification, show only faceResult
    if (solutionType === 'face-verify' && responseData.faceResult && typeof responseData.faceResult === 'object') {
      return JSON.stringify(responseData.faceResult, null, 2);
    }
    
    // For signature verification, show only verification_result
    if (solutionType === 'signature-verification' && responseData.verification_result && typeof responseData.verification_result === 'object') {
      return JSON.stringify(responseData.verification_result, null, 2);
    }
    
    // For qr-mask, show only qrResult
    if (solutionType === 'qr-mask' && responseData.qrResult && typeof responseData.qrResult === 'object') {
      return JSON.stringify(responseData.qrResult, null, 2);
    }
    
    // Extract only the cropResult object if it exists
    if (responseData.cropResult && typeof responseData.cropResult === 'object') {
      const cropResult = {
        req_id: responseData.cropResult.req_id,
        success: responseData.cropResult.success,
        status: responseData.cropResult.status,
        result: responseData.cropResult.result,
        message: responseData.cropResult.message
      };
      return JSON.stringify(cropResult, null, 2);
    }
    
    // Fallback to full response if cropResult doesn't exist
    return JSON.stringify(responseData, null, 2);
  };

  const renderEnhancedError = () => {
    if (!error) return null;

    return (
      <div className="space-y-4 m-6">
        {/* Main Error Card */}
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-400 mb-2">Error Occurred</h4>
              <p className="text-red-300 text-sm mb-3">{error}</p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        {errorDetails?.technical_message && (
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-blue-400 mb-2">Technical Details</h5>
                <p className="text-gray-300 text-sm">{errorDetails.technical_message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Suggestion */}
        {errorDetails?.suggestion && (
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-yellow-400 mb-2">Suggestion</h5>
                <p className="text-yellow-200 text-sm">{errorDetails.suggestion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Error Info */}
        {errorDetails?.status && (
          <div className="text-xs text-gray-500 mt-2">
            Status: {errorDetails.status} | Type: {errorDetails.type || 'Unknown'}
          </div>
        )}
      </div>
    );
  };

  const renderApiResponseTab = () => {
    return (
      <div className="h-full flex flex-col">
        {!data && !loading && !error && (
          <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400">
              {getFileRequirementText(solutionType)} to see the API response
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">{getProcessingMessage(solutionType)}</p>
          </div>
        )}

        {error && renderEnhancedError()}

        {data && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Terminal-style Scrollable Response Container */}
            <div className="bg-black rounded-none border-0 flex-1 min-h-0 flex flex-col">
              <div className="flex justify-end flex-shrink-0 cursor-pointer">
                <button
                  onClick={() => copyToClipboard(formatApiResponse(data), 'api-response')}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors duration-300"
                >
                  {copiedApiResponse ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Response</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Scrollable Content */}
              <div className="p-4 custom-scrollbar flex-1 min-h-0">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words overflow-wrap-anywhere leading-relaxed">
                  {formatApiResponse(data)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderResultTab = () => {
    if (!data) {
      return (
        <div className="text-center py-12 h-full flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-400">
            {loading ? getProcessingMessage(solutionType) : `${getFileRequirementText(solutionType)} to see the verification result`}
          </p>
          {loading && (
            <div className="w-16 h-16 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mt-4" />
          )}
        </div>
      );
    }

    // Extract verification data
    let verificationData = null;
    if (solutionType === 'face-verify' && data.faceResult?.data) {
      verificationData = data.faceResult.data;
    } else if (solutionType === 'signature-verification' && data.verification_result?.data) {
      verificationData = data.verification_result.data;
    }

    if (!verificationData) {
      return (
        <div className="text-center py-12 h-full flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-400">No verification data available</p>
        </div>
      );
    }

    const getStatusColor = (classification: string) => {
      const lowerClass = classification?.toLowerCase();
      if (lowerClass === 'genuine' || lowerClass === 'match') {
        return 'text-green-400';
      } else if (lowerClass === 'fake' || lowerClass === 'no match') {
        return 'text-red-400';
      }
      return 'text-yellow-400';
    };

    const getStatusIcon = (classification: string) => {
      const lowerClass = classification?.toLowerCase();
      if (lowerClass === 'genuine' || lowerClass === 'match') {
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      } else if (lowerClass === 'fake' || lowerClass === 'no match') {
        return <XCircle className="w-5 h-5 text-red-400" />;
      }
      return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    };

    return (
      <div className="space-y-6 h-full flex flex-col">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            {solutionType === 'face-verify' ? 'Face Verification Result' : 'Signature Verification Result'}
          </h3>
          <p className="text-gray-400">Verification completed successfully</p>
        </div>

        {/* Main Result Card */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="space-y-4">
            {Object.entries(verificationData).map(([key, value]) => {
              const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const isClassification = key.toLowerCase().includes('classification');
              const isPercentage = key.toLowerCase().includes('percentage') || key.toLowerCase().includes('similarity');
              
              return (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    {isClassification && getStatusIcon(String(value))}
                    <span className="text-gray-300 font-medium">{displayKey}:</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold ${
                      isClassification ? getStatusColor(String(value)) : 
                      isPercentage ? 'text-blue-400' : 'text-white'
                    }`}>
                      {isPercentage ? `${value}%` : String(value)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Summary */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300">
              Verification Status: 
              <span className={`ml-2 font-semibold ${
                verificationData.classification ? getStatusColor(verificationData.classification) : 'text-white'
              }`}>
                {verificationData.classification || 'Completed'}
              </span>
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="text-xs text-gray-500 text-center mt-auto">
          {solutionType === 'face-verify' && data.faceResult?.req_id && (
            <p>Request ID: {data.faceResult.req_id}</p>
          )}
          {solutionType === 'signature-verification' && data.verification_result?.req_id && (
            <p>Request ID: {data.verification_result.req_id}</p>
          )}
        </div>
      </div>
    );
  };

const renderProcessedImageTab = () => {
  if (!hasProcessedImage) {
    return (
      <div className="text-center py-12 h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-gray-400">
          {loading ? getProcessingMessage(solutionType) : `${getFileRequirementText(solutionType)} to see the processed image`}
        </p>
        {loading && (
          <div className="w-16 h-16 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mt-4" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Preview Image */}
      <div className="bg-gray-800 rounded-lg p-4 flex-1 flex flex-col min-h-0">
        <p className="text-sm text-gray-400 mb-2 flex-shrink-0">Preview:</p>
        <div className="flex-1 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden min-h-0 relative">
          <div className="w-full h-full flex items-center justify-center p-2">
            <img 
              src={`data:image/png;base64,${maskedBase64}`} 
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
                console.log('Base64 length:', maskedBase64.length);
                console.log('Base64 preview:', maskedBase64.substring(0, 100) + '...');
              }}
              onLoad={() => console.log('Image loaded successfully')}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
        <button
          onClick={() => copyToClipboard(maskedBase64, 'base64')}
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

      <div className="text-xs text-gray-500 mt-2 flex-shrink-0">
        Base64 length: {maskedBase64.length.toLocaleString()} characters
      </div>
    </div>
  );
};

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700 flex-shrink-0">
        {/* Result Tab for Verification Solutions */}
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
            <Shield className={`w-4 h-4 ${isResultTabDisabled ? 'text-gray-600' : ''}`} />
            <span>Result</span>
          </button>
        )}

        {/* Processed Image Tab for Non-Verification Solutions */}
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

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'api-response' && renderApiResponseTab()}
        {activeTab === 'result' && (
          <div className="p-6 h-full overflow-auto">
            {renderResultTab()}
          </div>
        )}
        {activeTab === 'processed-image' && (
          <div className="p-6 h-full overflow-hidden">
            {renderProcessedImageTab()}
          </div>
        )}
      </div>
    </div>
  );
};