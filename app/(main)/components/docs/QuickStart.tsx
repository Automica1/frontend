// / components/QuickStart.tsx
import React from 'react';
import { StepCard } from './StepCard';
import { ApiKeyCreation } from './ApiKeyCreation';
import { CodeBlock } from './CodeBlock';
import { ApiConfig } from './types';

interface QuickStartProps {
  solution: {
    title: string;
    gradient: string;
    slug: string;
  };
  apiConfig: ApiConfig;
  apiKeyState: {
    isCreatingApiKey: boolean;
    createdApiKey: string;
    apiKeyVisible: boolean;
    showApiKeySuccess: boolean;
    apiKeyError: string;
    handleCreateApiKey: () => void;
    setApiKeyVisible: (visible: boolean) => void;
  };
  copied: string;
  onCopy: (text: string, id: string) => void;
}

// Get appropriate response example for quick start
const getQuickStartResponse = (slug: string): string => {
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
  "data": ["base64_face_1"]
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
  "result": "QR code data: https://example.com/link"
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
  "message": "Processing completed successfully"
}`;
};

export const QuickStart: React.FC<QuickStartProps> = ({ 
  solution, 
  apiConfig, 
  apiKeyState, 
  copied, 
  onCopy 
}) => (
  <div className="space-y-6 sm:space-y-8">
    <div>
      <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Getting Started</h3>
      <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
        Get up and running with our {solution.title} API in just a few steps. No complex setup required.
      </p>
      
      <div className="space-y-4 sm:space-y-6">
        <StepCard
          stepNumber={1}
          title="Get Your API Key"
          description="Sign up for a free account and get your API key from the dashboard."
        >
          <ApiKeyCreation
            {...apiKeyState}
            gradient={solution.gradient}
            onToggleVisibility={() => apiKeyState.setApiKeyVisible(!apiKeyState.apiKeyVisible)}
            copied={copied}
            onCopy={onCopy}
            onCreateApiKey={apiKeyState.handleCreateApiKey}
          />
        </StepCard>

        <StepCard
          stepNumber={2}
          title="Make Your First Request"
          description={`${apiConfig.description}. Use curl or any HTTP client to make your first API call.`}
        >
          <CodeBlock
            code={`curl -X POST "${apiConfig.endpoint}" \\
  -H "Authorization: Bearer ${apiKeyState.createdApiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(apiConfig.requestBody, null, 2)}'`}
            copyId="quickstart-curl"
            copied={copied}
            onCopy={onCopy}
          />
        </StepCard>

        <StepCard
          stepNumber={3}
          title="Handle the Response"
          description="Process the JSON response from our API. Each response includes a generated request ID and processing status."
        >
          <CodeBlock
            code={getQuickStartResponse(solution.slug)}
            copyId="quickstart-response"
            copied={copied}
            onCopy={onCopy}
          />
        </StepCard>
      </div>
    </div>
  </div>
);