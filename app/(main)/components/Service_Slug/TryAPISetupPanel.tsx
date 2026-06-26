'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquareText, Send } from 'lucide-react';
import type { SetupPanelTab } from '../../types/tabTypes';

interface TryAPISetupPanelProps {
  setupContent: React.ReactNode;
  feedbackContent: React.ReactNode;
  feedbackBadge?: string;
  defaultTab?: SetupPanelTab;
}

export default function TryAPISetupPanel({
  setupContent,
  feedbackContent,
  feedbackBadge,
  defaultTab = 'feedback',
}: TryAPISetupPanelProps) {
  const [activeTab, setActiveTab] = useState<SetupPanelTab>(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 h-full flex flex-col overflow-hidden">
      <div className="flex border-b border-gray-700 flex-shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'feedback'
              ? 'bg-purple-600 text-white border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
          }`}
        >
          <MessageSquareText className="w-4 h-4" />
          <span>Feedback</span>
          {feedbackBadge && activeTab !== 'feedback' && (
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-200">
              {feedbackBadge}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('setup')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'setup'
              ? 'bg-purple-600 text-white border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Run</span>
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'feedback' ? feedbackContent : setupContent}
      </div>
    </div>
  );
}
