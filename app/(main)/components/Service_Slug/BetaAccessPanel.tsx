'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, FlaskConical } from 'lucide-react';

interface BetaAccessPanelProps {
  serviceSlug: string;
  enabled: boolean;
  betaKey: string;
  onEnabledChange: (enabled: boolean) => void;
  onBetaKeyChange: (key: string) => void;
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
        className="w-full rounded-lg border border-gray-700 bg-gray-800/70 px-3 py-2.5 text-left transition-colors hover:border-gray-600 hover:bg-gray-800"
      >
        <span className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm text-gray-200">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/15">
              <FlaskConical className="h-3.5 w-3.5 text-blue-400" />
            </span>
            Try beta version
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            Optional
            <ChevronDown className="h-3.5 w-3.5" />
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-blue-500/30 bg-blue-900/15 px-3 py-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/20">
            <FlaskConical className="h-3.5 w-3.5 text-blue-400" />
          </span>
          <div>
            <p className="text-sm font-medium text-blue-200">Beta access</p>
            <p className="text-[11px] text-blue-300/70">Uses the beta model when enabled</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
          aria-label="Hide beta options"
        >
          <ChevronUp className="h-3.5 w-3.5" />
          Hide
        </button>
      </div>

      <label className="flex items-center gap-2.5 rounded-md border border-gray-700/80 bg-gray-900/40 px-2.5 py-2 text-sm text-gray-300 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
        />
        Route this request to beta
      </label>

      {enabled && (
        <input
          type="password"
          value={betaKey}
          onChange={(e) => onBetaKeyChange(e.target.value.trim())}
          placeholder="Enter beta key (bk_live_...)"
          className="w-full rounded-md border border-gray-700 bg-gray-900/60 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:border-blue-500/40 focus:outline-none"
          autoComplete="off"
        />
      )}
    </div>
  );
}
