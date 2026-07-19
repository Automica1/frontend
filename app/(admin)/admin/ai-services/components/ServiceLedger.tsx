'use client';

import { Cpu, Search, Server } from 'lucide-react';
import type { AISaaSServiceRecord } from '../../../lib/apiService';
import {
  LEDGER_FILTERS,
  displayRuntimeStatus,
  formatNumber,
  hasGpuRuntime,
  isBetaService,
  type LedgerFilterId,
} from '../workbenchModel';
import { Badge, StatusPill } from './primitives';

/** Left pane: searchable, filterable API list. Selection identity is apiId. */
export default function ServiceLedger({
  services,
  totalCount,
  selectedApiId,
  query,
  filter,
  onQuery,
  onFilter,
  onSelect,
}: {
  services: AISaaSServiceRecord[];
  totalCount: number;
  selectedApiId: string;
  query: string;
  filter: LedgerFilterId;
  onQuery: (value: string) => void;
  onFilter: (value: LedgerFilterId) => void;
  onSelect: (apiId: string) => void;
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-black/25">
      <div className="shrink-0 border-b border-white/10 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-white">AI Services</h2>
            <p className="truncate text-[11px] text-gray-400">
              {services.length === totalCount ? `${totalCount} APIs` : `${services.length} of ${totalCount} APIs`}
            </p>
          </div>
        </div>

        <label className="mt-3 flex h-9 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-2 focus-within:border-sky-400/40 focus-within:ring-2 focus-within:ring-sky-400/20">
          <Search className="h-4 w-4 shrink-0 text-gray-500" />
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search APIs, tags, image, provider"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
          />
        </label>

        <div className="mt-2 flex flex-wrap gap-1">
          {LEDGER_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onFilter(item.id)}
              className={`truncate rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                filter === item.id
                  ? 'border-sky-400/40 bg-sky-500/10 text-sky-100'
                  : 'border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/[0.07] hover:text-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-2">
        {services.map((service) => {
          const gpu = hasGpuRuntime(service);
          const Icon = gpu ? Cpu : Server;
          const warningCount = service.warnings?.length || 0;
          const selected = service.apiId === selectedApiId;
          return (
            <button
              key={service.apiId}
              type="button"
              onClick={() => onSelect(service.apiId)}
              aria-current={selected ? 'true' : undefined}
              className={`grid min-h-[60px] shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border px-3 py-2 text-left transition ${
                selected ? 'border-sky-400/45 bg-sky-500/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">{service.displayName}</span>
                <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-gray-400">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                  <span className="truncate font-mono">{service.apiId}</span>
                  {service.usage.totalCalls > 0 && (
                    <span className="truncate text-gray-500">{formatNumber(service.usage.totalCalls)} calls</span>
                  )}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <StatusPill value={displayRuntimeStatus(service)} />
                <span className="flex gap-1">
                  {isBetaService(service) && <Badge>Beta</Badge>}
                  {warningCount > 0 && <Badge tone="red">{warningCount} warn</Badge>}
                </span>
              </span>
            </button>
          );
        })}
        {services.length === 0 && (
          <div className="rounded-md border border-dashed border-white/10 p-5 text-center text-sm text-gray-500">
            {totalCount === 0 ? 'No AI APIs found.' : query ? `No matches for "${query.trim()}".` : 'No APIs match this filter.'}
          </div>
        )}
      </div>
    </aside>
  );
}
