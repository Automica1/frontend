'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { Cpu, Power, RefreshCw, Shield, Timer } from 'lucide-react';
import { apiService, type GPUPoolAdminInfo } from '../../lib/apiService';

const GRACE_SEC_DEFAULT = 300;

function hasLiveNode(pool: GPUPoolAdminInfo): boolean {
  return Boolean(pool.nodeId || pool.publicIp);
}

function hasScheduledGrace(pool: GPUPoolAdminInfo): boolean {
  return pool.state === 'draining' && (pool.drainReason === 'user_grace' || pool.drainReason === 'admin_grace');
}

function isImmediateDestroy(pool: GPUPoolAdminInfo): boolean {
  return pool.state === 'draining' && !pool.drainReason;
}

function canScheduleGraceDestroy(pool: GPUPoolAdminInfo): boolean {
  if (!hasLiveNode(pool)) return false;
  if (isImmediateDestroy(pool)) return false;
  return pool.state === 'ready' || pool.state === 'provisioning' || pool.state === 'failed';
}

function canAbortBoot(pool: GPUPoolAdminInfo): boolean {
  if (hasLiveNode(pool) || isImmediateDestroy(pool)) return false;
  return pool.state === 'provisioning' || pool.state === 'failed' || pool.state === 'draining';
}

function canDestroyNow(pool: GPUPoolAdminInfo): boolean {
  if (isImmediateDestroy(pool)) return false;
  if (canAbortBoot(pool)) return true;
  if (!hasLiveNode(pool)) return false;
  return (
    pool.state === 'ready' ||
    pool.state === 'provisioning' ||
    pool.state === 'failed' ||
    hasScheduledGrace(pool)
  );
}

function destroyNowLabel(pool: GPUPoolAdminInfo): string {
  return canAbortBoot(pool) ? 'Terminate boot' : 'Destroy now';
}

function canCancelGrace(pool: GPUPoolAdminInfo): boolean {
  if (hasScheduledGrace(pool)) return true;
  return pool.state === 'ready' && hasLiveNode(pool) && pool.refCount === 0 && !pool.adminWarmHold;
}

function stateBadgeClass(state: GPUPoolAdminInfo['state']): string {
  switch (state) {
    case 'ready':
      return 'bg-emerald-500/20 text-emerald-200';
    case 'provisioning':
      return 'bg-amber-500/20 text-amber-200';
    case 'draining':
      return 'bg-orange-500/20 text-orange-200';
    case 'failed':
      return 'bg-red-500/20 text-red-200';
    default:
      return 'bg-white/10 text-gray-300';
  }
}

function destroyAtFromPool(pool: GPUPoolAdminInfo, graceSec: number): Date | null {
  if (pool.state !== 'draining' || !pool.drainStartedAt) return null;
  if (pool.drainReason !== 'user_grace' && pool.drainReason !== 'admin_grace') return null;
  return new Date(new Date(pool.drainStartedAt).getTime() + graceSec * 1000);
}

