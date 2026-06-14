// GenerateTokenModal.tsx
'use client'
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface GenerateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (credits: number, description: string) => Promise<void>;
  isGenerating: boolean;
}

export default function GenerateTokenModal({
  isOpen,
  onClose,
  onGenerate,
  isGenerating
}: GenerateTokenModalProps) {
  const [credits, setCredits] = useState(100);
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    try {
      await onGenerate(credits, description);
      // Reset form
      setCredits(100);
      setDescription('');
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setCredits(100);
      setDescription('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0d0d10] shadow-2xl">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Generate New Token</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Credits
              </label>
              <input
                type="number"
                value={credits}
                onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
                min="1"
                max="10000"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/10"
                disabled={isGenerating}
                required
              />
              <p className="mt-1 text-xs text-gray-400">
                Enter the number of credits (1-10,000)
              </p>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Enter token description..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/10"
                disabled={isGenerating}
                required
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-400">
                {description.length}/500 characters
              </p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-gray-200 transition-colors hover:bg-white/10"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating || !description.trim() || credits < 1}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-400/20 bg-gradient-to-r from-purple-500/90 to-pink-500/90 px-4 py-2 text-white transition-colors hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating && <RefreshCw className="w-4 h-4 animate-spin" />}
                {isGenerating ? 'Generating...' : 'Generate Token'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
