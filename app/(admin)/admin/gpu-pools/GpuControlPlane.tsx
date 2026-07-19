'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Activity,
  Cpu,
  Power,
  RefreshCw,
  Save,
  Settings2,
  Shield,
  Stethoscope,
  Timer,
  Wrench,
} from 'lucide-react';
import {
  apiService,
  type GPUPoolAdminInfo,
  type GPUPoolBillingInfo,
  type GPUPoolDiagnosticsResult,
  type GPUPoolInventory,
  type GPUPoolJobInfo,
  type GPUPoolRecoveryReport,
  type GPUPoolSupportView,
  type GPUProvisionConfig,
} from '../../lib/apiService';
import GpuPoolOpsTable from './GpuPoolOpsTable';
import GpuProviderInventory from './GpuProviderInventory';

type TabId = 'overview' | 'operations' | 'provider' | 'policy' | 'infrastructure' | 'support';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'operations', label: 'Operations' },
  { id: 'provider', label: 'Provider' },
  { id: 'policy', label: 'Policy' },
  { id: 'infrastructure', label: 'Config' },
  { id: 'support', label: 'Support' },
];

const DEFAULT_TAG = 'vlm-gpu';

function providerLabel(code: string | undefined): string {
  switch (code) {
    case 'aws':
      return 'AWS EC2';
    case 'gcp':
      return 'GCP';
    case 'none':
      return 'None';
    case 'e2e':
      return 'E2E Networks';
    default:
      return code || '—';
  }
}

function chainUsesE2ENetworks(cfg: GPUProvisionConfig): boolean {
  return (
    cfg.infrastructure.primaryProvider === 'e2e' || cfg.infrastructure.fallbackProvider === 'e2e'
  );
}

function chainUsesAWS(cfg: GPUProvisionConfig): boolean {
  return (
    cfg.infrastructure.primaryProvider === 'aws' || cfg.infrastructure.fallbackProvider === 'aws'
  );
}

