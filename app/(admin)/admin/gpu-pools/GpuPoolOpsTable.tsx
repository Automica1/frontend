'use client';

import React, { useEffect, useState } from 'react';
import { Power, RefreshCw, Shield, Timer } from 'lucide-react';
import type { GPUPoolAdminInfo } from '../../lib/apiService';

function providerLabel(code: string | undefined): string {
  switch (code) {
    case 'aws':
      return 'AWS EC2';
    case 'e2e':
      return 'E2E Networks';
    default:
      return code || '—';
  }
}

function graceSec(pool: GPUPoolAdminInfo): number {
  return pool.gracePeriodSec && pool.gracePeriodSec > 0 ? pool.gracePeriodSec : 300;
}

function hasLiveNode(pool: GPUPoolAdminInfo): boolean {
  return Boolean(pool.nodeId || pool.publicIp);
}

function hasScheduledGrace(pool: GPUPoolAdminInfo): boolean {
  return (
    pool.state === 'draining' &&
    (pool.drainReason === 'user_grace' || pool.drainReason === 'admin_grace' || pool.drainReason === 'failed_bootstrap')
  );
}

function poolCostState(pool: GPUPoolAdminInfo): { label: string; tone: string } {
  if (pool.state === 'ready' && hasLiveNode(pool)) {
    return { label: pool.refCount > 0 ? 'Live · in use' : 'Live · billable idle', tone: 'text-amber-200' };
  }
  if (pool.state === 'provisioning') {
    return { label: pool.refCount > 0 ? 'Starting for users' : 'Starting · no active sessions', tone: 'text-sky-200' };
  }
  if (hasScheduledGrace(pool)) {
    if (pool.drainReason === 'admin_grace') {
      return { label: 'Admin grace shutdown', tone: 'text-amber-200' };
    }
    if (pool.drainReason === 'failed_bootstrap') {
      return { label: 'Failed bootstrap grace reuse window', tone: 'text-amber-200' };
    }
    return { label: 'User grace shutdown', tone: 'text-amber-200' };
  }
  if (pool.state === 'failed') {
    return { label: 'Needs attention', tone: 'text-red-200' };
  }
  if (!hasLiveNode(pool)) {
    if (pool.state === 'idle') {
      return {
        label: 'Idle in Mongo · provider may still be billing — Recover orphan',
        tone: 'text-amber-200',
      };
    }
    return { label: 'Idle · zero GPU cost', tone: 'text-emerald-200' };
  }
  return { label: 'Check pool state', tone: 'text-gray-300' };
}

function canAbortBoot(pool: GPUPoolAdminInfo): boolean {
  if (hasLiveNode(pool)) return false;
  return pool.state === 'provisioning' || pool.state === 'failed';
}

function isOrphanCandidate(pool: GPUPoolAdminInfo): boolean {
  return !hasLiveNode(pool) && (pool.state === 'idle' || pool.state === 'failed');
}

function canRetryProvision(pool: GPUPoolAdminInfo): boolean {
  if (pool.activeJob) return false;
  return pool.state === 'failed' || (pool.state === 'idle' && Boolean(pool.lastError));
}

function destroyAtFromPool(pool: GPUPoolAdminInfo): Date | null {
  if (pool.state !== 'draining') return null;
  if (!hasScheduledGrace(pool)) return null;
  if (pool.destroyAt) return new Date(pool.destroyAt);
  if (!pool.drainStartedAt) return null;
  return new Date(new Date(pool.drainStartedAt).getTime() + graceSec(pool) * 1000);
}

