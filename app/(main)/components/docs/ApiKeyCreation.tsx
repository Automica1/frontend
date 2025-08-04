// components/ApiKeyCreation.tsx
import React from 'react';
import { Key, Loader2, Check, Eye, EyeOff } from 'lucide-react';
import { CopyButton } from './CopyButton';

interface ApiKeyCreationProps {
  isCreatingApiKey: boolean;
  createdApiKey: string;
  apiKeyVisible: boolean;
  showApiKeySuccess: boolean;
  apiKeyError: string;
  gradient: string;
  onCreateApiKey: () => void;
  onToggleVisibility: () => void;
  copied: string;
  onCopy: (text: string, id: string) => void;
}

export const ApiKeyCreation: React.FC<ApiKeyCreationProps> = ({
  isCreatingApiKey,
  createdApiKey,
  apiKeyVisible,
  showApiKeySuccess,
  apiKeyError,
  gradient,
  onCreateApiKey,
  onToggleVisibility,
  copied,
  onCopy
}) => {
  if (!showApiKeySuccess) {
    return (
      <div className="space-y-3">
        <button 
          onClick={onCreateApiKey}
          disabled={isCreatingApiKey}
          className={`cursor-pointer px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r ${gradient} rounded-lg font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-300`}
        >
          {isCreatingApiKey ? (
            <>
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Key className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Generate API Key</span>
            </>
          )}
        </button>
        
        {apiKeyError && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-xs sm:text-sm">{apiKeyError}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success Message */}
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-green-400 font-semibold text-sm">API Key Created Successfully!</span>
        </div>
        <p className="text-green-300 text-xs">
          Your API key has been generated. Copy it now - it won't be shown again.
        </p>
      </div>

      {/* API Key Display */}
      <div className="bg-black rounded-lg p-3 sm:p-4 border border-gray-600">
        <div className="flex items-center justify-between mb-2">
          <label className="text-gray-300 font-semibold text-xs sm:text-sm">Your API Key</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleVisibility}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title={apiKeyVisible ? 'Hide API Key' : 'Show API Key'}
            >
              {apiKeyVisible ? (
                <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              ) : (
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              )}
            </button>
            <CopyButton
              text={createdApiKey}
              id="api-key"
              copied={copied}
              onCopy={onCopy}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            />
          </div>
        </div>
        <div className="bg-gray-900 rounded p-2">
          <code className="text-xs sm:text-sm text-gray-300 font-mono break-all">
            {apiKeyVisible 
              ? createdApiKey 
              : createdApiKey.replace(/.(?=.{8})/g, '•')
            }
          </code>
        </div>
      </div>

      {/* Warning Message */}
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
        <p className="text-yellow-400 text-xs">
          ⚠️ Store this API key securely. This message will disappear in 30 seconds for security.
        </p>
      </div>

      {/* Generate Another Key Button */}
      <button 
        onClick={onCreateApiKey}
        disabled={isCreatingApiKey}
        className="cursor-pointer px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-300"
      >
        <Key className="w-3 h-3 sm:w-4 sm:h-4" />
        <span>Generate Another Key</span>
      </button>
    </div>
  );
};