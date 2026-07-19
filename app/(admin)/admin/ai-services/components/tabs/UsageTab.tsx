'use client';

import Link from 'next/link';
import { Activity } from 'lucide-react';
import type { AISaaSServiceRecord } from '../../../../lib/apiService';
import { formatNumber } from '../../workbenchModel';
import { AdminSection, AdminField, DataRow, INPUT_CLASS, MiniStat } from '../primitives';

export interface UsageWindow {
  start_date?: string;
  end_date?: string;
}

/** Usage health for the selected window. The window filters usage only. */
export default function UsageTab({
  service,
  window: usageWindow,
  onWindowChange,
  onPreset,
}: {
  service: AISaaSServiceRecord;
  window: UsageWindow;
  onWindowChange: (next: UsageWindow) => void;
  onPreset: (preset: 'all' | 'last7Days' | 'last30Days' | 'thisMonth') => void;
}) {
  const usage = service.usage;
  const successRate = usage.totalCalls > 0 ? `${((usage.successCalls / usage.totalCalls) * 100).toFixed(1)}%` : '0%';

  return (
    <div className="grid h-full min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
      <AdminSection title="Usage health">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <MiniStat label="Calls" value={formatNumber(usage.totalCalls)} />
          <MiniStat label="Success" value={formatNumber(usage.successCalls)} tone="good" />
          <MiniStat label="Failed" value={formatNumber(usage.failedCalls)} tone={usage.failedCalls ? 'warn' : 'normal'} />
          <MiniStat label="Credits" value={formatNumber(usage.totalCredits)} />
        </div>
        <div className="mt-3 grid gap-1">
          <DataRow label="Success rate" value={successRate} tone={usage.failedCalls ? 'warn' : 'good'} />
          <DataRow label="Usage source" value={usage.source || 'aggregate'} />
        </div>
        <Link
          href={`/admin/services?service=${encodeURIComponent(service.slug)}`}
          className="mt-3 inline-flex h-9 items-center gap-2 rounded-md border border-white/12 bg-white/[0.04] px-3 text-xs font-semibold text-gray-100 transition hover:bg-white/[0.08]"
        >
          <Activity className="h-4 w-4" />
          Open usage analytics
        </Link>
      </AdminSection>

      <AdminSection title="Usage window">
        <p className="mb-2 text-[11px] text-gray-500">Filters usage numbers only. Runtime state is always live.</p>
        <div className="grid gap-2">
          <AdminField label="Start">
            <input
              type="date"
              value={usageWindow.start_date || ''}
              onChange={(event) => onWindowChange({ ...usageWindow, start_date: event.target.value || undefined })}
              className={INPUT_CLASS}
            />
          </AdminField>
          <AdminField label="End">
            <input
              type="date"
              value={usageWindow.end_date || ''}
              onChange={(event) => onWindowChange({ ...usageWindow, end_date: event.target.value || undefined })}
              className={INPUT_CLASS}
            />
          </AdminField>
          <div className="flex flex-wrap gap-1">
            {([['all', 'All'], ['last7Days', '7d'], ['last30Days', '30d'], ['thisMonth', 'MTD']] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => onPreset(id)}
                className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-semibold text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </AdminSection>
    </div>
  );
}
