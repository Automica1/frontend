import React from 'react';
import { RefreshCw } from 'lucide-react';

interface GenerateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: () => void;
  credits: number;
  setCredits: (credits: number) => void;
  description: string;
  setDescription: (description: string) => void;
  generating: boolean;
}

export default function GenerateTokenModal({
  isOpen,
  onClose,
  onGenerate,
  credits,
  setCredits,
  description,
  setDescription,
  generating
}: GenerateTokenModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Token</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Credits</label>
              <input
                type="number"
                value={credits}
                onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
                min="1"
                max="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Enter token description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={generating}
            >
              Cancel
            </button>
            <button
              onClick={onGenerate}
              disabled={generating || !description.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating && <RefreshCw className="w-4 h-4 animate-spin" />}
              Generate Token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}