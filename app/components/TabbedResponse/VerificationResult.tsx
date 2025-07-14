// components/TabbedResponseSection/VerificationResult.tsx
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Shield } from 'lucide-react';
import { SolutionType } from '../../types/solution';

interface VerificationResultProps {
  data: any;
  solutionType: SolutionType;
}

export const VerificationResult: React.FC<VerificationResultProps> = ({
  data,
  solutionType
}) => {
  // Extract verification data for face-verify and signature-verification
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

      
    </div>
  );
};