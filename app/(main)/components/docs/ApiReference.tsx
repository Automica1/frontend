// components/ApiReference.tsx
import React from 'react';
import { ApiConfig } from './types';

interface ApiReferenceProps {
  solution: { title: string };
  apiConfig: ApiConfig;
  createdApiKey: string;
}

export const ApiReference: React.FC<ApiReferenceProps> = ({ solution, apiConfig, createdApiKey }) => (
  <div className="space-y-6 sm:space-y-8">
    <div>
      <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">API Reference</h3>
      <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
        Complete reference for the {solution.title} endpoint and parameters.
      </p>
    </div>

    <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
      <h4 className="text-base sm:text-lg font-semibold mb-4">POST {apiConfig.endpoint.replace('https://dev.automica.ai/go', '')}</h4>
      <p className="text-gray-300 mb-4 text-sm sm:text-base">
        {apiConfig.description}
      </p>
      
      <div className="space-y-4">
        <div>
          <h5 className="font-semibold mb-2 text-sm sm:text-base">Request Headers</h5>
          <div className="bg-black rounded-lg p-3 sm:p-4">
            <pre className="text-xs sm:text-sm text-gray-300 font-mono overflow-x-auto">
{`Authorization: Bearer ${createdApiKey || 'YOUR_API_KEY'}
Content-Type: application/json`}
            </pre>
          </div>
        </div>

        <div>
          <h5 className="font-semibold mb-2 text-sm sm:text-base">Request Body</h5>
          <div className="bg-black rounded-lg p-3 sm:p-4">
            <pre className="text-xs sm:text-sm text-gray-300 font-mono overflow-x-auto">
{JSON.stringify(apiConfig.requestBody, null, 2)}
            </pre>
          </div>
        </div>

        <div>
          <h5 className="font-semibold mb-2 text-sm sm:text-base">Parameters</h5>
          <div className="bg-black rounded-lg p-3 sm:p-4">
            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-blue-400 font-mono">req_id</span>
                <span className="text-gray-500 mx-2">string</span>
                <span className="text-gray-300">Unique request identifier for tracking</span>
              </div>
              
              {apiConfig.requestBody.doc_base64 && (
                <div>
                  <span className="text-blue-400 font-mono">doc_base64</span>
                  <span className="text-gray-500 mx-2">string</span>
                  <span className="text-gray-300">Base64 encoded image data</span>
                </div>
              )}
              
              {apiConfig.requestBody.base64_str && (
                <div>
                  <span className="text-blue-400 font-mono">base64_str</span>
                  <span className="text-gray-500 mx-2">string</span>
                  <span className="text-gray-300">Base64 encoded image data</span>
                </div>
              )}
              
              {apiConfig.requestBody.doc_base64_1 && (
                <>
                  <div>
                    <span className="text-blue-400 font-mono">doc_base64_1</span>
                    <span className="text-gray-500 mx-2">string</span>
                    <span className="text-gray-300">First image for comparison</span>
                  </div>
                  <div>
                    <span className="text-blue-400 font-mono">doc_base64_2</span>
                    <span className="text-gray-500 mx-2">string</span>
                    <span className="text-gray-300">Second image for comparison</span>
                  </div>
                  <div>
                    <span className="text-blue-400 font-mono">doc_type</span>
                    <span className="text-gray-500 mx-2">string</span>
                    <span className="text-gray-300">Type of document ("face")</span>
                  </div>
                </>
              )}
              
              {Array.isArray(apiConfig.requestBody.doc_base64) && (
                <div>
                  <span className="text-blue-400 font-mono">doc_base64</span>
                  <span className="text-gray-500 mx-2">array</span>
                  <span className="text-gray-300">Array of base64 encoded signature images</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h5 className="font-semibold mb-2 text-sm sm:text-base">Response</h5>
          <div className="bg-black rounded-lg p-3 sm:p-4">
            <pre className="text-xs sm:text-sm text-gray-300 font-mono overflow-x-auto">
{`{
  "success": true,
  "req_id": "123",
  "data": {
    "processed": true,
    "confidence": 0.95,
    "processing_time": "1.2s"
  },
  "usage": {
    "requests_remaining": 999
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  </div>
);