function defaultPolicy(tag: string): GPUProvisionConfig {
  return {
    serviceTag: tag,
    serviceName: 'sign_verify_vlm_gpu',
    infrastructure: {
      primaryProvider: 'e2e',
      fallbackProvider: 'aws',
      e2e: { location: 'Delhi', gpuCard: 'L4' },
      aws: {
        region: 'ap-south-1',
        instanceType: 'g6.xlarge',
        capacityType: 'spot',
        capacityFallback: 'on-demand',
        fallbackCapacity: 'on-demand',
        subnetId: 'subnet-0de6cd09d0922036c',
        securityGroupId: 'sg-07937c67021f78db5',
      },
      gcp: { enabled: false },
    },
    timeouts: {
      sshReadyPrimarySec: 600,
      sshReadyFallbackSec: 300,
      e2eWaitSec: 600,
      e2eStallSec: 360,
      e2eDestroyWaitSec: 180,
      deployHealthSec: 120,
    },
    retries: { provisionMaxAttempts: 3, destroyMaxAttempts: 3, reuseNodeOnRetry: true },
    lifecycle: {
      gracePeriodMin: 5,
      reconnectCooldownSec: 300,
      stuckProvisionNoJobMin: 13,
      stuckProvisionZombieMin: 22,
      userRetryHintMin: 15,
    },
    flags: { maintenanceMode: false, blockNewSessions: false },
  };
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

function fmtTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

function shortId(value?: string | null): string {
  if (!value) return '—';
  if (value.length <= 12) return value;
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

function isImmediateDestroy(pool: GPUPoolAdminInfo): boolean {
  return pool.state === 'draining' && !pool.drainReason;
}

function canAbortBoot(pool: GPUPoolAdminInfo): boolean {
  if (hasLiveNode(pool) || isImmediateDestroy(pool)) return false;
  return pool.state === 'provisioning' || pool.state === 'failed';
}

function isOrphanCandidate(pool: GPUPoolAdminInfo): boolean {
  return !hasLiveNode(pool) && (pool.state === 'idle' || pool.state === 'failed');
}

function reuseStartHint(pool: GPUPoolAdminInfo | null, diagnostics: GPUPoolDiagnosticsResult | null): string {
  if (!pool) return 'Select a pool to inspect Start Session behavior.';
  if (diagnostics?.nodeLive && diagnostics.gatewayHealth) {
    return 'Start Session should reuse this live node.';
  }
  if ((diagnostics?.providerNodeCount ?? 0) === 1) {
    return 'One provider node exists and can be adopted for reuse.';
  }
  if ((diagnostics?.providerNodeCount ?? 0) > 1) {
    return 'Multiple provider nodes exist; cleanup is required before reuse.';
  }
  if (pool.state === 'ready' && hasLiveNode(pool)) {
    return 'Node exists, but live probe is still pending.';
  }
  if (pool.state === 'provisioning') {
    return 'Start Session will continue provisioning this node.';
  }
  if (pool.state === 'draining') {
    return 'Start Session is blocked while shutdown is in progress.';
  }
  return 'Start Session will cold start this pool.';
}

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: string }) {
  const cls =
    tone === 'cold'
      ? 'bg-sky-500/15 text-sky-200'
      : tone === 'hot'
        ? 'bg-amber-500/15 text-amber-200'
        : 'bg-white/10 text-gray-300';
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${cls}`}>{children}</span>;
}

function FieldHint({ applies }: { applies: 'cold' | 'hot' }) {
  return (
    <Badge tone={applies === 'cold' ? 'cold' : 'hot'}>
      {applies === 'cold' ? 'Next cold start' : 'Immediate'}
    </Badge>
  );
}

function NumberField({
  label,
  help,
  applies,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  help: string;
  applies: 'cold' | 'hot';
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="block text-sm space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-gray-300">{label}</span>
        <FieldHint applies={applies} />
      </div>
      <p className="text-xs text-gray-500">{help}</p>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || min)}
        className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-white"
      />
    </label>
  );
}

export default function GpuControlPlane() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = ((searchParams?.get('tab') as TabId) || 'overview');
  const initialTag = searchParams?.get('tag') || DEFAULT_TAG;

  const [tab, setTab] = useState<TabId>(TABS.some((t) => t.id === initialTab) ? initialTab : 'overview');
  const [pools, setPools] = useState<GPUPoolAdminInfo[]>([]);
  const [billing, setBilling] = useState<GPUPoolBillingInfo | null>(null);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [policy, setPolicy] = useState<GPUProvisionConfig>(() => defaultPolicy(initialTag));
  const [policySummary, setPolicySummary] = useState('');
  const [jobs, setJobs] = useState<GPUPoolJobInfo[]>([]);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [diagnostics, setDiagnostics] = useState<GPUPoolDiagnosticsResult | null>(null);
  const [recovery, setRecovery] = useState<GPUPoolRecoveryReport | null>(null);
  const [inventory, setInventory] = useState<GPUPoolInventory | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [inventoryProvider, setInventoryProvider] = useState<'' | 'aws' | 'e2e'>('');
  const [support, setSupport] = useState<GPUPoolSupportView | null>(null);
  const [loading, setLoading] = useState(true);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const selectedPool = useMemo(
    () => pools.find((p) => p.serviceTag === selectedTag) ?? null,
    [pools, selectedTag]
  );

  const usesE2E = chainUsesE2ENetworks(policy);
  const usesAWS = chainUsesAWS(policy);
  const awsPrimary = policy.infrastructure.primaryProvider === 'aws';

  const syncUrl = useCallback(
    (nextTab: TabId, tag: string) => {
      const params = new URLSearchParams();
      params.set('tab', nextTab);
      params.set('tag', tag);
      router.replace(`/admin/gpu-pools?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const setTabAndUrl = (next: TabId) => {
    setTab(next);
    syncUrl(next, selectedTag);
  };

  const setTagAndUrl = (tag: string) => {
    setSelectedTag(tag);
    syncUrl(tab, tag);
  };

  const tags = useMemo(
    () => (pools.length > 0 ? pools.map((p) => p.serviceTag) : [DEFAULT_TAG]),
    [pools]
  );

  const loadPools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.listGpuPools();
      setPools(response.pools || []);
      if (response.billing) setBilling(response.billing);
      if (response.pools?.length && !response.pools.some((p) => p.serviceTag === selectedTag)) {
        setSelectedTag(response.pools[0].serviceTag);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load GPU pools');
    } finally {
      setLoading(false);
    }
  }, [selectedTag]);

  const loadPolicy = useCallback(async (tag: string) => {
    try {
      setPolicyLoading(true);
      const res = await apiService.getGpuPoolPolicy(tag);
      setPolicy(res.policy);
      setPolicySummary(res.policySummary || '');
    } catch {
      setPolicy(defaultPolicy(tag));
    } finally {
      setPolicyLoading(false);
    }
  }, []);

  const loadOps = useCallback(async (tag: string) => {
    try {
      const [jobsRes, logRes] = await Promise.all([
        apiService.listGpuPoolJobs(tag),
        apiService.getGpuPoolJobLog(tag).catch(() => ({ lines: [], path: '' })),
      ]);
      setJobs(jobsRes.jobs || []);
      setLogLines(logRes.lines || []);
    } catch {
      setJobs([]);
      setLogLines([]);
    }
  }, []);

  const loadSupport = useCallback(async (tag: string) => {
    try {
      setSupport(await apiService.getGpuPoolSupport(tag));
    } catch {
      setSupport(null);
    }
  }, []);

  const loadDiagnostics = useCallback(async (tag: string) => {
    try {
      setDiagnostics(await apiService.runGpuPoolDiagnostics(tag));
    } catch {
      setDiagnostics(null);
    }
  }, []);

  const loadInventory = useCallback(async (tag: string, provider: '' | 'aws' | 'e2e' = '') => {
    try {
      setInventoryLoading(true);
      setInventoryError(null);
      setInventory(await apiService.getGpuPoolInventory(tag, provider || undefined));
    } catch (err) {
      setInventory(null);
      setInventoryError(err instanceof Error ? err.message : 'Failed to load provider inventory');
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPools();
  }, [loadPools]);

  useEffect(() => {
    void loadPolicy(selectedTag);
  }, [selectedTag, loadPolicy]);

  useEffect(() => {
    setRecovery(null);
    setInventory(null);
    setInventoryError(null);
  }, [selectedTag]);

  useEffect(() => {
    void loadSupport(selectedTag);
    void loadDiagnostics(selectedTag);
  }, [selectedTag, loadSupport, loadDiagnostics]);

  useEffect(() => {
    if (tab === 'operations') void loadOps(selectedTag);
  }, [tab, selectedTag, loadOps]);

  useEffect(() => {
    if (tab === 'provider') void loadInventory(selectedTag, inventoryProvider);
  }, [tab, selectedTag, inventoryProvider, loadInventory]);

  useEffect(() => {
    const needsPoll = pools.some((p) => p.state === 'draining' || p.state === 'provisioning');
    if (!needsPoll) return;
    const id = window.setInterval(() => {
      void loadPools();
      if (tab === 'operations') void loadOps(selectedTag);
    }, 5000);
    return () => window.clearInterval(id);
  }, [pools, tab, selectedTag, loadPools, loadOps]);

  const savePolicy = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await apiService.putGpuPoolPolicy(selectedTag, { ...policy, serviceTag: selectedTag });
      setPolicy(res.policy);
      setPolicySummary(res.policySummary || '');
      await loadPools();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save policy');
    } finally {
      setSaving(false);
    }
  };

  const runDiagnostics = async () => {
    try {
      setBusy('diag');
      setDiagnostics(await apiService.runGpuPoolDiagnostics(selectedTag));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Diagnostics failed');
    } finally {
      setBusy(null);
    }
  };

  const recoverPool = async (tag: string = selectedTag) => {
    try {
      setBusy('recover');
      setSelectedTag(tag);
      syncUrl(tab, tag);
      setRecovery(await apiService.recoverGpuPool(tag));
      await loadPools();
      await loadSupport(tag);
      await loadDiagnostics(tag);
      if (tab === 'operations') await loadOps(tag);
      if (tab === 'provider') await loadInventory(tag, inventoryProvider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recovery failed');
    } finally {
      setBusy(null);
    }
  };

  const abortProvision = async () => {
    if (!confirm(`Abort in-flight provision for ${selectedTag}?`)) return;
    try {
      setBusy('abort');
      await apiService.abortGpuPoolProvision(selectedTag);
      await loadPools();
      await loadOps(selectedTag);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Abort failed');
    } finally {
      setBusy(null);
    }
  };

  const shutdown = async (immediate: boolean) => {
    const pool = selectedPool;
    if (!pool) return;
    const msg = canAbortBoot(pool)
      ? `Terminate in-flight boot for ${pool.serviceTag}?`
      : immediate
        ? `Destroy GPU node NOW for ${pool.serviceTag}?`
        : `Schedule destroy in ${Math.round(graceSec(pool) / 60)} min?`;
    if (!confirm(msg)) return;
    try {
      setBusy(immediate ? 'destroy' : 'grace');
      await apiService.shutdownGpuPool(pool.serviceTag, immediate);
      await loadPools();
      if (tab === 'provider') await loadInventory(pool.serviceTag, inventoryProvider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Shutdown failed');
    } finally {
      setBusy(null);
    }
  };

  const cancelGrace = async () => {
    const pool = selectedPool;
    if (!pool) return;
    if (!confirm(`Keep GPU running for ${pool.serviceTag}?`)) return;
    try {
      setBusy('hold');
      await apiService.cancelGpuPoolGrace(pool.serviceTag);
      await loadPools();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel grace');
    } finally {
      setBusy(null);
    }
  };

  const retryProvision = async (pool: GPUPoolAdminInfo) => {
    if (!confirm(`Retry provision for ${pool.serviceTag}?`)) return;
    try {
      setBusy(`retry:${pool.serviceTag}`);
      await apiService.retryGpuPoolProvision(pool.serviceTag);
      await loadPools();
      if (tab === 'operations') await loadOps(pool.serviceTag);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Retry failed');
    } finally {
      setBusy(null);
    }
  };

  const handlePoolShutdown = async (pool: GPUPoolAdminInfo, immediate: boolean) => {
    const msg = canAbortBoot(pool)
      ? `Terminate in-flight boot for ${pool.serviceTag}?`
      : immediate
        ? `Destroy GPU node NOW for ${pool.serviceTag}?`
        : `Schedule destroy in ${Math.round(graceSec(pool) / 60)} min?`;
    if (!confirm(msg)) return;
    try {
      setBusy(immediate ? `destroy:${pool.serviceTag}` : `grace:${pool.serviceTag}`);
      await apiService.shutdownGpuPool(pool.serviceTag, immediate);
      await loadPools();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Shutdown failed');
    } finally {
      setBusy(null);
    }
  };

  const handleCancelGrace = async (pool: GPUPoolAdminInfo) => {
    if (!confirm(`Keep GPU running for ${pool.serviceTag}?`)) return;
    try {
      setBusy(`hold:${pool.serviceTag}`);
      await apiService.cancelGpuPoolGrace(pool.serviceTag);
      await loadPools();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel grace');
    } finally {
      setBusy(null);
    }
  };

  const handleExtendGrace = async (pool: GPUPoolAdminInfo, extendMin: number) => {
    if (!confirm(`Extend destroy deadline by ${extendMin} minutes for ${pool.serviceTag}?`)) return;
    try {
      setBusy(`extend:${pool.serviceTag}`);
      await apiService.extendGpuPoolGrace(pool.serviceTag, extendMin);
      await loadPools();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extend grace');
    } finally {
      setBusy(null);
    }
  };

  const creditsPerMin = billing?.creditsPerMin ?? 2;
  const startupCredits = billing?.startupCredits ?? 20;
  const continuousHourCredits = creditsPerMin * 60;
  const servingNow = Boolean(diagnostics?.nodeLive && diagnostics.gatewayHealth);
  const startReuseHint = reuseStartHint(selectedPool, diagnostics);
  const providerNodeCount = diagnostics?.providerNodeCount ?? 0;

  const updatePolicy = (patch: Partial<GPUProvisionConfig>) => {
    setPolicy((p) => ({ ...p, ...patch }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Cpu className="h-6 w-6 text-amber-400" />
            GPU Control Plane
          </h1>
          <p className="mt-1 text-sm text-gray-400">One policy surface — every knob wired to worker or product behavior.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTag}
            onChange={(e) => setTagAndUrl(e.target.value)}
            className="rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-white"
          >
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
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
      </div>

      {policySummary && (
        <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-4 py-3 text-sm text-sky-100">
          <span className="font-medium">Effective summary:</span> {policySummary}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTabAndUrl(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <GpuPoolOpsTable
            pools={pools}
            selectedTag={selectedTag}
            onSelectTag={setTagAndUrl}
            onShutdown={handlePoolShutdown}
            onCancelGrace={handleCancelGrace}
            onExtendGrace={handleExtendGrace}
            onRetry={retryProvision}
            onRecover={async (pool) => {
              const orphan = isOrphanCandidate(pool);
              if (
                !confirm(
                  orphan
                    ? `Recover orphan for ${pool.serviceTag}? Reattach a live provider VM that Mongo marked idle.`
                    : `Sync / recover ${pool.serviceTag} from provider truth?`,
                )
              ) {
                return;
              }
              await recoverPool(pool.serviceTag);
            }}
            busyTag={busy?.includes(':') ? busy.split(':')[1] ?? null : busy}
          />
          <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-xl border border-white/10 bg-black/20 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  Source of truth
                </h2>
                <div className="text-xs text-gray-500">Merged from pool row, live probe, support, and policy</div>
              </div>
              {selectedPool ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        servingNow
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-100'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium">
                          {servingNow ? 'Live and serving API' : 'Not confirmed as serving'}
                        </span>
                        <span className="text-xs uppercase tracking-wide">
                          {servingNow ? 'reuse on start' : 'probe required'}
                        </span>
                      </div>
                      <div className="mt-1 text-xs opacity-90">{startReuseHint}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-500">State</div>
                        <div className="text-white font-medium">{selectedPool.state}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Sessions</div>
                        <div className="text-white font-medium">{selectedPool.refCount}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Provider</div>
                        <div className="text-white">{providerLabel(selectedPool.provider) || '—'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Node / IP</div>
                        <div className="text-white font-mono text-xs">
                          {shortId(selectedPool.nodeId)} / {selectedPool.publicIp || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Service</div>
                        <div className="text-white">{selectedPool.serviceName}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Updated</div>
                        <div className="text-white">{fmtTime(selectedPool.updatedAt)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Ready at</div>
                        <div className="text-white">{fmtTime(selectedPool.readyAt)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Drain</div>
                        <div className="text-white">{selectedPool.drainReason || '—'}</div>
                      </div>
                    </div>
                    {selectedPool.activeJob && (
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-100">
                        Active job: {selectedPool.activeJob.type} ({selectedPool.activeJob.status}) attempt{' '}
                        {selectedPool.activeJob.attempts}/{selectedPool.activeJob.maxAttempts}
                      </div>
                    )}
                    {selectedPool.lastError && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-200">
                        {selectedPool.lastError}
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-400">Live probe</span>
                        <span className={servingNow ? 'text-emerald-300' : 'text-amber-200'}>
                          {servingNow ? 'serving now' : diagnostics?.nodeLive ? 'node live' : 'not live'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-gray-500">Node live</div>
                        <div className="text-white">{diagnostics ? (diagnostics.nodeLive ? 'yes' : 'no') : '—'}</div>
                        <div className="text-gray-500">Gateway health</div>
                        <div className="text-white">{diagnostics ? (diagnostics.gatewayHealth ? 'yes' : 'no') : '—'}</div>
                        <div className="text-gray-500">Provider nodes</div>
                        <div className="text-white">{diagnostics ? providerNodeCount : '—'}</div>
                        <div className="text-gray-500">Reusable on Start</div>
                        <div className="text-white">{servingNow ? 'yes' : 'no'}</div>
                        <div className="text-gray-500">Public IP</div>
                        <div className="text-white font-mono">{diagnostics?.publicIp || selectedPool.publicIp || '—'}</div>
                        <div className="text-gray-500">Node ID</div>
                        <div className="text-white font-mono">{diagnostics?.nodeId || selectedPool.nodeId || '—'}</div>
                        <div className="text-gray-500">Probe time</div>
                        <div className="text-white">{diagnostics?.probedAt ? fmtTime(diagnostics.probedAt) : '—'}</div>
                      </div>
                    </div>
                    {recovery && (
                      <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 text-sm space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-400">Recovery report</span>
                          <span className={recovery.recovered ? 'text-emerald-300' : 'text-amber-200'}>
                            {recovery.action}
                          </span>
                        </div>
                        <div className="text-xs text-gray-300">{recovery.message || 'Recovery finished.'}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-gray-500">SSH reachable</div>
                          <div className="text-white">{recovery.sshReachable ? 'yes' : 'no'}</div>
                          <div className="text-gray-500">Provider nodes</div>
                          <div className="text-white">{recovery.providerNodeCount}</div>
                          <div className="text-gray-500">Recovered</div>
                          <div className="text-white">{recovery.recovered ? 'yes' : 'no'}</div>
                          <div className="text-gray-500">Probed at</div>
                          <div className="text-white">{fmtTime(recovery.probedAt)}</div>
                        </div>
                        {recovery.notes?.length ? (
                          <div className="space-y-1 pt-1">
                            {recovery.notes.map((note: string) => (
                              <div key={note} className="rounded-md border border-white/5 bg-white/5 px-2 py-1 text-xs text-gray-300">
                                {note}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )}
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-400">Support view</span>
                        <span className={support?.canStart ? 'text-emerald-300' : 'text-red-300'}>
                          {support ? (support.canStart ? 'start allowed' : 'blocked') : '—'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-gray-500">Can user start</div>
                        <div className="text-white">{support ? (support.canStart ? 'yes' : 'no') : '—'}</div>
                        <div className="text-gray-500">Maintenance</div>
                        <div className="text-white">{support ? (support.maintenanceBlock ? 'yes' : 'no') : '—'}</div>
                        <div className="text-gray-500">Active sessions</div>
                        <div className="text-white">{support?.refCount ?? selectedPool.refCount}</div>
                        <div className="text-gray-500">User error</div>
                        <div className="text-white truncate" title={support?.userFacingError || selectedPool.lastError || ''}>
                          {support?.userFacingError || selectedPool.lastError || '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">{loading ? 'Loading…' : 'No pool selected.'}</p>
              )}
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-black/20 p-5 space-y-3">
                <h2 className="text-lg font-medium text-white">Policy</h2>
                <p className="text-xs text-gray-500">
                  {policySummary || 'No effective summary available.'}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Startup credits</div>
                    <div className="text-white font-medium">{startupCredits}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Credits / minute</div>
                    <div className="text-white font-medium">{creditsPerMin}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Cost hint: {startupCredits} startup + {creditsPerMin}/min ({continuousHourCredits}/hr if session stays open).
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-5 space-y-3">
                <h2 className="text-lg font-medium text-white">Live signals</h2>
                <div className="space-y-2 text-sm">
                  {(diagnostics?.summary?.length ? diagnostics.summary : ['Waiting for live probe…']).map((line) => (
                    <div key={line} className="rounded-md border border-white/5 bg-white/5 px-3 py-2 text-gray-300">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'operations' && (
        <div className="space-y-4">
          <GpuPoolOpsTable
            pools={pools}
            selectedTag={selectedTag}
            onSelectTag={setTagAndUrl}
            onShutdown={handlePoolShutdown}
            onCancelGrace={handleCancelGrace}
            onExtendGrace={handleExtendGrace}
            onRetry={retryProvision}
            onRecover={async (pool) => {
              const orphan = isOrphanCandidate(pool);
              if (
                !confirm(
                  orphan
                    ? `Recover orphan for ${pool.serviceTag}? Reattach a live provider VM that Mongo marked idle.`
                    : `Sync / recover ${pool.serviceTag} from provider truth?`,
                )
              ) {
                return;
              }
              await recoverPool(pool.serviceTag);
            }}
            busyTag={busy?.includes(':') ? busy.split(':')[1] ?? null : busy}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void runDiagnostics()}
              disabled={busy === 'diag'}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/5"
            >
              <Stethoscope className="h-4 w-4" />
              {busy === 'diag' ? 'Running…' : 'Run diagnostics'}
            </button>
            <button
              type="button"
              onClick={() => void recoverPool()}
              disabled={busy === 'recover'}
              className="inline-flex items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-sm text-sky-100 hover:bg-sky-500/15"
            >
              <RefreshCw className={`h-4 w-4 ${busy === 'recover' ? 'animate-spin' : ''}`} />
              {busy === 'recover'
                ? 'Recovering…'
                : selectedPool && isOrphanCandidate(selectedPool)
                  ? 'Recover orphan'
                  : 'Sync / recover'}
            </button>
            {selectedPool && canAbortBoot(selectedPool) && (
              <button
                type="button"
                onClick={() => void abortProvision()}
                disabled={busy === 'abort'}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100"
              >
                <Wrench className="h-4 w-4" />
                Abort provision
              </button>
            )}
            {selectedPool && hasScheduledGrace(selectedPool) && (
              <button type="button" onClick={() => void cancelGrace()} className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                <Shield className="h-4 w-4" /> Keep running
              </button>
            )}
            {selectedPool && (
              <>
                <button type="button" onClick={() => void shutdown(false)} className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                  <Timer className="h-4 w-4" /> Schedule destroy
                </button>
                <button type="button" onClick={() => void shutdown(true)} className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                  <Power className="h-4 w-4" /> Destroy now
                </button>
              </>
            )}
          </div>

          {diagnostics && (
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm space-y-2">
              <div className="font-medium text-white">Diagnostics ({diagnostics.probedAt})</div>
              <ul className="list-disc pl-5 text-gray-300">
                {diagnostics.summary.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Attempt</th>
                  <th className="px-4 py-2">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                      No recent jobs
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="text-gray-200">
                      <td className="px-4 py-2 font-mono text-xs">{job.type}</td>
                      <td className="px-4 py-2">{job.status}</td>
                      <td className="px-4 py-2">
                        {job.attempts}/{job.maxAttempts}
                      </td>
                      <td className="px-4 py-2 text-xs text-red-300 truncate max-w-xs">{job.lastError || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <h3 className="text-sm font-medium text-white mb-2">Provision log (tail)</h3>
            <pre className="max-h-80 overflow-auto rounded bg-black/50 p-3 text-xs text-gray-300 font-mono">
              {logLines.length ? logLines.join('\n') : 'No log lines yet.'}
            </pre>
          </div>
        </div>
      )}

      {tab === 'provider' && (
        <GpuProviderInventory
          inventory={inventory}
          loading={inventoryLoading}
          error={inventoryError}
          providerFilter={inventoryProvider}
          onProviderFilter={setInventoryProvider}
          onRefresh={() => void loadInventory(selectedTag, inventoryProvider)}
          onRecover={() => {
            const orphan = selectedPool ? isOrphanCandidate(selectedPool) : false;
            if (
              !confirm(
                orphan
                  ? `Recover orphan for ${selectedTag}? Reattach a live provider VM that Mongo marked idle.`
                  : `Sync / recover ${selectedTag} from provider truth?`,
              )
            ) {
              return;
            }
            void recoverPool();
          }}
          onDestroyTracked={() => void shutdown(true)}
          busy={Boolean(busy)}
        />
      )}

      {tab === 'policy' && !policyLoading && (
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-black/20 p-5 space-y-4">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-sky-400" />
              When a VM is starting
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <NumberField label="Wait for SSH (primary)" help="Worker waits for SSH on the primary cloud provider." applies="cold" value={policy.timeouts.sshReadyPrimarySec ?? 600} onChange={(n) => updatePolicy({ timeouts: { ...policy.timeouts, sshReadyPrimarySec: n } })} min={60} max={1800} />
              <NumberField label="Wait for SSH (fallback)" help="SSH timeout when falling back to the secondary provider." applies="cold" value={policy.timeouts.sshReadyFallbackSec ?? 300} onChange={(n) => updatePolicy({ timeouts: { ...policy.timeouts, sshReadyFallbackSec: n } })} min={60} max={900} />
              {usesE2E && (
                <>
                  <NumberField label="E2E Networks: wait for node API" help="Only when E2E Networks is in the provider chain." applies="cold" value={policy.timeouts.e2eWaitSec ?? 600} onChange={(n) => updatePolicy({ timeouts: { ...policy.timeouts, e2eWaitSec: n } })} min={120} max={2400} />
                  <NumberField label="E2E Networks: stall timeout" help="Only when E2E Networks is in the chain." applies="cold" value={policy.timeouts.e2eStallSec ?? 360} onChange={(n) => updatePolicy({ timeouts: { ...policy.timeouts, e2eStallSec: n } })} min={60} max={900} />
                  <NumberField label="E2E Networks: teardown wait" help="Only when E2E Networks is in the chain." applies="cold" value={policy.timeouts.e2eDestroyWaitSec ?? 180} onChange={(n) => updatePolicy({ timeouts: { ...policy.timeouts, e2eDestroyWaitSec: n } })} min={60} max={600} />
                </>
              )}
              <NumberField label="Deploy health timeout" help="On-node /health via SSH — all providers." applies="cold" value={policy.timeouts.deployHealthSec ?? 120} onChange={(n) => updatePolicy({ timeouts: { ...policy.timeouts, deployHealthSec: n } })} min={30} max={600} />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-5 space-y-4">
            <h2 className="text-lg font-medium text-white">When something fails</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <NumberField label="Provision retries" help="Max enqueue attempts for provision job." applies="cold" value={policy.retries.provisionMaxAttempts ?? 3} onChange={(n) => updatePolicy({ retries: { ...policy.retries, provisionMaxAttempts: n } })} min={1} max={5} />
              <NumberField label="Destroy retries" help="Max attempts for destroy jobs." applies="cold" value={policy.retries.destroyMaxAttempts ?? 3} onChange={(n) => updatePolicy({ retries: { ...policy.retries, destroyMaxAttempts: n } })} min={1} max={5} />
              <NumberField label="User retry hint (min)" help="Try API copy when pool fails." applies="cold" value={policy.lifecycle.userRetryHintMin ?? 15} onChange={(n) => updatePolicy({ lifecycle: { ...policy.lifecycle, userRetryHintMin: n } })} min={1} max={60} />
              {(policy.retries.provisionMaxAttempts ?? 3) > 1 && (
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={policy.retries.reuseNodeOnRetry ?? true}
                    onChange={(e) => updatePolicy({ retries: { ...policy.retries, reuseNodeOnRetry: e.target.checked } })}
                  />
                  Reuse partial VM on retry <FieldHint applies="cold" />
                </label>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-5 space-y-4">
            <h2 className="text-lg font-medium text-white">When nobody is testing</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <NumberField label="Idle teardown grace (min)" help="Grace before idle GPU destroy." applies="hot" value={policy.lifecycle.gracePeriodMin ?? 5} onChange={(n) => updatePolicy({ lifecycle: { ...policy.lifecycle, gracePeriodMin: n } })} min={1} max={60} />
              <NumberField
                label="Reconnect window (min)"
                help="Skip startup charge if user returns within this window."
                applies="hot"
                value={Math.round((policy.lifecycle.reconnectCooldownSec ?? 300) / 60)}
                onChange={(n) => updatePolicy({ lifecycle: { ...policy.lifecycle, reconnectCooldownSec: n * 60 } })}
                min={1}
                max={30}
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-5 space-y-4">
            <h2 className="text-lg font-medium text-white">Safety limits</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <NumberField label="No job threshold (min)" help="Mark failed if provisioning but no worker job." applies="hot" value={policy.lifecycle.stuckProvisionNoJobMin ?? 13} onChange={(n) => updatePolicy({ lifecycle: { ...policy.lifecycle, stuckProvisionNoJobMin: n } })} min={5} max={120} />
              <NumberField label="Zombie job threshold (min)" help="Mark failed if job runs too long." applies="hot" value={policy.lifecycle.stuckProvisionZombieMin ?? 22} onChange={(n) => updatePolicy({ lifecycle: { ...policy.lifecycle, stuckProvisionZombieMin: n } })} min={10} max={180} />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-5 space-y-4">
            <h2 className="text-lg font-medium text-white">Maintenance</h2>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={policy.flags.maintenanceMode ?? false}
                onChange={(e) => updatePolicy({ flags: { ...policy.flags, maintenanceMode: e.target.checked } })}
              />
              Maintenance mode (blocks Start Testing) <FieldHint applies="hot" />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={policy.flags.blockNewSessions ?? false}
                onChange={(e) => updatePolicy({ flags: { ...policy.flags, blockNewSessions: e.target.checked } })}
              />
              Block new sessions only <FieldHint applies="hot" />
            </label>
            <label className="block text-sm">
              <span className="text-gray-400">Maintenance message (optional)</span>
              <input
                value={policy.flags.maintenanceMessage ?? ''}
                onChange={(e) => updatePolicy({ flags: { ...policy.flags, maintenanceMessage: e.target.value } })}
                className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-white"
              />
            </label>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() => void savePolicy()}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save policy'}
          </button>
        </div>
      )}

      {tab === 'infrastructure' && !policyLoading && (
        <div className="rounded-xl border border-white/10 bg-black/20 p-5 space-y-4">
          <h2 className="text-lg font-medium text-white">Providers & capacity</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm">
              <span className="text-gray-400">Primary provider</span>
              <select
                value={policy.infrastructure.primaryProvider}
                onChange={(e) =>
                  updatePolicy({
                    infrastructure: {
                      ...policy.infrastructure,
                      primaryProvider: e.target.value as GPUProvisionConfig['infrastructure']['primaryProvider'],
                    },
                  })
                }
                className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-white"
              >
                <option value="e2e">E2E Networks</option>
                <option value="aws">AWS EC2</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-gray-400">Fallback provider</span>
              <select
                value={policy.infrastructure.fallbackProvider ?? 'aws'}
                onChange={(e) =>
                  updatePolicy({
                    infrastructure: {
                      ...policy.infrastructure,
                      fallbackProvider: e.target.value as GPUProvisionConfig['infrastructure']['fallbackProvider'],
                    },
                  })
                }
                className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-white"
              >
                <option value="aws">AWS EC2</option>
                <option value="none">None</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-gray-400">Pipeline service</span>
              <input
                value={policy.serviceName ?? ''}
                onChange={(e) => updatePolicy({ serviceName: e.target.value })}
                className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-white font-mono text-xs"
              />
            </label>
            {usesE2E && (
              <>
                <label className="block text-sm">
                  <span className="text-gray-400">E2E Networks location</span>
                  <input
                    value={policy.infrastructure.e2e?.location ?? ''}
                    onChange={(e) =>
                      updatePolicy({
                        infrastructure: {
                          ...policy.infrastructure,
                          e2e: { ...policy.infrastructure.e2e, location: e.target.value },
                        },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-white"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-gray-400">E2E Networks GPU card</span>
                  <input
                    value={policy.infrastructure.e2e?.gpuCard ?? ''}
                    onChange={(e) =>
                      updatePolicy({
                        infrastructure: {
                          ...policy.infrastructure,
                          e2e: { ...policy.infrastructure.e2e, gpuCard: e.target.value },
                        },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-white"
                  />
                </label>
              </>
            )}
            {usesAWS && (
              <>
                <label className="block text-sm">
                  <span className="text-gray-400">AWS instance</span>
                  <select
                    value={policy.infrastructure.aws?.instanceType ?? 'g6.xlarge'}
                    onChange={(e) =>
                      updatePolicy({
                        infrastructure: {
                          ...policy.infrastructure,
                          aws: { ...policy.infrastructure.aws, instanceType: e.target.value },
                        },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-white"
                  >
                    <option value="g6.xlarge">g6.xlarge</option>
                    <option value="g6.2xlarge">g6.2xlarge</option>
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-gray-400">AWS capacity</span>
                  <select
                    value={policy.infrastructure.aws?.capacityType ?? 'spot'}
                    onChange={(e) =>
                      updatePolicy({
                        infrastructure: {
                          ...policy.infrastructure,
                          aws: {
                            ...policy.infrastructure.aws,
                            capacityType: e.target.value as 'spot' | 'on-demand',
                          },
                        },
                      })
                    }
                    className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-white"
                  >
                    <option value="spot">spot</option>
                    <option value="on-demand">on-demand</option>
                  </select>
                </label>
                {!awsPrimary && (
                  <>
                    <label className="block text-sm">
                      <span className="text-gray-400">AWS fallback capacity (primary fail)</span>
                      <select
                        value={policy.infrastructure.aws?.capacityFallback ?? 'on-demand'}
                        onChange={(e) =>
                          updatePolicy({
                            infrastructure: {
                              ...policy.infrastructure,
                              aws: {
                                ...policy.infrastructure.aws,
                                capacityFallback: e.target.value as 'spot' | 'on-demand',
                              },
                            },
                          })
                        }
                        className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-white"
                      >
                        <option value="spot">spot</option>
                        <option value="on-demand">on-demand</option>
                      </select>
                    </label>
                    <label className="block text-sm">
                      <span className="text-gray-400">AWS fallback capacity (spot exhausted)</span>
                      <select
                        value={policy.infrastructure.aws?.fallbackCapacity ?? 'on-demand'}
                        onChange={(e) =>
                          updatePolicy({
                            infrastructure: {
                              ...policy.infrastructure,
                              aws: {
                                ...policy.infrastructure.aws,
                                fallbackCapacity: e.target.value as 'spot' | 'on-demand',
                              },
                            },
                          })
                        }
                        className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-white"
                      >
                        <option value="spot">spot</option>
                        <option value="on-demand">on-demand</option>
                      </select>
                    </label>
                  </>
                )}
                <label className="block text-sm">
                  <span className="text-gray-400">Subnet (read-only)</span>
                  <input readOnly value={policy.infrastructure.aws?.subnetId ?? ''} className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-gray-400 font-mono text-xs" />
                </label>
                <label className="block text-sm">
                  <span className="text-gray-400">Security group (read-only)</span>
                  <input readOnly value={policy.infrastructure.aws?.securityGroupId ?? ''} className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-gray-400 font-mono text-xs" />
                </label>
              </>
            )}
            <label className="block text-sm opacity-50">
              <span className="text-gray-400">GCP (disabled)</span>
              <input disabled value="Phase 4 — stub exits 51" className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-gray-500" />
            </label>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => void savePolicy()}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save infrastructure'}
          </button>
        </div>
      )}

      {tab === 'support' && (
        <div className="rounded-xl border border-white/10 bg-black/20 p-5 space-y-3 text-sm">
          <p className="text-gray-400">Read-only status for beta tickets. Link from beta-feedback session detail.</p>
          {support ? (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="text-gray-500">Can user start?</div>
                  <div className={support.canStart ? 'text-emerald-300' : 'text-red-300'}>
                    {support.canStart ? 'Yes' : 'No'}
                    {support.maintenanceBlock && ' (maintenance)'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">State / provider</div>
                  <div className="text-white">
                    {support.state} · {support.providerLabel || providerLabel(support.provider)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Active sessions</div>
                  <div className="text-white">{support.refCount}</div>
                </div>
                <div>
                  <div className="text-gray-500">User-facing error</div>
                  <div className="text-amber-200">{support.userFacingError || '—'}</div>
                </div>
              </div>
              {support.sessions && support.sessions.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-white/10">
                  <table className="min-w-full text-left text-xs">
                    <thead className="border-b border-white/10 bg-white/5 text-gray-400">
                      <tr>
                        <th className="px-3 py-2">User</th>
                        <th className="px-3 py-2">Started</th>
                        <th className="px-3 py-2">Stopped</th>
                        <th className="px-3 py-2">Credits</th>
                        <th className="px-3 py-2">Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {support.sessions.map((s) => (
                        <tr key={`${s.userId}-${s.startedAt}`} className="text-gray-300">
                          <td className="px-3 py-2 font-mono">{s.userId.slice(0, 8)}…</td>
                          <td className="px-3 py-2">{new Date(s.startedAt).toLocaleString()}</td>
                          <td className="px-3 py-2">{s.stoppedAt ? new Date(s.stoppedAt).toLocaleString() : '—'}</td>
                          <td className="px-3 py-2">
                            {(s.creditsCharged ?? 0) + (s.creditsStartupCharged ?? 0)}
                            {s.creditsStartupCharged ? ` (${s.creditsStartupCharged} startup)` : ''}
                          </td>
                          <td className="px-3 py-2">{s.active ? 'yes' : 'no'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <details>
                <summary className="cursor-pointer text-gray-400">Technical detail (admin only)</summary>
                <pre className="mt-2 rounded bg-black/50 p-3 text-xs text-gray-400 whitespace-pre-wrap">
                  {support.lastErrorRaw || '—'}
                </pre>
              </details>
            </>
          ) : (
            <p className="text-gray-500">Loading support view…</p>
          )}
        </div>
      )}
    </div>
  );
}
