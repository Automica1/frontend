// components/QuickStart.tsx
import React from 'react';
import { StepCard } from './StepCard';
import { ApiKeyCreation } from './ApiKeyCreation';
import { CodeBlock } from './CodeBlock';
import { ApiConfig } from './types';

interface QuickStartProps {
  solution: {
    title: string;
    gradient: string;
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
          description="Process the JSON response from our API."
        >
          <CodeBlock
            code={`{
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
            copyId="quickstart-response"
            copied={copied}
            onCopy={onCopy}
          />
        </StepCard>
      </div>
    </div>
  </div>
);