import React from 'react';
import { ApiConfig } from './types';

interface ApiReferenceProps {
  solution: { title: string; slug: string };
  apiConfig: ApiConfig;
  createdApiKey: string;
}

// Response examples for different API endpoints
const getResponseExample = (slug: string): string => {
  const responses: Record<string, string> = {
    'id-crop': `{
  "req_id": "id-crop-1754379697693-4fvjvewkc",
  "success": true,
  "status": "completed",
  "message": "ID cropping completed successfully",
  "result": "base64_cropped_image_data"
}`,
    'face-cropping': `{
  "req_id": "face-cropping-1754379633933-xmms75v8r",
  "success": true,
  "status": "completed",
  "message": "Face detection completed successfully, found 1 face(s)",
  "data": ["base64_face_1", "base64_face_2"]
}`,
    'qr-masking': `{
  "req_id": "qr-mask-1754379535258-f7ru292kx",
  "success": true,
  "status": "completed",
  "message": "QR masking completed successfully",
  "masked_base64": "base64_masked_image_data"
}`,
    'qr-extract': `{
  "req_id": "qr-extract-1754379287443-4daxwf8yv",
  "success": true,
  "status": "completed",
  "message": "QR extraction completed successfully",
  "result": "QR code data: https://example.com/data"
}`,
    'face-verify': `{
  "req_id": "face-verify-1754379362460-eikvsi9lt",
  "success": true,
  "status": "completed",
  "message": "Face verification completed successfully",
  "data": {
    "confidence": 0.999995,
    "verified": true
  }
}`,
    'signature-verification': `{
  "req_id": "sig-verify-1754379128765-1otzv1scr",
  "success": true,
  "status": "completed",
  "message": "Signature verification completed successfully",
  "data": {
    "similarity_percentage": 70.72,
    "classification": "Forged"
  }
}`
  };

  return responses[slug] || `{
  "req_id": "generated-request-id",
  "success": true,
  "status": "completed",
  "message": "Processing completed successfully",
  "data": {}
}`;
};

export const ApiReference: React.FC<ApiReferenceProps> = ({ solution, apiConfig, createdApiKey }) => (
  <div className="space-y-6 sm:space-y-8">
    <div>
      <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">API Reference</h3>
      <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
        Complete reference for the {solution.title} endpoint and parameters.
      </p>
    </div>

    <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
      <h4 className="text-base sm:text-lg font-semibold mb-4">POST {apiConfig.endpoint.replace('https://automica.ai/go', '')}</h4>
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
                <span className="text-gray-300">Unique request identifier for tracking (will be returned in response)</span>
              </div>

              {apiConfig.requestBody.doc_base64 && !Array.isArray(apiConfig.requestBody.doc_base64) && (
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
                  <span className="text-gray-300">Base64 encoded image data (for QR masking)</span>
                </div>
              )}

              {apiConfig.requestBody.doc_base64_1 && (
                <>
                  <div>
                    <span className="text-blue-400 font-mono">doc_base64_1</span>
                    <span className="text-gray-500 mx-2">string</span>
                    <span className="text-gray-300">First image for face verification</span>
                  </div>
                  <div>
                    <span className="text-blue-400 font-mono">doc_base64_2</span>
                    <span className="text-gray-500 mx-2">string</span>
                    <span className="text-gray-300">Second image for face verification</span>
                  </div>
                  <div>
                    <span className="text-blue-400 font-mono">doc_type</span>
                    <span className="text-gray-500 mx-2">string</span>
                    <span className="text-gray-300">Type of document (must be "face")</span>
                  </div>
                </>
              )}

              {Array.isArray(apiConfig.requestBody.doc_base64) && (
                <div>
                  <span className="text-blue-400 font-mono">doc_base64</span>
                  <span className="text-gray-500 mx-2">array</span>
                  <span className="text-gray-300">Array of exactly 2 base64 encoded signature images for comparison</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h5 className="font-semibold mb-2 text-sm sm:text-base">Response</h5>
          <div className="bg-black rounded-lg p-3 sm:p-4">
            <pre className="text-xs sm:text-sm text-gray-300 font-mono overflow-x-auto">
              {getResponseExample(solution.slug)}
            </pre>
          </div>
        </div>

        <div>
          <h5 className="font-semibold mb-2 text-sm sm:text-base">Response Fields</h5>
          <div className="bg-black rounded-lg p-3 sm:p-4">
            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-green-400 font-mono">req_id</span>
                <span className="text-gray-500 mx-2">string</span>
                <span className="text-gray-300">Generated request identifier (format: operation-timestamp-random)</span>
              </div>
              <div>
                <span className="text-green-400 font-mono">success</span>
                <span className="text-gray-500 mx-2">boolean</span>
                <span className="text-gray-300">Indicates if the request was processed successfully</span>
              </div>
              <div>
                <span className="text-green-400 font-mono">status</span>
                <span className="text-gray-500 mx-2">string</span>
                <span className="text-gray-300">Processing status ("completed", "failed", "processing")</span>
              </div>
              <div>
                <span className="text-green-400 font-mono">message</span>
                <span className="text-gray-500 mx-2">string</span>
                <span className="text-gray-300">Human-readable description of the result</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);