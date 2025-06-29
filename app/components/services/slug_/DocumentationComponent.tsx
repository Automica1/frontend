// app/solutions/[slug]/components/DocumentationComponent.tsx
import React, { useState } from 'react';
import { Copy, Check, ArrowRight, Code, Book, Zap } from 'lucide-react';

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

  const Icon = solution.icon;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const tabs = [
    { id: 'quickstart', label: 'Quick Start', icon: Zap },
    { id: 'reference', label: 'API Reference', icon: Code },
    { id: 'examples', label: 'Examples', icon: Book },
  ];

  const renderQuickStart = () => (
    <div className="space-y-8">
      {/* Getting Started */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Getting Started</h3>
        <p className="text-gray-300 mb-6">
          Get up and running with our API in just a few steps. No complex setup required.
        </p>
        
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-3 flex items-center">
              <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
              Get Your API Key
            </h4>
            <p className="text-gray-300 mb-4">
              Sign up for a free account and get your API key from the dashboard.
            </p>
            <button className={`px-4 py-2 bg-gradient-to-r ${solution.gradient} rounded-lg font-semibold text-sm`}>
              Get API Key
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-3 flex items-center">
              <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
              Make Your First Request
            </h4>
            <p className="text-gray-300 mb-4">
              Use curl or any HTTP client to make your first API call.
            </p>
            <div className="bg-black rounded-lg p-4 relative">
              <button
                onClick={() => copyToClipboard(`curl -X POST "${solution.apiEndpoint || 'https://api.example.com/v1/process'}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"image": "base64_encoded_image"}'`, 'quickstart-curl')}
                className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors duration-300"
              >
                {copied === 'quickstart-curl' ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <pre className="text-sm text-gray-300 font-mono pr-12">
{`curl -X POST "${solution.apiEndpoint || 'https://api.example.com/v1/process'}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"image": "base64_encoded_image"}'`}
              </pre>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-3 flex items-center">
              <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
              Handle the Response
            </h4>
            <p className="text-gray-300 mb-4">
              Process the JSON response from our API.
            </p>
            <div className="bg-black rounded-lg p-4 relative">
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
                className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors duration-300"
              >
                {copied === 'quickstart-response' ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <pre className="text-sm text-gray-300 font-mono pr-12">
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
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold mb-4">API Reference</h3>
        <p className="text-gray-300 mb-6">
          Complete reference for all available endpoints and parameters.
        </p>
      </div>

      {/* Endpoint */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">POST /v1/process</h4>
        <p className="text-gray-300 mb-4">
          Process an image and extract information based on your requirements.
        </p>
        
        <div className="space-y-4">
          <div>
            <h5 className="font-semibold mb-2">Request Headers</h5>
            <div className="bg-black rounded-lg p-4">
              <pre className="text-sm text-gray-300 font-mono">
{`Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`}
              </pre>
            </div>
          </div>

          <div>
            <h5 className="font-semibold mb-2">Request Body</h5>
            <div className="bg-black rounded-lg p-4">
              <pre className="text-sm text-gray-300 font-mono">
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
            <h5 className="font-semibold mb-2">Response</h5>
            <div className="bg-black rounded-lg p-4">
              <pre className="text-sm text-gray-300 font-mono">
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
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold mb-4">Examples</h3>
        <p className="text-gray-300 mb-6">
          See how to integrate the API using popular tools and languages.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* JavaScript Example */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">JavaScript (Fetch)</h4>
            <pre className="text-sm text-gray-300 font-mono bg-black rounded-lg p-4 overflow-x-auto">
{`fetch('${solution.apiEndpoint || 'https://api.example.com/v1/process'}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
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
          <div className="bg-gray-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Python (requests)</h4>
            <pre className="text-sm text-gray-300 font-mono bg-black rounded-lg p-4 overflow-x-auto">
{`import requests

url = '${solution.apiEndpoint || 'https://api.example.com/v1/process'}'
headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
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
    <div className="max-w-7xl mx-auto py-16 px-4">
      {/* Tabs Navigation */}
      <div className="flex space-x-4 mb-12 border-b border-gray-700">
        {tabs.map(({ id, label, icon: TabIcon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 flex items-center space-x-2 font-semibold border-b-2 transition-all ${
              activeTab === id
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <TabIcon className="w-4 h-4" />
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