function formatCountdown(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function DrainCountdown({ pool, graceSec }: { pool: GPUPoolAdminInfo; graceSec: number }) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const destroyAt = destroyAtFromPool(pool, graceSec);

  useEffect(() => {
    if (!destroyAt) {
      setSecondsLeft(null);
      return;
    }
    const tick = () => {
      const sec = Math.max(0, Math.ceil((destroyAt.getTime() - Date.now()) / 1000));
      setSecondsLeft(sec);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [destroyAt]);

  if (secondsLeft === null) {
    return <div className="mt-1 text-xs text-gray-500">Destroying…</div>;
  }
  return (
    <div className="mt-1 text-xs text-amber-200">
      Destroys in {formatCountdown(secondsLeft)}
      {pool.drainReason === 'admin_grace' ? ' (admin grace)' : ' (user grace)'}
    </div>
  );
}

export default function GpuPoolsAdminPage() {
  const { isAuthenticated, isLoading: authLoading } = useKindeBrowserClient();
  const [pools, setPools] = useState<GPUPoolAdminInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shuttingDown, setShuttingDown] = useState<string | null>(null);
  const [cancellingGrace, setCancellingGrace] = useState<string | null>(null);

  const loadPools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.listGpuPools();
      setPools(response.pools || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load GPU pools');
      setPools([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    void loadPools();
  }, [authLoading, isAuthenticated, loadPools]);

  useEffect(() => {
    const needsPoll = pools.some((p) => p.state === 'draining' || p.state === 'provisioning');
    if (!needsPoll) return;
    const id = window.setInterval(() => void loadPools(), 5000);
    return () => window.clearInterval(id);
  }, [pools, loadPools]);

  const handleCancelGrace = async (pool: GPUPoolAdminInfo) => {
    const node = pool.nodeId || pool.publicIp || 'unknown';
    const msg = hasScheduledGrace(pool)
      ? `Cancel teardown and keep GPU running for ${pool.serviceTag}?\n\nNode: ${node}\nAuto-teardown is paused until you destroy manually.`
      : `Hold GPU warm for ${pool.serviceTag}?\n\nNode: ${node}\nIdle auto-teardown is paused until you destroy manually.`;
    if (!confirm(msg)) return;

    try {
      setCancellingGrace(pool.serviceTag);
      setError(null);
      await apiService.cancelGpuPoolGrace(pool.serviceTag);
      await loadPools();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel grace teardown');
    } finally {
      setCancellingGrace(null);
    }
  };

  const handleShutdown = async (pool: GPUPoolAdminInfo, immediate: boolean) => {
    const label = pool.serviceTag;
    const node = pool.nodeId || pool.publicIp || 'unknown';
    const abortBoot = canAbortBoot(pool);
    const msg = abortBoot
      ? `Terminate in-flight GPU boot for ${label}?\n\nNo VM is registered yet. This cancels provisioning, ends sessions, refunds startup credits, and resets the pool to idle.`
      : immediate
        ? `Destroy GPU node NOW for ${label}?\n\nNode: ${node}\nThis ends all sessions and immediately deletes the E2E VM.`
        : `Schedule GPU destroy in 5 minutes for ${label}?\n\nNode: ${node}\nActive testers will see a countdown.`;
    if (!confirm(msg)) return;

    try {
      setShuttingDown(pool.serviceTag);
      setError(null);
      await apiService.shutdownGpuPool(pool.serviceTag, immediate);
      await loadPools();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to shut down GPU pool');
    } finally {
      setShuttingDown(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Cpu className="h-6 w-6 text-amber-400" />
            GPU Pools
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Idle pools auto-teardown after 5 min grace. Override anytime: cancel teardown, schedule destroy, or destroy now.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadPools()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">Sessions</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Node</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && pools.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : pools.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No GPU pools configured.
                </td>
              </tr>
            ) : (
              pools.map((pool) => (
                <tr key={pool.serviceTag} className="text-gray-200">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{pool.serviceTag}</div>
                    <div className="text-xs text-gray-500">{pool.serviceName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${stateBadgeClass(pool.state)}`}
                    >
                      {pool.state}
                    </span>
                    {pool.state === 'draining' && (
                      <DrainCountdown pool={pool} graceSec={GRACE_SEC_DEFAULT} />
                    )}
                    {pool.adminWarmHold && pool.state === 'ready' && (
                      <div className="mt-1 text-xs text-emerald-300">Admin warm hold — auto-teardown off</div>
                    )}
                    {pool.lastError && (
                      <div className="mt-1 max-w-xs truncate text-xs text-red-300" title={pool.lastError}>
                        {pool.lastError}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">{pool.refCount}</td>
                  <td className="px-4 py-3 text-xs">{pool.nodeOwner || 'admin'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{pool.nodeId || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{pool.publicIp || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:flex-wrap sm:justify-end">
                      {canCancelGrace(pool) && (
                        <button
                          type="button"
                          disabled={cancellingGrace === pool.serviceTag || shuttingDown === pool.serviceTag}
                          onClick={() => void handleCancelGrace(pool)}
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-100 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Shield className="h-3 w-3" />
                          {cancellingGrace === pool.serviceTag ? '…' : 'Keep running'}
                        </button>
                      )}
                      {canScheduleGraceDestroy(pool) && (
                        <button
                          type="button"
                          disabled={shuttingDown === pool.serviceTag || cancellingGrace === pool.serviceTag}
                          onClick={() => void handleShutdown(pool, false)}
                          className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-100 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Timer className="h-3 w-3" />
                          {shuttingDown === pool.serviceTag ? '…' : 'Destroy in 5 min'}
                        </button>
                      )}
                      {canDestroyNow(pool) && (
                        <button
                          type="button"
                          disabled={shuttingDown === pool.serviceTag || cancellingGrace === pool.serviceTag}
                          onClick={() => void handleShutdown(pool, true)}
                          className="inline-flex items-center gap-1 rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-100 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Power className="h-3 w-3" />
                          {shuttingDown === pool.serviceTag ? '…' : destroyNowLabel(pool)}
                        </button>
                      )}
                      {isImmediateDestroy(pool) && (
                        <span className="text-xs text-gray-500">Destroying now…</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
