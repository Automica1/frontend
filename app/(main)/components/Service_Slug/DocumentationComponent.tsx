// Main DocumentationComponent.tsx
import React, { useState } from 'react';
import { DocumentationComponentProps } from '../docs/types';
import { getApiConfig } from '../docs/apiConfigs';
import { useApiKey } from '../../hooks/useApiKey';
import { TabNavigation } from '../docs/TabNavigation';
import { QuickStart } from '../docs/QuickStart';
import { ApiReference } from '../docs/ApiReference';
import { Examples } from '../docs/Examples';

export default function DocumentationComponent({ solution }: DocumentationComponentProps) {
  const [copied, setCopied] = useState('');
  const [activeTab, setActiveTab] = useState('quickstart');
  
  const apiKeyState = useApiKey();
  const apiConfig = getApiConfig(solution.slug);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-16 px-3 sm:px-4">
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'quickstart' && (
        <QuickStart
          solution={solution}
          apiConfig={apiConfig}
          apiKeyState={apiKeyState}
          copied={copied}
          onCopy={copyToClipboard}
        />
      )}
      
      {activeTab === 'reference' && (
        <ApiReference
          solution={solution}
          apiConfig={apiConfig}
          createdApiKey={apiKeyState.createdApiKey}
        />
      )}
      
      {activeTab === 'examples' && (
        <Examples
          solution={solution}
          apiConfig={apiConfig}
          createdApiKey={apiKeyState.createdApiKey}
        />
      )}
    </div>
  );
}