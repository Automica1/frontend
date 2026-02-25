// hooks/useApiKey.ts
import { useState } from 'react';
// Import your service - adjust the path as needed
import createApiKey from '../lib/apiService'; // Adjust import path

export const useApiKey = () => {
  const [isCreatingApiKey, setIsCreatingApiKey] = useState(false);
  const [createdApiKey, setCreatedApiKey] = useState('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [showApiKeySuccess, setShowApiKeySuccess] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');

  // Initialize your service instance
  const apiService = createApiKey; // Adjust as needed

  const handleCreateApiKey = async () => {
    try {
      setIsCreatingApiKey(true);
      setApiKeyError('');
      
      // 🔥 REAL API CALL - Replace the mock with actual service call
      const response = await apiService.createApiKey();
      
      // Use the real API key from your backend response
      const newApiKey = response.apiKey; // Based on your Postman response structure
      
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