function DrainCountdown({ pool }: { pool: GPUPoolAdminInfo }) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const destroyAt = destroyAtFromPool(pool);

  useEffect(() => {
    if (!destroyAt) {
      setSecondsLeft(null);
      return;
    }
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((destroyAt.getTime() - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [destroyAt]);

  if (secondsLeft === null) return null;
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  return (
    <div className="mt-1 text-xs text-amber-200">
      Destroys in {m > 0 ? `${m}m ${s}s` : `${s}s`}
    </div>
  );
}

type Props = {
  pools: GPUPoolAdminInfo[];
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  onShutdown: (pool: GPUPoolAdminInfo, immediate: boolean) => void;
  onCancelGrace: (pool: GPUPoolAdminInfo) => void;
  onExtendGrace: (pool: GPUPoolAdminInfo, extendMin: number) => void;
  onRetry: (pool: GPUPoolAdminInfo) => void;
  onRecover: (pool: GPUPoolAdminInfo) => void;
  busyTag: string | null;
};

export default function GpuPoolOpsTable({
  pools,
  selectedTag,
  onSelectTag,
  onShutdown,
  onCancelGrace,
  onExtendGrace,
  onRetry,
  onRecover,
  busyTag,
}: Props) {
  if (pools.length === 0) {
    return <p className="text-sm text-gray-400">No GPU pools configured.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-gray-400">
          <tr>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">State</th>
            <th className="px-4 py-3">Provider</th>
            <th className="px-4 py-3">Sessions</th>
            <th className="px-4 py-3">Node / IP</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {pools.map((pool) => (
            (() => {
              const costState = poolCostState(pool);
              const isBusy =
                busyTag === pool.serviceTag ||
                busyTag === 'recover' ||
                busyTag === 'diag' ||
                busyTag === 'abort' ||
                busyTag === 'hold' ||
                busyTag === 'extend' ||
                busyTag === 'destroy' ||
                busyTag === 'grace';
              return (
            <tr
              key={pool.serviceTag}
              className={`text-gray-200 cursor-pointer ${pool.serviceTag === selectedTag ? 'bg-white/5' : ''}`}
              onClick={() => onSelectTag(pool.serviceTag)}
            >
              <td className="px-4 py-3">
                <div className="font-medium text-white">{pool.serviceTag}</div>
                <div className="text-xs text-gray-500">{pool.serviceName}</div>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex rounded-full bg-white/10 px-2 py-0.5 text-xs">{pool.state}</span>
                <div className={`mt-1 text-xs ${costState.tone}`}>{costState.label}</div>
                {pool.state === 'draining' && <DrainCountdown pool={pool} />}
                {pool.lastError && (
                  <div className="mt-1 max-w-xs truncate text-xs text-red-300" title={pool.lastError}>
                    {pool.lastError}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-xs">
                <div>{providerLabel(pool.provider)}</div>
                <div className="mt-1 text-gray-500">
                  {[pool.instanceType, pool.capacityType, pool.region].filter(Boolean).join(' · ') || 'Policy default'}
                </div>
              </td>
              <td className="px-4 py-3">{pool.refCount}</td>
              <td className="px-4 py-3 font-mono text-xs">
                {pool.nodeId || '—'} / {pool.publicIp || '—'}
              </td>
              <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="inline-flex flex-wrap justify-end gap-1">
                  {canRetryProvision(pool) && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onRetry(pool)}
                      className="rounded-md border border-sky-500/40 bg-sky-500/10 px-2 py-1 text-xs text-sky-100"
                    >
                      Retry
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => onRecover(pool)}
                    className="inline-flex items-center gap-1 rounded-md border border-sky-500/40 bg-sky-500/10 px-2 py-1 text-xs text-sky-100"
                    title={
                      isOrphanCandidate(pool)
                        ? 'Reattach a live provider VM Mongo forgot (orphan recovery)'
                        : 'Sync pool state from provider truth'
                    }
                  >
                    <RefreshCw className="h-3 w-3" />
                    {isOrphanCandidate(pool) ? 'Recover orphan' : 'Sync'}
                  </button>
                  {hasScheduledGrace(pool) && (
                    <>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onExtendGrace(pool, 5)}
                        className="rounded-md border border-sky-500/40 px-2 py-1 text-xs text-sky-100"
                      >
                        +5m
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onExtendGrace(pool, 15)}
                        className="rounded-md border border-sky-500/40 px-2 py-1 text-xs text-sky-100"
                      >
                        +15m
                      </button>
                    </>
                  )}
                  {hasScheduledGrace(pool) && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onCancelGrace(pool)}
                      className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 px-2 py-1 text-xs text-emerald-100"
                    >
                      <Shield className="h-3 w-3" /> Keep
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => onShutdown(pool, false)}
                    className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 px-2 py-1 text-xs text-amber-100"
                  >
                    <Timer className="h-3 w-3" /> Grace
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => onShutdown(pool, true)}
                    className="inline-flex items-center gap-1 rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-100"
                  >
                    <Power className="h-3 w-3" />
                    {canAbortBoot(pool) ? 'Abort' : `Destroy (${providerLabel(pool.provider)})`}
                  </button>
                </div>
              </td>
            </tr>
              );
            })()
          ))}
        </tbody>
      </table>
    </div>
  );
}
