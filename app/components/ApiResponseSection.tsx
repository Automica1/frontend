// components/ApiResponseSection.tsx
import React from 'react';
import { Solution, SolutionType } from '../types/solution';
import { getFileRequirementText, getProcessingMessage } from '../../utils/solutionHelpers';

interface ApiResponseSectionProps {
  solution: Solution;
  solutionType: SolutionType;
  data: any;
  loading: boolean;
  error: string | null;
}

export const ApiResponseSection: React.FC<ApiResponseSectionProps> = ({
  solution,
  solutionType,
  data,
  loading,
  error
}) => {
  const Icon = solution.IconComponent;

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-4">API Response</h3>
      
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
};