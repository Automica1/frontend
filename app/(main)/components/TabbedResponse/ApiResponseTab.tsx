// components/TabbedResponseSection/ApiResponseTab.tsx
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Solution, SolutionType } from '../../types/solution';
import { getFileRequirementText, getProcessingMessage } from '../../../utils/solutionHelpers';
// import { EnhancedErrorDisplay } from './EnhancedErrorDisplay';
import '../terminal.css';

interface ApiResponseTabProps {
  solution: Solution;
  solutionType: SolutionType;
  data: any;
  loading: boolean;
  error: string | null;
  errorDetails?: any | null;
}

export const ApiResponseTab: React.FC<ApiResponseTabProps> = ({
  solution,
  solutionType,
  data,
  loading,
  error,
  errorDetails
}) => {
  const [copiedApiResponse, setCopiedApiResponse] = useState(false);
  const Icon = solution.IconComponent;

  const formatApiResponse = (responseData: any) => {
    if (!responseData) return '';
    
    // For face verification, show only faceResult
    if (solutionType === 'face-verify' && responseData.faceResult && typeof responseData.faceResult === 'object') {
      return JSON.stringify(responseData.faceResult, null, 2);
    }
    
    if (solutionType === 'face-cropping' && responseData.faceResult && typeof responseData.faceResult === 'object') {
      return JSON.stringify(responseData.faceResult, null, 2);
    }

    if (solutionType === 'qr-extract' && responseData.qrResult && typeof responseData.qrResult === 'object') {
      return JSON.stringify(responseData.qrResult, null, 2);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedApiResponse(true);
      setTimeout(() => setCopiedApiResponse(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text:', err);
      alert('Failed to copy to clipboard');
    });
  };

  const getErrorResponse = () => {
    if (errorDetails) {
      return JSON.stringify(errorDetails, null, 2);
    }
    return JSON.stringify({ error: error }, null, 2);
  };

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

      {/* {error && <EnhancedErrorDisplay error={error} errorDetails={errorDetails} />} */}

      {(data || error) && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="bg-black rounded-none border-0 flex-1 min-h-0 flex flex-col">
            <div className="flex justify-end flex-shrink-0 cursor-pointer">
              <button
                onClick={() => copyToClipboard(formatApiResponse(data))}
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
            
            <div className="p-4 custom-scrollbar flex-1 min-h-0">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words overflow-wrap-anywhere leading-relaxed">
                {error ? getErrorResponse() : formatApiResponse(data)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};