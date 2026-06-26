'use client';

import React, { useState } from 'react';
import { ChevronDown, FlaskConical } from 'lucide-react';

interface BetaAccessPanelProps {
  enabled: boolean;
  betaKey: string;
  onEnabledChange: (enabled: boolean) => void;
  onBetaKeyChange: (key: string) => void;
  variant?: 'card' | 'inline' | 'embedded';
}

export default function BetaAccessPanel({
  enabled,
  betaKey,
  onEnabledChange,
  onBetaKeyChange,
  variant = 'inline',
}: BetaAccessPanelProps) {
  const [open, setOpen] = useState(variant === 'embedded');

  if (variant === 'embedded') {
    if (!open) {
      return (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between p-3 bg-gray-800 rounded-lg transition-colors hover:bg-gray-700/80"
        >
          <span className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <FlaskConical className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-sm text-gray-300 truncate">Use my custom model (beta)</span>
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
        </button>
      );
    }

    return (
      <div className="p-3 bg-gray-800 rounded-lg space-y-2">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <FlaskConical className="h-4 w-4 text-blue-400" />
          </div>
          <span className="text-sm text-gray-300 flex-1">Use my custom model (beta)</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-0 focus:ring-offset-0 flex-shrink-0"
          />
        </label>

        {enabled && (
          <>
            <p className="text-xs text-gray-500 pl-11">
              2 credits per test, refundable when you submit feedback.
            </p>
            <input
              type="password"
              value={betaKey}
              onChange={(e) => onBetaKeyChange(e.target.value.trim())}
              placeholder="Beta key (bk_live_...)"
              className="w-full rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:border-blue-500/40 focus:outline-none"
              autoComplete="off"
            />
          </>
        )}
      </div>
    );
  }

  const containerClass =
    variant === 'inline'
      ? 'rounded-md border border-gray-700/80 bg-gray-800/30 px-2.5 py-2 space-y-2'
      : 'rounded-lg border border-blue-500/30 bg-blue-900/15 px-3 py-3 space-y-2.5';

  return (
    <div className={containerClass}>
      <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
        />
        <span>Use my custom model (beta)</span>
      </label>

      {enabled && (
        <>
          <p className="text-[10px] text-gray-500 leading-snug">
            2 credits per test, refundable when you submit feedback.
          </p>
          <input
            type="password"
            value={betaKey}
            onChange={(e) => onBetaKeyChange(e.target.value.trim())}
            placeholder="Beta key (bk_live_...)"
            className="w-full rounded-md border border-gray-700 bg-gray-900/60 px-2.5 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:border-blue-500/40 focus:outline-none"
            autoComplete="off"
          />
        </>
      )}
    </div>
  );
}
