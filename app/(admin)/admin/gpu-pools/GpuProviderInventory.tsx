'use client';

import React from 'react';
import { Cloud, Power, RefreshCw, Server } from 'lucide-react';
import type { GPUPoolInventory, GPUPoolRecoveryNode } from '../../lib/apiService';

function statusTone(status: string | undefined): string {
  const s = (status || '').toLowerCase();
  if (s === 'running' || s === 'active') return 'text-emerald-200';
  if (s === 'pending' || s === 'starting' || s === 'creating') return 'text-sky-200';
  if (s === 'stopping' || s === 'terminated' || s === 'stopped') return 'text-amber-200';
  return 'text-gray-300';
}

type Props = {
  inventory: GPUPoolInventory | null;
  loading: boolean;
  error: string | null;
  providerFilter: '' | 'aws' | 'e2e';
  onProviderFilter: (v: '' | 'aws' | 'e2e') => void;
  onRefresh: () => void;
  onRecover: () => void;
  onDestroyTracked: () => void;
  busy: boolean;
};

export default function GpuProviderInventory({
  inventory,
  loading,
  error,
  providerFilter,
  onProviderFilter,
  onRefresh,
  onRecover,
  onDestroyTracked,
  busy,
}: Props) {
  const nodes: GPUPoolRecoveryNode[] = inventory?.providerNodes || [];
  const trackedId = inventory?.mongoNodeId || '';
  const trackedIp = inventory?.mongoPublicIp || '';

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-black/20 p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <Cloud className="h-5 w-5 text-sky-400" />
              Provider inventory
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Live nodes from <code className="text-gray-300">gpu_provision_node.sh list-nodes</code> — not Mongo.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={providerFilter}
              onChange={(e) => onProviderFilter(e.target.value as '' | 'aws' | 'e2e')}
              className="rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-white"
              title="Override provider for list-nodes"
            >
              <option value="">Policy / pool primary</option>
              <option value="aws">Force AWS</option>
              <option value="e2e">Force E2E</option>
            </select>
            <button
              type="button"
              onClick={onRefresh}
              disabled={busy || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-sm text-sky-100"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Probing…' : 'Refresh from provider'}
            </button>
            <button
              type="button"
              onClick={onRecover}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100"
            >
              <Server className="h-4 w-4" />
              Recover orphan
            </button>
            <button
              type="button"
              onClick={onDestroyTracked}
              disabled={busy || (!trackedId && !trackedIp)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100 disabled:opacity-40"
              title="Destroy the node currently tracked in Mongo for this pool"
            >
              <Power className="h-4 w-4" />
              Destroy tracked
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{error}</div>
        )}

        {inventory && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <div className="text-xs text-gray-500">Provider</div>
              <div className="text-white font-medium">{inventory.providerLabel}</div>
              <div className="text-xs text-gray-500 mt-0.5">{inventory.provider}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <div className="text-xs text-gray-500">SSH host</div>
              <div className="text-white font-mono text-xs">{inventory.sshHost || '—'}</div>
              <div className={`text-xs mt-0.5 ${inventory.sshReachable ? 'text-emerald-300' : 'text-amber-300'}`}>
                {inventory.sshReachable ? 'reachable' : 'unreachable'}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <div className="text-xs text-gray-500">Mongo pool</div>
              <div className="text-white">{inventory.mongoState || '—'}</div>
              <div className="text-xs text-gray-500 font-mono mt-0.5">
                {trackedId || '—'} / {trackedIp || '—'}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <div className="text-xs text-gray-500">Live nodes</div>
              <div className="text-white text-lg font-semibold">{inventory.providerNodeCount}</div>
              <div className="text-xs text-gray-500">{inventory.source}</div>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-4 py-3">Node ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Public IP</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">vs Mongo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && nodes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    Querying provider…
                  </td>
                </tr>
              ) : nodes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No provider nodes listed. Idle Mongo with a billing VM elsewhere → Recover orphan after Refresh.
                  </td>
                </tr>
              ) : (
                nodes.map((node) => {
                  const tracked =
                    (trackedId && node.id === trackedId) ||
                    (trackedIp && node.publicIp === trackedIp);
                  const orphanLive =
                    !trackedId &&
                    !trackedIp &&
                    ['running', 'pending', 'active', 'starting'].includes((node.status || '').toLowerCase());
                  return (
                    <tr key={node.id} className="text-gray-200">
                      <td className="px-4 py-3 font-mono text-xs text-white">{node.id}</td>
                      <td className={`px-4 py-3 text-xs ${statusTone(node.status)}`}>{node.status || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{node.publicIp || '—'}</td>
                      <td className="px-4 py-3 text-xs">{node.name || '—'}</td>
                      <td className="px-4 py-3 text-xs">
                        {tracked ? (
                          <span className="text-emerald-300">tracked</span>
                        ) : orphanLive ? (
                          <span className="text-amber-300">orphan candidate</span>
                        ) : (
                          <span className="text-gray-500">not tracked</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {inventory?.notes?.length ? (
          <ul className="text-xs text-gray-400 list-disc pl-5 space-y-1">
            {inventory.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : null}

        {inventory?.rawPreview ? (
          <details className="rounded-lg border border-white/10 bg-black/40">
            <summary className="cursor-pointer px-3 py-2 text-xs text-gray-400">Raw list-nodes output</summary>
            <pre className="overflow-x-auto px-3 pb-3 text-[11px] text-gray-300 whitespace-pre-wrap">{inventory.rawPreview}</pre>
          </details>
        ) : null}

        {inventory?.probedAt ? (
          <div className="text-xs text-gray-500">Probed at {new Date(inventory.probedAt).toLocaleString()}</div>
        ) : null}
      </div>
    </div>
  );
}
