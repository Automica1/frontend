'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import {
  apiService,
  type BetaFeedbackRefundBudget,
} from '../../lib/apiService';

interface BetaFeedbackRefundBudgetPanelProps {
  userId: string;
  email?: string;
}

export default function BetaFeedbackRefundBudgetPanel({
  userId,
  email,
}: BetaFeedbackRefundBudgetPanelProps) {
  const [budget, setBudget] = useState<BetaFeedbackRefundBudget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overrideInput, setOverrideInput] = useState('');
  const [savingOverride, setSavingOverride] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadBudget = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getBetaFeedbackRefundBudget(userId);
      setBudget(response.budget);
      setOverrideInput(
        response.budget.capOverride != null ? String(response.budget.capOverride) : ''
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load refund budget');
      setBudget(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadBudget();
  }, [loadBudget]);

  const handleSaveOverride = async () => {
    try {
      setSavingOverride(true);
      setActionMessage(null);
      setError(null);
      const trimmed = overrideInput.trim();
      const cap = trimmed === '' ? null : Number(trimmed);
      if (cap != null && (!Number.isFinite(cap) || cap <= 0 || !Number.isInteger(cap))) {
        setError('Cap override must be a positive whole number, or leave blank for global default');
        return;
      }
      const response = await apiService.setBetaFeedbackRefundCapOverride(userId, cap);
      setBudget(response.budget);
      setActionMessage('Refund cap override saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save cap override');
    } finally {
      setSavingOverride(false);
    }
  };

  const handleResetBudget = async () => {
    const confirmed = window.confirm(
      `Reset refund budget for ${email || userId}? This clears usage counted since the last reset so the user can earn refunds again (up to their cap). Type OK to continue.`
    );
    if (!confirmed) return;

    try {
      setResetting(true);
      setActionMessage(null);
      setError(null);
      const response = await apiService.resetBetaFeedbackRefundBudget(userId);
      setBudget(response.budget);
      setActionMessage('Refund budget reset — usage window restarted from now');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset refund budget');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 flex items-center gap-2 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading refund budget…
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-300">
        {error || 'Refund budget unavailable'}
      </div>
    );
  }

  const usagePercent = budget.effectiveCap > 0
    ? Math.min(100, Math.round((budget.creditsUsed / budget.effectiveCap) * 100))
    : 0;

  return (
    <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-indigo-200">Refund budget (rolling {budget.rollingWindowDays} days)</p>
          <p className="text-xs text-gray-400 mt-1">
            Global default: {budget.globalCap} credits
            {budget.capOverride != null ? ` · Override: ${budget.capOverride}` : ' · Using global default'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadBudget()}
          className="text-xs text-gray-400 hover:text-gray-200"
        >
          Refresh
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-300">
            {budget.creditsUsed} / {budget.effectiveCap} credits used
          </span>
          <span className={budget.capExhausted ? 'text-amber-300' : 'text-green-300'}>
            {budget.creditsRemaining} remaining
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${budget.capExhausted ? 'bg-amber-500' : 'bg-indigo-500'}`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {budget.refundSessionsCount} refunded session{budget.refundSessionsCount === 1 ? '' : 's'} since{' '}
          {new Date(budget.windowStart).toLocaleString()}
          {budget.budgetResetAt
            ? ` (budget reset ${new Date(budget.budgetResetAt).toLocaleString()})`
            : ''}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block">
          <span className="text-xs font-medium text-gray-400">Per-user cap override</span>
          <input
            type="number"
            min={1}
            value={overrideInput}
            onChange={(e) => setOverrideInput(e.target.value)}
            placeholder={`Default (${budget.globalCap})`}
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
          />
          <span className="text-xs text-gray-500 mt-1 block">Leave blank to use global cap</span>
        </label>
        <button
          type="button"
          onClick={() => void handleSaveOverride()}
          disabled={savingOverride}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {savingOverride ? 'Saving…' : 'Save cap'}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-indigo-500/20">
        <button
          type="button"
          onClick={() => void handleResetBudget()}
          disabled={resetting}
          className="inline-flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-950/30 px-3 py-2 text-sm text-amber-200 hover:bg-amber-950/50 disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" />
          {resetting ? 'Resetting…' : 'Reset budget to full cap'}
        </button>
        <p className="text-xs text-gray-500">
          Restarts the usage window from now without deleting session history.
        </p>
      </div>

      {actionMessage && (
        <p className="text-xs text-green-300">{actionMessage}</p>
      )}
      {error && (
        <p className="text-xs text-red-300">{error}</p>
      )}
    </div>
  );
}
