// hooks/useApiKey.ts
import { useState } from 'react';

export const useApiKey = () => {
  const [isCreatingApiKey, setIsCreatingApiKey] = useState(false);
  const [createdApiKey, setCreatedApiKey] = useState<string>('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [showApiKeySuccess, setShowApiKeySuccess] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string>('');

  const handleCreateApiKey = async () => {
    try {
      setIsCreatingApiKey(true);
      setApiKeyError('');
      
      // Simulate API key creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newApiKey = `ak_${Math.random().toString(36).substr(2, 32)}`;
      
      setCreatedApiKey(newApiKey);
      setApiKeyVisible(true);
      setShowApiKeySuccess(true);
      
      // Hide the success state after 30 seconds for security
      setTimeout(() => {
        setShowApiKeySuccess(false);
        setCreatedApiKey('');
        setApiKeyVisible(false);
      }, 30000);
      
    } catch (error) {
      console.error('Failed to create API key:', error);
      setApiKeyError(error instanceof Error ? error.message : 'Failed to create API key');
    } finally {
      setIsCreatingApiKey(false);
    }
  };

  return {
    isCreatingApiKey,
    createdApiKey,
    apiKeyVisible,
    showApiKeySuccess,
    apiKeyError,
    handleCreateApiKey,
    setApiKeyVisible
  };
};