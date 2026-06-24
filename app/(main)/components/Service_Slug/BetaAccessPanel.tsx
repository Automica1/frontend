'use client';

import React, { useEffect, useState } from 'react';
import { FlaskConical, Shield } from 'lucide-react';

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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = loadStoredBetaKey(serviceSlug);
    if (stored) {
      onBetaKeyChange(stored);
    }
    setInitialized(true);
  }, [serviceSlug, onBetaKeyChange]);

  useEffect(() => {
    if (!initialized) return;
    storeBetaKey(serviceSlug, betaKey);
  }, [serviceSlug, betaKey, initialized]);

  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-purple-500/20 p-2">
          <FlaskConical className="h-5 w-5 text-purple-300" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">Try beta version</h3>
          <p className="text-xs text-gray-400 mt-1">
            Use an admin-issued beta key to route requests to the beta model. Stable mode uses production sign verify.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onEnabledChange(false)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
            !enabled
              ? 'border-white/20 bg-white/10 text-white'
              : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
          }`}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            Stable
          </span>
        </button>
        <button
          type="button"
          onClick={() => onEnabledChange(true)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
            enabled
              ? 'border-purple-400/40 bg-purple-500/20 text-white'
              : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
          }`}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Beta
          </span>
        </button>
      </div>

      {enabled && (
        <div className="space-y-2">
          <label htmlFor="beta-key-input" className="text-xs font-medium text-gray-300">
            Beta key
          </label>
          <input
            id="beta-key-input"
            type="password"
            value={betaKey}
            onChange={(e) => onBetaKeyChange(e.target.value.trim())}
            placeholder="bk_live_..."
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-purple-400/50 focus:outline-none"
            autoComplete="off"
          />
          <p className="text-[11px] text-gray-500">
            Beta models may change. Results are not production guarantees.
          </p>
        </div>
      )}
    </div>
  );
}
