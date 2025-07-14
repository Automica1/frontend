// components/TabbedResponseSection/EnhancedErrorDisplay.tsx
import React from 'react';
import { AlertCircle, Info, Lightbulb } from 'lucide-react';

interface EnhancedErrorDisplayProps {
  error: string;
  errorDetails?: any;
}

export const EnhancedErrorDisplay: React.FC<EnhancedErrorDisplayProps> = ({
  error,
  errorDetails
}) => {
  return (
    <div className="space-y-4 m-6">
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-400 mb-2">Error Occurred</h4>
            <p className="text-red-300 text-sm mb-3">{error}</p>
          </div>
        </div>
      </div>

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

      {errorDetails?.status && (
        <div className="text-xs text-gray-500 mt-2">
          Status: {errorDetails.status} | Type: {errorDetails.type || 'Unknown'}
        </div>
      )}
    </div>
  );
};