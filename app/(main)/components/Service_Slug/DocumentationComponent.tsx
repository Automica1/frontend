// app/solutions/[slug]/components/DocumentationComponent.tsx
import React, { useState } from 'react';
import { Copy, Check, ArrowRight, Code, Book, Zap, Key, Loader2, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../../lib/apiService'; // Adjust the import path as needed

interface DocumentationComponentProps {
  solution: {
    title: string;
    icon: React.ComponentType<any>;
    gradient: string;
    apiEndpoint?: string;
  };
}

export default function DocumentationComponent({ solution }: DocumentationComponentProps) {
  const [copied, setCopied] = useState('');
  const [activeTab, setActiveTab] = useState('quickstart');
  
  // API Key creation states
  const [isCreatingApiKey, setIsCreatingApiKey] = useState(false);
  const [createdApiKey, setCreatedApiKey] = useState<string>('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [showApiKeySuccess, setShowApiKeySuccess] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string>('');

  const Icon = solution.icon;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleCreateApiKey = async () => {
    try {
      setIsCreatingApiKey(true);
      setApiKeyError('');
      
      const response = await apiService.createApiKey();
      
      setCreatedApiKey(response.apiKey);
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

  const tabs = [
    { id: 'quickstart', label: 'Quick Start', icon: Zap },
    { id: 'reference', label: 'API Reference', icon: Code },
    { id: 'examples', label: 'Examples', icon: Book },
  ];

  const renderQuickStart = () => (
    <div className="space-y-6 sm:space-y-8">
      {/* Getting Started */}
      <div>
        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Getting Started</h3>
        <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
          Get up and running with our API in just a few steps. No complex setup required.
        </p>
        
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h4 className="text-base sm:text-lg font-semibold mb-3 flex items-center">
              <span className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3">1</span>
              Get Your API Key
            </h4>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Sign up for a free account and get your API key from the dashboard.
            </p>

            {/* API Key Creation UI */}
            {!showApiKeySuccess ? (
              <div className="space-y-3">
                <button 
                  onClick={handleCreateApiKey}
                  disabled={isCreatingApiKey}
                  className={`cursor-pointer px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r ${solution.gradient} rounded-lg font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-300`}
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
            ) : (
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
                        onClick={() => setApiKeyVisible(!apiKeyVisible)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                        title={apiKeyVisible ? 'Hide API Key' : 'Show API Key'}
                      >
                        {apiKeyVisible ? (
                          <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(createdApiKey, 'api-key')}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                        title="Copy API Key"
                      >
                        {copied === 'api-key' ? (
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        )}
                      </button>
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
                  onClick={handleCreateApiKey}
                  disabled={isCreatingApiKey}
                  className="cursor-pointer px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-300"
                >
                  <Key className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Generate Another Key</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h4 className="text-base sm:text-lg font-semibold mb-3 flex items-center">
              <span className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3">2</span>
              Make Your First Request
            </h4>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Use curl or any HTTP client to make your first API call.
            </p>
            <div className="bg-black rounded-lg p-3 sm:p-4 relative">
              <button
                onClick={() => copyToClipboard(`curl -X POST "${solution.apiEndpoint || 'https://api.example.com/v1/process'}" \\
  -H "Authorization: Bearer ${createdApiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"image": "base64_encoded_image"}'`, 'quickstart-curl')}
                className="absolute top-2 right-2 p-1.5 sm:p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs sm:text-sm transition-colors duration-300"
              >
                {copied === 'quickstart-curl' ? (
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </button>
              <pre className="text-xs sm:text-sm text-gray-300 font-mono pr-8 sm:pr-12 overflow-x-auto">
{`curl -X POST "${solution.apiEndpoint || 'https://api.example.com/v1/process'}" \\
  -H "Authorization: Bearer ${createdApiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"image": "base64_encoded_image"}'`}
              </pre>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h4 className="text-base sm:text-lg font-semibold mb-3 flex items-center">
              <span className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3">3</span>
              Handle the Response
            </h4>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Process the JSON response from our API.
            </p>
            <div className="bg-black rounded-lg p-3 sm:p-4 relative">
              <button
                onClick={() => copyToClipboard(`{
  "success": true,
  "data": {
    "extracted_text": "Sample text",
    "confidence": 0.95,
    "processing_time": "1.2s"
  },
  "usage": {
    "requests_remaining": 999
  }
}`, 'quickstart-response')}
                className="absolute top-2 right-2 p-1.5 sm:p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs sm:text-sm transition-colors duration-300"
              >
                {copied === 'quickstart-response' ? (
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </button>
              <pre className="text-xs sm:text-sm text-gray-300 font-mono pr-8 sm:pr-12 overflow-x-auto">
{`{
  "success": true,
  "data": {
    "extracted_text": "Sample text",
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

  const renderAPIReference = () => (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">API Reference</h3>
        <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
          Complete reference for all available endpoints and parameters.
        </p>
      </div>

      {/* Endpoint */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold mb-4">POST /v1/process</h4>
        <p className="text-gray-300 mb-4 text-sm sm:text-base">
          Process an image and extract information based on your requirements.
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
{`{
  "image": "base64_encoded_image_data",
  "options": {
    "format": "json",           // Response format
    "accuracy": "high",         // Processing accuracy
    "language": "en",           // Language preference
    "timeout": 30               // Timeout in seconds
  }
}`}
              </pre>
            </div>
          </div>

          <div>
            <h5 className="font-semibold mb-2 text-sm sm:text-base">Response</h5>
            <div className="bg-black rounded-lg p-3 sm:p-4">
              <pre className="text-xs sm:text-sm text-gray-300 font-mono overflow-x-auto">
{`{
  "success": true,
  "data": {
        "extracted_text": "Sample text",
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

  const renderExamples = () => (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Examples</h3>
        <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
          See how to integrate the API using popular tools and languages.
        </p>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* JavaScript Example */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h4 className="text-base sm:text-lg font-semibold mb-4">JavaScript (Fetch)</h4>
            <pre className="text-xs sm:text-sm text-gray-300 font-mono bg-black rounded-lg p-3 sm:p-4 overflow-x-auto">
{`fetch('${solution.apiEndpoint || 'https://api.example.com/v1/process'}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${createdApiKey || 'YOUR_API_KEY'}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    image: 'base64_encoded_image'
  })
})
.then(res => res.json())
.then(data => console.log(data));`}
            </pre>
          </div>

          {/* Python Example */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h4 className="text-base sm:text-lg font-semibold mb-4">Python (requests)</h4>
            <pre className="text-xs sm:text-sm text-gray-300 font-mono bg-black rounded-lg p-3 sm:p-4 overflow-x-auto">
{`import requests

url = '${solution.apiEndpoint || 'https://api.example.com/v1/process'}'
headers = {
  'Authorization': 'Bearer ${createdApiKey || 'YOUR_API_KEY'}',
  'Content-Type': 'application/json'
}
data = {
  'image': 'base64_encoded_image'
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-16 px-3 sm:px-4">
      {/* Tabs Navigation */}
      <div className="flex space-x-1 sm:space-x-4 mb-8 sm:mb-12 border-b border-gray-700 overflow-x-auto">
        {tabs.map(({ id, label, icon: TabIcon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-3 sm:px-4 py-2 flex items-center space-x-1 sm:space-x-2 font-semibold border-b-2 transition-all whitespace-nowrap text-sm sm:text-base ${
              activeTab === id
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <TabIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'quickstart' && renderQuickStart()}
      {activeTab === 'reference' && renderAPIReference()}
      {activeTab === 'examples' && renderExamples()}
    </div>
  );
}