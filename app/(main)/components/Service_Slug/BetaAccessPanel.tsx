'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, FlaskConical } from 'lucide-react';

interface BetaAccessPanelProps {
  serviceSlug: string;
  enabled: boolean;
  betaKey: string;
  onEnabledChange: (enabled: boolean) => void;
  onBetaKeyChange: (key: string) => void;
  variant?: 'card' | 'inline';
}

const storageKey = (slug: string) => `automica-beta-key:${slug}`;

export function loadStoredBetaKey(serviceSlug: string): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(storageKey(serviceSlug)) || '';
}

export function storeBetaKey(serviceSlug: string, key: string) {
  if (typeof window === 'undefined') return;
  if (key) {
    sessionStorage.setItem(storageKey(serviceSlug), key);
  } else {
    sessionStorage.removeItem(storageKey(serviceSlug));
  }
}

export default function BetaAccessPanel({
  serviceSlug,
  enabled,
  betaKey,
  onEnabledChange,
  onBetaKeyChange,
  variant = 'inline',
}: BetaAccessPanelProps) {
  const [open, setOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = loadStoredBetaKey(serviceSlug);
    if (stored) {
      onBetaKeyChange(stored);
      onEnabledChange(true);
      setOpen(true);
    }
    setInitialized(true);
  }, [serviceSlug, onBetaKeyChange, onEnabledChange]);

  useEffect(() => {
    if (!initialized) return;
    storeBetaKey(serviceSlug, betaKey);
  }, [serviceSlug, betaKey, initialized]);

  const handleClose = () => {
    setOpen(false);
    onEnabledChange(false);
    onBetaKeyChange('');
    storeBetaKey(serviceSlug, '');
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-md border border-gray-700/80 bg-gray-800/50 px-2.5 py-2 text-left transition-colors hover:border-gray-600 hover:bg-gray-800"
      >
        <span className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-xs text-gray-300">
            <FlaskConical className="h-3.5 w-3.5 text-blue-400" />
            Custom model (beta)
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
        </span>
      </button>
    );
  }

  const containerClass =
    variant === 'inline'
      ? 'rounded-md border border-gray-700/80 bg-gray-800/30 px-2.5 py-2 space-y-2'
      : 'rounded-lg border border-blue-500/30 bg-blue-900/15 px-3 py-3 space-y-2.5';

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none flex-1 min-w-0">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-0 focus:ring-offset-0 flex-shrink-0"
          />
          <span className="truncate">Route to custom model (beta)</span>
        </label>
        <button
          type="button"
          onClick={handleClose}
          className="inline-flex items-center text-gray-500 hover:text-gray-300 flex-shrink-0"
          aria-label="Hide beta options"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
      </div>

      {enabled && (
        <>
          <p className="text-[10px] text-gray-500 leading-snug">
            Your test cases help calibrate your dedicated model. We store the feedback you share—not
            your uploaded documents.
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
