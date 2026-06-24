'use client';

import React, { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

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
        className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
      >
        Have a beta key?
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-gray-600 bg-gray-800 text-gray-400 focus:ring-0 focus:ring-offset-0"
          />
          Use beta endpoint
        </label>
        <button
          type="button"
          onClick={handleClose}
          className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-400"
          aria-label="Hide beta options"
        >
          <ChevronUp className="h-3 w-3" />
          Hide
        </button>
      </div>
      {enabled && (
        <input
          type="password"
          value={betaKey}
          onChange={(e) => onBetaKeyChange(e.target.value.trim())}
          placeholder="Beta key"
          className="w-full rounded-md border border-gray-700 bg-gray-800/80 px-2.5 py-1.5 text-xs text-gray-200 placeholder:text-gray-600 focus:border-gray-600 focus:outline-none"
          autoComplete="off"
        />
      )}
    </div>
  );
}
