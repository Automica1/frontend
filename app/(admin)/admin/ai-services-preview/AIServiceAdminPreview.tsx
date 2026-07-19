'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  ExternalLink,
  FileText,
  Gauge,
  KeyRound,
  Layers3,
  Loader2,
  MoreHorizontal,
  Plus,
  Play,
  Power,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Square,
  Trash2,
  Save,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import {
  apiService,
  type BetaServiceInfo,
  type BetaServicePolicy,
  type GPUPoolAdminInfo,
  type GPUPoolBillingInfo,
  type GPUPoolDiagnosticsResult,
  type GPUPoolJobInfo,
  type GPUPoolSupportView,
  type ServiceUsageStat,
} from '../../lib/apiService';
import {
  clearSolutionPolicyOverride,
  getAvailableSolutions,
  materializeServicePolicy,
  saveSolutionPolicyOverride,
  summarizeServicePolicy,
  type ServicePolicyLimit,
  type ServicePolicyPricing,
  type ServicePolicy,
  type SolutionKey,
  type Solution,
} from '../../../(main)/lib/solutions';
import { getServiceRunCost } from '../../../(main)/lib/serviceRunCosts';
import type { SolutionType } from '../../../(main)/types/solution';

type RuntimeKind = 'api' | 'gpu' | 'variant';
type ServiceState = 'ready' | 'attention' | 'blocked' | 'idle' | 'provisioning' | 'draining' | 'failed';
type LoadSource = 'catalog' | 'usage' | 'gpu-pools' | 'beta-services';
type DetailTab = 'overview' | 'runtime' | 'recovery' | 'access' | 'usage' | 'policy';
type FilterId = 'all' | 'attention' | 'gpu' | 'beta' | 'public';
type DrawerId = 'logs' | 'support' | null;
type MobilePane = 'services' | 'detail';

type RuntimeFacet = {
  tag: string;
  kind: RuntimeKind;
  state: ServiceState;
  provider: string;
  node: string;
  sessions: number;
  reuse: 'ready' | 'recoverable' | 'cold-start' | 'blocked';
  source: string;
  apiUrl?: string;
  pool?: GPUPoolAdminInfo;
};

type AIService = {
  slug: string;
  name: string;
  category: string;
  state: ServiceState;
  access: string;
  endpoint: string;
  docs: string;
  runCost: number;
  calls: number;
  success: number;
  failed: number;
  successRate: string;
  creditsUsed: number;
  requiresGpu: boolean;
  hasBeta: boolean;
  betaServiceTag?: string;
  servicePolicy?: ServicePolicy;
  policySummary: string;
  runtimes: RuntimeFacet[];
  betaServices: BetaServiceInfo[];
};

type RuntimeDetails = {
  support?: GPUPoolSupportView;
  diagnostics?: GPUPoolDiagnosticsResult;
  jobs?: GPUPoolJobInfo[];
  logLines?: string[];
  loading?: boolean;
  error?: string;
};

type RuntimeAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  tone: 'primary' | 'neutral' | 'warn' | 'danger';
  enabled: boolean;
  reason?: string;
  confirm?: boolean;
  run: () => Promise<unknown>;
};

type PendingConfirm = {
  action: RuntimeAction;
  serviceTag: string;
  node: string;
};

const PAGE_SIZE = 8;
const DETAIL_TABS: { id: DetailTab; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', icon: Layers3 },
  { id: 'runtime', label: 'Runtime', icon: Cpu },
  { id: 'recovery', label: 'Recovery', icon: Wrench },
  { id: 'policy', label: 'Policy', icon: ShieldCheck },
  { id: 'access', label: 'Access', icon: KeyRound },
  { id: 'usage', label: 'Usage', icon: BarChart3 },
];
const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'attention', label: 'Needs attention' },
  { id: 'gpu', label: 'GPU' },
  { id: 'beta', label: 'Beta' },
  { id: 'public', label: 'Public' },
];
const stateWeight: Record<ServiceState, number> = {
  blocked: 6,
  failed: 5,
  attention: 4,
  provisioning: 3,
  draining: 2,
  idle: 1,
  ready: 0,
};

function stateTone(state: ServiceState): string {
  switch (state) {
    case 'ready':
      return 'border-emerald-400/35 bg-emerald-500/10 text-emerald-100';
    case 'provisioning':
      return 'border-sky-400/35 bg-sky-500/10 text-sky-100';
    case 'draining':
    case 'attention':
      return 'border-amber-400/35 bg-amber-500/10 text-amber-100';
    case 'failed':
    case 'blocked':
      return 'border-red-400/35 bg-red-500/10 text-red-100';
    default:
      return 'border-white/10 bg-white/5 text-gray-300';
  }
}

function normalizePoolState(pool?: GPUPoolAdminInfo): ServiceState {
  if (!pool) return 'idle';
  if (pool.state === 'failed') return 'failed';
  return pool.state as ServiceState;
}

function providerLabel(code?: string): string {
  switch (code) {
    case 'aws':
      return 'AWS EC2';
    case 'gcp':
      return 'GCP';
    case 'e2e':
      return 'E2E';
    case 'none':
      return 'None';
    default:
      return code || 'Automica';
  }
}

function betaRegistryProviderLabel(service: BetaServiceInfo): string {
  const provider = service.registrySettings?.provider;
  switch (provider) {
    case 'ghcr':
      return 'GHCR';
    case 'ecr':
      return 'AWS ECR';
    case 'gcr':
      return 'GCR';
    case 'gar':
      return 'GAR';
    case 'dockerhub':
      return 'Docker Hub';
    case 'acr':
      return 'Azure ACR';
    case 'quay':
      return 'Quay';
    case 'custom':
      return 'Custom registry';
    default:
      return 'Beta registry';
  }
}

function nodeLabel(pool?: GPUPoolAdminInfo): string {
  if (!pool) return 'no pool record';
  const parts = [pool.publicIp || pool.previousPublicIp, pool.nodeId].filter(Boolean);
  return parts.length ? parts.join(' / ') : '- / -';
}

function reuseMode(pool?: GPUPoolAdminInfo): RuntimeFacet['reuse'] {
  if (!pool) return 'cold-start';
  if (pool.state === 'ready') return pool.publicIp || pool.nodeId ? 'ready' : 'recoverable';
  if (pool.state === 'provisioning' || pool.state === 'failed') return 'recoverable';
  if (pool.state === 'draining') return 'blocked';
  return 'cold-start';
}

function runtimeIcon(kind: RuntimeKind): LucideIcon {
  if (kind === 'gpu') return Cpu;
  if (kind === 'variant') return Wrench;
  return Server;
}

function categoryFor(solution: Solution): string {
  if (solution.slug.includes('qr')) return 'Document AI';
  if (solution.slug.includes('face')) return 'Identity';
  if (solution.slug.includes('signature')) return 'Verification';
  if (solution.slug.includes('ocr') || solution.slug.includes('document') || solution.slug.includes('id')) return 'Document AI';
  return 'AI API';
}

function usageAliases(slug: string): string[] {
  const aliases = new Set([slug, slug.replace(/-/g, '_')]);
  if (slug === 'qr-masking') aliases.add('qr-mask');
  if (slug === 'qr-extract') aliases.add('qr');
  return Array.from(aliases);
}

function findUsage(stats: ServiceUsageStat[], slug: string): ServiceUsageStat | undefined {
  const aliases = usageAliases(slug);
  return stats.find((stat) => aliases.includes(stat.service_name));
}

function serviceBetaRows(solution: Solution, betaServices: BetaServiceInfo[]): BetaServiceInfo[] {
  return betaServices.filter((svc) => (
    svc.serviceName === solution.slug ||
    svc.serviceName.replace(/_/g, '-') === solution.slug ||
    svc.tag === solution.betaServiceTag
  ));
}

function backendPolicyToDraft(policy?: BetaServicePolicy): ServicePolicy | undefined {
  if (!policy) return undefined;
  const maxUploadSizeMB = policy.limits?.maxUploadSizeMB ?? null;
  const maxPages = policy.limits?.maxPages ?? null;
  const maxFiles = policy.limits?.maxFiles ?? null;
  const allowedFormats = policy.limits?.allowedFormats ? [...policy.limits.allowedFormats] : [];
  const notes = policy.notes ? policy.notes.split('\n').map((note) => note.trim()).filter(Boolean) : [];

  return materializeServicePolicy({
    source: 'override',
    editable: true,
    pricingMode: (policy.pricing?.mode as ServicePolicy['pricingMode']) || 'hybrid',
    maxUploadSizeMB,
    maxPages,
    maxFiles,
    allowedFormats,
    creditsPerHit: policy.pricing?.creditsPerHit ?? null,
    creditsPerPage: policy.pricing?.creditsPerPage ?? null,
    sessionStartCredits: policy.pricing?.startupCredits ?? null,
    creditsPerMinute: policy.pricing?.creditsPerMinute ?? null,
    notes,
  }) as ServicePolicy;
}

function draftToBackendPolicy(draft: ServicePolicy): BetaServicePolicy {
  const hasLimits =
    draft.maxUploadSizeMB != null ||
    draft.maxPages != null ||
    draft.maxFiles != null ||
    (draft.allowedFormats?.length ?? 0) > 0;
  const hasPricing =
    draft.pricingMode != null ||
    draft.creditsPerHit != null ||
    draft.creditsPerPage != null ||
    draft.sessionStartCredits != null ||
    draft.creditsPerMinute != null;

  return {
    ...(hasLimits ? {
      limits: {
        ...(draft.maxUploadSizeMB != null ? { maxUploadSizeMB: draft.maxUploadSizeMB } : {}),
        ...(draft.maxPages != null ? { maxPages: draft.maxPages } : {}),
        ...(draft.maxFiles != null ? { maxFiles: draft.maxFiles } : {}),
        ...(draft.allowedFormats?.length ? { allowedFormats: draft.allowedFormats.map((entry) => entry.trim()).filter(Boolean) } : {}),
      },
    } : {}),
    ...(hasPricing ? {
      pricing: {
        ...(draft.pricingMode ? { mode: draft.pricingMode } : {}),
        ...(draft.creditsPerHit != null ? { creditsPerHit: draft.creditsPerHit } : {}),
        ...(draft.creditsPerPage != null ? { creditsPerPage: draft.creditsPerPage } : {}),
        ...(draft.sessionStartCredits != null ? { startupCredits: draft.sessionStartCredits } : {}),
        ...(draft.creditsPerMinute != null ? { creditsPerMinute: draft.creditsPerMinute } : {}),
      },
    } : {}),
    ...(draft.notes?.length ? { notes: draft.notes.map((note) => note.trim()).filter(Boolean).join('\n') } : {}),
  };
}

function percent(success: number, total: number): string {
  if (total <= 0) return '0%';
  return `${((success / total) * 100).toFixed(1)}%`;
}

function buildRuntimes(solution: Solution, pools: GPUPoolAdminInfo[], betaRows: BetaServiceInfo[]): RuntimeFacet[] {
  const runtimes: RuntimeFacet[] = [{
    tag: `${solution.slug}-api`,
    kind: 'api',
    state: solution.available === false || solution.soon === true ? 'blocked' : 'ready',
    provider: 'Automica API',
    node: 'backend',
    sessions: 0,
    reuse: 'ready',
    source: 'catalog',
    apiUrl: solution.apiEndpoint,
  }];

  if (solution.requiresGpuPool) {
    const tag = solution.gpuServiceTag || solution.betaServiceTag || `${solution.slug}-gpu`;
    const pool = pools.find((candidate) => candidate.serviceTag === tag);
    runtimes.push({
      tag,
      kind: 'gpu',
      state: normalizePoolState(pool),
      provider: providerLabel(pool?.provider),
      node: nodeLabel(pool),
      sessions: pool?.refCount ?? pool?.sessions?.filter((session) => !session.stoppedAt).length ?? 0,
      reuse: reuseMode(pool),
      source: pool ? 'gpu-pools' : 'catalog',
      pool,
    });
  }

  betaRows.forEach((beta) => {
    if (runtimes.some((runtime) => runtime.tag === beta.tag)) return;
    const pool = pools.find((candidate) => candidate.serviceTag === beta.tag);
    const isGpu = Boolean(
      pool ||
      beta.tag.includes('gpu') ||
      beta.apiUrl.includes('/gpu') ||
      beta.registrySettings?.provider,
    );
    runtimes.push({
      tag: beta.tag,
      kind: isGpu ? 'gpu' : 'variant',
      state: pool ? normalizePoolState(pool) : (beta.isActive ? 'ready' : 'blocked'),
      provider: pool ? providerLabel(pool.provider) : betaRegistryProviderLabel(beta),
      node: pool ? nodeLabel(pool) : beta.apiUrl,
      sessions: pool?.refCount ?? pool?.sessions?.filter((session) => !session.stoppedAt).length ?? 0,
      reuse: pool ? reuseMode(pool) : 'ready',
      source: 'beta-services',
      apiUrl: beta.apiUrl,
      pool,
    });
  });

  return runtimes;
}

function deriveServiceState(solution: Solution, runtimes: RuntimeFacet[], usage?: ServiceUsageStat): ServiceState {
  if (solution.available === false || solution.soon === true) return 'blocked';
  const runtimeWorst = runtimes.reduce<ServiceState>((acc, runtime) => (
    stateWeight[runtime.state] > stateWeight[acc] ? runtime.state : acc
  ), 'ready');
  if (runtimeWorst === 'failed') return 'attention';
  if (usage && usage.failed_calls > 0 && usage.success_calls === 0) return 'attention';
  return runtimeWorst;
}

function buildServices(
  solutions: Solution[],
  pools: GPUPoolAdminInfo[],
  usageStats: ServiceUsageStat[],
  betaServices: BetaServiceInfo[]
): AIService[] {
  return solutions.map((solution) => {
    const usage = findUsage(usageStats, solution.slug);
    const betaRows = serviceBetaRows(solution, betaServices);
    const betaPolicy = betaRows.find((row) => row.servicePolicy)?.servicePolicy;
    const runtimes = buildRuntimes(solution, pools, betaRows);
    const access = [
      solution.available !== false && solution.soon !== true ? 'Public API' : '',
      solution.hasBeta || betaRows.length ? 'Beta' : '',
      solution.requiresGpuPool ? 'GPU runtime' : '',
    ].filter(Boolean).join(' + ') || 'Disabled';

    return {
      slug: solution.slug,
      name: solution.title,
      category: categoryFor(solution),
      state: deriveServiceState(solution, runtimes, usage),
      access,
      endpoint: solution.apiEndpoint,
      docs: solution.documentation,
      runCost: getServiceRunCost(solution.slug as SolutionType),
      calls: usage?.total_calls ?? 0,
      success: usage?.success_calls ?? 0,
      failed: usage?.failed_calls ?? 0,
      successRate: percent(usage?.success_calls ?? 0, usage?.total_calls ?? 0),
      creditsUsed: usage?.total_credits ?? 0,
      requiresGpu: Boolean(solution.requiresGpuPool),
      hasBeta: Boolean(solution.hasBeta || betaRows.length),
      betaServiceTag: solution.betaServiceTag,
      servicePolicy: backendPolicyToDraft(betaPolicy) ?? solution.servicePolicy,
      policySummary: summarizeServicePolicy(backendPolicyToDraft(betaPolicy) ?? solution.servicePolicy),
      runtimes,
      betaServices: betaRows,
    };
  });
}

function primaryRuntime(service: AIService): RuntimeFacet {
  return service.runtimes.find((runtime) => runtime.kind === 'gpu') ?? service.runtimes[0];
}

function reuseLabel(reuse: RuntimeFacet['reuse']): string {
  if (reuse === 'ready') return 'reuse ready';
  if (reuse === 'recoverable') return 'recoverable';
  if (reuse === 'blocked') return 'blocked';
  return 'cold start';
}

function hasRuntimeNode(runtime: RuntimeFacet, details?: RuntimeDetails): boolean {
  return Boolean(
    runtime.pool?.publicIp ||
    runtime.pool?.previousPublicIp ||
    runtime.pool?.nodeId ||
    details?.diagnostics?.publicIp ||
    details?.diagnostics?.nodeId
  );
}

function activeRuntimeJob(runtime: RuntimeFacet, details?: RuntimeDetails): GPUPoolJobInfo | undefined {
  return runtime.pool?.activeJob ?? details?.jobs?.find((job) => job.status === 'pending' || job.status === 'running') ?? details?.jobs?.[0];
}

function runtimeSummary(service: AIService, runtime: RuntimeFacet, details?: RuntimeDetails): string {
  if (runtime.kind !== 'gpu') return 'Always served by Automica API';
  if (runtime.state === 'ready') return details?.support?.canStart === false ? 'Serving, but user start is blocked' : 'Serving. Users should reuse this runtime.';
  if (runtime.state === 'provisioning') return 'Provisioning. Users attach when ready.';
  if (runtime.state === 'draining') return 'Grace stop is active. Keep running to preserve the node.';
  if (runtime.state === 'failed') return 'Provision failed. Recover or retry from this page.';
  if (runtime.reuse === 'recoverable') return 'Reusable node may exist. Recover before recreating.';
  if (service.requiresGpu) return 'GPU runtime is cold. Start runtime before user calls.';
  return 'API runtime is available.';
}

function nextActionLabel(runtime: RuntimeFacet, details?: RuntimeDetails): string {
  const job = activeRuntimeJob(runtime, details);
  if (runtime.kind !== 'gpu') return 'Open product';
  if (job?.status === 'pending' || job?.status === 'running' || runtime.state === 'provisioning') return 'Watch or abort job';
  if (runtime.state === 'ready') return 'Keep serving';
  if (runtime.state === 'draining') return 'Keep running';
  if (runtime.state === 'failed') return 'Recover runtime';
  if (runtime.reuse === 'recoverable') return 'Recover reusable node';
  return 'Start runtime';
}

function StatePill({ state }: { state: ServiceState }) {
  return <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold ${stateTone(state)}`}>{state}</span>;
}

function MiniStat({ label, value, tone = 'normal' }: { label: string; value: string; tone?: 'normal' | 'good' | 'warn' }) {
  const toneClass = tone === 'good' ? 'text-emerald-100' : tone === 'warn' ? 'text-amber-100' : 'text-gray-100';
  return (
    <div className="min-w-0 rounded-md border border-white/10 bg-white/[0.035] px-2.5 py-2">
      <div className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">{label}</div>
      <div title={value || '-'} className={`mt-1 truncate text-sm font-semibold ${toneClass}`}>{value || '-'}</div>
    </div>
  );
}

function DataRow({ label, value, tone = 'normal' }: { label: string; value: string; tone?: 'normal' | 'good' | 'warn' }) {
  const toneClass = tone === 'good' ? 'text-emerald-100' : tone === 'warn' ? 'text-amber-100' : 'text-gray-100';
  return (
    <div className="grid min-h-[34px] grid-cols-[128px_minmax(0,1fr)] items-center gap-3 border-b border-white/[0.06] py-1.5 last:border-0">
      <div className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">{label}</div>
      <div title={value || '-'} className={`truncate text-sm ${toneClass}`}>{value || '-'}</div>
    </div>
  );
}

function iconActionClass(tone: RuntimeAction['tone']): string {
  switch (tone) {
    case 'primary':
      return 'border-emerald-500/40 bg-emerald-500/12 text-emerald-100 hover:bg-emerald-500/18';
    case 'warn':
      return 'border-amber-500/40 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15';
    case 'danger':
      return 'border-red-500/40 bg-red-500/10 text-red-100 hover:bg-red-500/15';
    default:
      return 'border-white/12 bg-white/[0.04] text-gray-100 hover:bg-white/[0.08]';
  }
}

function CommandButton({ action, compact, onRun }: { action: RuntimeAction; compact?: boolean; onRun: (action: RuntimeAction) => void }) {
  const Icon = action.icon;
  return (
    <button
      type="button"
      onClick={() => onRun(action)}
      disabled={!action.enabled}
      title={action.enabled ? action.label : `${action.label}: ${action.reason || 'Unavailable'}`}
      className={`inline-flex h-9 min-w-0 items-center justify-center gap-2 rounded-md border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.025] disabled:text-gray-600 ${iconActionClass(action.tone)}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!compact && <span className="truncate">{action.label}</span>}
    </button>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-black/20">
      <div className="flex h-10 items-center justify-between gap-3 border-b border-white/10 px-3">
        <h3 className="truncate text-sm font-semibold text-white">{title}</h3>
        {action}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
    </section>
  );
}

function ServiceLedger({
  services,
  selected,
  query,
  filter,
  page,
  onQuery,
  onFilter,
  onPage,
  onSelect,
}: {
  services: AIService[];
  selected: string;
  query: string;
  filter: FilterId;
  page: number;
  onQuery: (value: string) => void;
  onFilter: (value: FilterId) => void;
  onPage: (value: number) => void;
  onSelect: (slug: string) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(services.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageServices = services.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-black/25">
      <div className="sticky top-0 z-10 shrink-0 border-b border-white/10 bg-[#0a0a0c] p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-white">AI Services</h2>
            <p className="truncate text-[11px] text-gray-500">{services.length} visible APIs</p>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" title="Previous page" onClick={() => onPage(Math.max(0, safePage - 1))} className="rounded-md border border-white/10 p-1.5 text-gray-300 disabled:opacity-30" disabled={safePage === 0}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" title="Next page" onClick={() => onPage(Math.min(pageCount - 1, safePage + 1))} className="rounded-md border border-white/10 p-1.5 text-gray-300 disabled:opacity-30" disabled={safePage >= pageCount - 1}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <label className="mt-3 flex h-9 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            value={query}
            onChange={(event) => {
              onQuery(event.target.value);
              onPage(0);
            }}
            placeholder="Search APIs"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
          />
        </label>

        <div className="mt-2 grid grid-cols-2 gap-1">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onFilter(item.id);
                onPage(0);
              }}
              className={`truncate rounded-md border px-2 py-1.5 text-[11px] font-semibold ${
                filter === item.id ? 'border-sky-400/40 bg-sky-500/10 text-sky-100' : 'border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/[0.07]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-3">
        {pageServices.map((service) => {
          const runtime = primaryRuntime(service);
          const Icon = runtimeIcon(runtime.kind);
          const kindLabel = runtime.kind === 'gpu' ? 'GPU' : runtime.kind === 'variant' ? 'Variant' : 'API';
          return (
            <button
              key={service.slug}
              type="button"
              onClick={() => onSelect(service.slug)}
              className={`grid min-h-[60px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border px-3 py-2 text-left transition ${
                selected === service.slug ? 'border-sky-400/45 bg-sky-500/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">{service.name}</span>
                <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-gray-500">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                  <span className="truncate">{service.slug} / {service.category}</span>
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">{kindLabel}</span>
                <StatePill state={service.state} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex h-9 shrink-0 items-center justify-between border-t border-white/10 px-3 text-[11px] text-gray-500">
        <span>Page {safePage + 1} of {pageCount}</span>
        <span>{PAGE_SIZE} rows</span>
      </div>
    </aside>
  );
}

function RuntimeRow({ runtime, selected, onSelect }: { runtime: RuntimeFacet; selected: boolean; onSelect: () => void }) {
  const Icon = runtimeIcon(runtime.kind);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`grid min-h-[52px] grid-cols-[minmax(0,1.4fr)_96px_minmax(96px,0.8fr)_70px_minmax(0,1fr)] items-center gap-3 rounded-md border px-3 py-2 text-left transition ${
        selected ? 'border-sky-400/45 bg-sky-500/10' : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.07]'
      }`}
    >
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-sky-200" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-white">{runtime.tag}</span>
          <span className="block truncate text-[11px] text-gray-500">{runtime.kind} / {runtime.source}</span>
        </span>
      </span>
      <StatePill state={runtime.state} />
      <span title={runtime.provider} className="truncate text-xs text-gray-300">{runtime.provider}</span>
      <span className="text-xs text-gray-300">{runtime.sessions}</span>
      <span title={runtime.apiUrl || runtime.node} className="truncate text-xs text-gray-400">{runtime.apiUrl || runtime.node}</span>
    </button>
  );
}

function buildRuntimeActions({
  runtime,
  details,
  busy,
}: {
  runtime: RuntimeFacet;
  details?: RuntimeDetails;
  busy: string | null;
}): RuntimeAction[] {
  if (runtime.kind !== 'gpu') return [];

  const busyRuntime = busy === runtime.tag;
  const state = runtime.pool?.state ?? runtime.state;
  const nodePresent = hasRuntimeNode(runtime, details);
  const latestJob = activeRuntimeJob(runtime, details);
  const hasActiveJob = latestJob?.status === 'pending' || latestJob?.status === 'running';
  const draining = state === 'draining';
  const ready = state === 'ready';
  const provisioning = state === 'provisioning';
  const failed = state === 'failed';
  const idle = state === 'idle';
  const hasPriorFailure = Boolean(runtime.pool?.lastError || runtime.pool?.lastErrorRaw);
  const baseReason = busyRuntime ? 'Action already running' : undefined;
  const canStart = !busyRuntime && !provisioning && !(ready && runtime.pool?.adminWarmHold);
  const canRecover = !busyRuntime && !provisioning && (nodePresent || failed || idle || runtime.reuse === 'recoverable');
  const canDiagnostics = !busyRuntime && (nodePresent || ready || provisioning || failed);
  const canRetry = !busyRuntime && !hasActiveJob && (failed || (idle && hasPriorFailure));
  const canAbort = !busyRuntime && (provisioning || hasActiveJob);
  const canKeep = !busyRuntime && draining;
  const canGrace = !busyRuntime && ready && nodePresent;
  const canDestroy = !busyRuntime && nodePresent;

  return [
    {
      id: 'start',
      label: 'Start runtime',
      icon: Zap,
      tone: 'primary',
      enabled: canStart,
      reason: baseReason || (provisioning ? 'Provision already running' : ready ? 'Runtime already warm' : undefined),
      run: () => apiService.warmStartGpuPool(runtime.tag),
    },
    {
      id: 'recover',
      label: 'Recover',
      icon: RefreshCw,
      tone: 'neutral',
      enabled: canRecover,
      reason: baseReason || (provisioning ? 'Provision already running' : 'No reusable node or failure to recover'),
      run: () => apiService.recoverGpuPool(runtime.tag),
    },
    {
      id: 'diagnostics',
      label: 'Diagnostics',
      icon: Gauge,
      tone: 'neutral',
      enabled: canDiagnostics,
      reason: baseReason || 'No node, active job, or failure to inspect',
      run: () => apiService.runGpuPoolDiagnostics(runtime.tag),
    },
    {
      id: 'retry',
      label: 'Retry',
      icon: Wrench,
      tone: 'warn',
      enabled: canRetry,
      reason: baseReason || (hasActiveJob ? 'A provision job is active' : 'Retry applies after failed provision'),
      confirm: true,
      run: () => apiService.retryGpuPoolProvision(runtime.tag),
    },
    {
      id: 'abort',
      label: 'Abort',
      icon: Square,
      tone: 'warn',
      enabled: canAbort,
      reason: baseReason || 'No active provision job',
      confirm: true,
      run: () => apiService.abortGpuPoolProvision(runtime.tag),
    },
    draining ? {
      id: 'keep',
      label: 'Keep running',
      icon: ShieldCheck,
      tone: 'primary',
      enabled: canKeep,
      reason: baseReason || 'Runtime is not in grace shutdown',
      run: () => apiService.cancelGpuPoolGrace(runtime.tag),
    } : {
      id: 'grace',
      label: 'Grace stop',
      icon: Power,
      tone: 'danger',
      enabled: canGrace,
      reason: baseReason || (!nodePresent ? 'No node to stop' : 'Runtime is not ready'),
      confirm: true,
      run: () => apiService.shutdownGpuPool(runtime.tag, false),
    },
    {
      id: 'destroy',
      label: 'Destroy now',
      icon: Trash2,
      tone: 'danger',
      enabled: canDestroy,
      reason: baseReason || 'No node to destroy',
      confirm: true,
      run: () => apiService.shutdownGpuPool(runtime.tag, true),
    },
  ];
}

function CommandStrip({
  service,
  runtime,
  details,
  busy,
  onAction,
  onDrawer,
}: {
  service: AIService;
  runtime: RuntimeFacet;
  details?: RuntimeDetails;
  busy: string | null;
  onAction: (action: RuntimeAction) => void;
  onDrawer: (drawer: DrawerId) => void;
}) {
  const actions = buildRuntimeActions({ runtime, details, busy });
  const primary = actions.find((action) => action.enabled && ['start', 'recover', 'keep'].includes(action.id)) ?? actions[0];
  const secondary = actions.filter((action) => action.id !== primary?.id && action.id !== 'destroy').slice(0, 4);
  const destroy = actions.find((action) => action.id === 'destroy');

  return (
    <div className="flex min-h-[48px] shrink-0 items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/25 px-3 py-2">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          {runtime.state === 'ready' ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" /> : <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300" />}
          <span className="truncate text-sm font-semibold text-white">{nextActionLabel(runtime, details)}</span>
        </div>
        <p className="mt-0.5 truncate text-[11px] text-gray-500">{runtimeSummary(service, runtime, details)}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {runtime.kind === 'gpu' && primary && <CommandButton action={primary} onRun={onAction} />}
        {runtime.kind === 'gpu' && secondary.map((action) => (
          <CommandButton key={action.id} action={action} compact onRun={onAction} />
        ))}
        {runtime.kind === 'gpu' && (
          <button
            type="button"
            title="Open support details"
            onClick={() => onDrawer('support')}
            className="inline-flex h-9 items-center justify-center rounded-md border border-white/12 bg-white/[0.04] px-3 text-xs font-semibold text-gray-100 hover:bg-white/[0.08]"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
        {runtime.kind === 'gpu' && destroy && <CommandButton action={destroy} compact onRun={onAction} />}
        {runtime.kind !== 'gpu' && (
          <a href={`/services/${encodeURIComponent(service.slug)}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-100">
            <Play className="h-4 w-4" />
            Product
          </a>
        )}
      </div>
    </div>
  );
}

function numberValue(value?: number | null): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}

function numberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatFormats(value?: string[]): string {
  return value?.join(', ') || '';
}

function parseFormats(value: string): string[] {
  return value.split(',').map((entry) => entry.trim().toUpperCase()).filter(Boolean);
}

function policyDraftFromService(policy?: ServicePolicy): ServicePolicy {
  return {
    source: policy?.source || 'catalog',
    editable: true,
    pricingMode: policy?.pricingMode || 'hybrid',
    maxUploadSizeMB: policy?.maxUploadSizeMB ?? null,
    maxPages: policy?.maxPages ?? null,
    maxFiles: policy?.maxFiles ?? null,
    allowedFormats: policy?.allowedFormats ? [...policy.allowedFormats] : [],
    creditsPerHit: policy?.creditsPerHit ?? null,
    creditsPerPage: policy?.creditsPerPage ?? null,
    sessionStartCredits: policy?.sessionStartCredits ?? null,
    creditsPerMinute: policy?.creditsPerMinute ?? null,
    limits: (policy?.limits || []).map((row) => ({ ...row })),
    pricing: (policy?.pricing || []).map((row) => ({ ...row })),
    notes: policy?.notes ? [...policy.notes] : [],
  };
}

function PolicyEditor({
  service,
  runtime,
  onSaved,
}: {
  service: AIService;
  runtime: RuntimeFacet;
  onSaved?: () => void | Promise<void>;
}) {
  const initialPolicy = useMemo(() => policyDraftFromService(service.servicePolicy), [service.servicePolicy]);
  const [draft, setDraft] = useState<ServicePolicy>(initialPolicy);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(initialPolicy);
    setSavedAt(null);
    setSaveError(null);
  }, [initialPolicy, service.slug]);

  const livePolicy = useMemo(() => materializeServicePolicy(draft), [draft]);

  const setLimit = (index: number, patch: Partial<ServicePolicyLimit>) => {
    setDraft((current) => ({
      ...current,
      limits: (current.limits || []).map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    }));
  };

  const setPricing = (index: number, patch: Partial<ServicePolicyPricing>) => {
    setDraft((current) => ({
      ...current,
      pricing: (current.pricing || []).map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    }));
  };

  const saveDraft = async () => {
    setIsSaving(true);
    setSaveError(null);

    const policy = {
      ...draft,
      source: 'override' as const,
      editable: true,
      maxUploadSizeMB: draft.maxUploadSizeMB ?? null,
      maxPages: draft.maxPages ?? null,
      maxFiles: draft.maxFiles ?? null,
      allowedFormats: draft.allowedFormats?.map((entry) => entry.trim()).filter(Boolean),
      creditsPerHit: draft.creditsPerHit ?? null,
      creditsPerPage: draft.creditsPerPage ?? null,
      sessionStartCredits: draft.sessionStartCredits ?? null,
      creditsPerMinute: draft.creditsPerMinute ?? null,
      limits: draft.limits?.filter((row) => row.label.trim() || row.value.trim()),
      pricing: draft.pricing?.filter((row) => row.label.trim() || row.value.trim()),
      notes: draft.notes?.map((note) => note.trim()).filter(Boolean),
    };

    const backendPolicy = draftToBackendPolicy(policy);
    const betaService = service.betaServices[0];
    const serviceTag = betaService?.tag || service.betaServiceTag || service.slug;

    try {
      if (betaService) {
        await apiService.updateBetaService(
          betaService.tag,
          backendPolicy ? { servicePolicy: backendPolicy } : {}
        );
      } else {
        const payload = {
          tag: serviceTag,
          serviceName: service.slug,
          label: service.name,
          apiUrl: service.endpoint,
          isActive: true,
          ...(backendPolicy ? { servicePolicy: backendPolicy } : {}),
        };
        await apiService.createBetaService(payload);
      }
      saveSolutionPolicyOverride(service.slug as SolutionKey, policy);
      await onSaved?.();
      setSavedAt(new Date().toISOString());
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save policy');
    } finally {
      setIsSaving(false);
    }
  };

  const resetDraft = () => {
    clearSolutionPolicyOverride(service.slug as SolutionKey);
    setDraft(initialPolicy);
    setSavedAt(null);
  };

  const rows = {
    limits: draft.limits || [],
    pricing: draft.pricing || [],
    notes: draft.notes || [],
  };

  return (
    <div className="grid h-full min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Section
        title="Policy editor"
        action={(
          <div className="flex items-center gap-2">
            <button type="button" onClick={resetDraft} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 text-[11px] font-semibold text-gray-100 hover:bg-white/[0.08]">
              <RefreshCw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button type="button" onClick={() => { void saveDraft(); }} disabled={isSaving} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60">
              <Save className="h-3.5 w-3.5" />
              {isSaving ? 'Saving...' : 'Save draft'}
            </button>
          </div>
        )}
      >
        <div className="grid gap-3">
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-[11px] font-semibold text-gray-200">
                {draft.source || 'catalog'}
              </span>
              <span className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-[11px] font-semibold text-gray-200">
                {draft.pricingMode || 'hybrid'}
              </span>
              <span className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-[11px] font-semibold text-gray-200">
                {draft.editable === false ? 'locked' : 'editable'}
              </span>
              <span className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-[11px] font-semibold text-gray-200">
                {summarizeServicePolicy(livePolicy)}
              </span>
            </div>
            {saveError && <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{saveError}</div>}
            {savedAt && <div className="mt-3 text-xs text-emerald-200">Saved at {new Date(savedAt).toLocaleString()}</div>}
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Core limits</p>
                <span className="text-[11px] text-gray-500">Used by Try API and admin readout</span>
              </div>
              <div className="mt-3 grid gap-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-[11px] uppercase tracking-wide text-gray-500">Max upload size (MB)</span>
                    <input
                      type="number"
                      min="0"
                      value={numberValue(draft.maxUploadSizeMB)}
                      onChange={(event) => setDraft((current) => ({ ...current, maxUploadSizeMB: numberOrNull(event.target.value) }))}
                      placeholder="Optional"
                      className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none placeholder:text-gray-600"
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-[11px] uppercase tracking-wide text-gray-500">Max pages</span>
                    <input
                      type="number"
                      min="0"
                      value={numberValue(draft.maxPages)}
                      onChange={(event) => setDraft((current) => ({ ...current, maxPages: numberOrNull(event.target.value) }))}
                      placeholder="Optional"
                      className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none placeholder:text-gray-600"
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-[11px] uppercase tracking-wide text-gray-500">Max files</span>
                    <input
                      type="number"
                      min="0"
                      value={numberValue(draft.maxFiles)}
                      onChange={(event) => setDraft((current) => ({ ...current, maxFiles: numberOrNull(event.target.value) }))}
                      placeholder="Optional"
                      className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none placeholder:text-gray-600"
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-[11px] uppercase tracking-wide text-gray-500">Allowed formats</span>
                    <input
                      value={formatFormats(draft.allowedFormats)}
                      onChange={(event) => setDraft((current) => ({ ...current, allowedFormats: parseFormats(event.target.value) }))}
                      placeholder="PDF, JPG, PNG, JPEG"
                      className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none placeholder:text-gray-600"
                    />
                  </label>
                </div>
                <div className="grid gap-2 rounded-md border border-white/10 bg-black/20 p-2.5 text-xs text-gray-300">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Readout</p>
                  <div className="grid gap-1 sm:grid-cols-2">
                    <DataRow label="Upload size" value={draft.maxUploadSizeMB != null ? `${draft.maxUploadSizeMB} MB` : 'unbounded'} />
                    <DataRow label="Page count" value={draft.maxPages != null ? `${draft.maxPages} pages` : 'open'} />
                    <DataRow label="File count" value={draft.maxFiles != null ? `${draft.maxFiles} file${draft.maxFiles === 1 ? '' : 's'}` : 'open'} />
                    <DataRow label="Formats" value={draft.allowedFormats?.length ? draft.allowedFormats.join(', ') : 'open'} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Credits and billing</p>
                <span className="text-[11px] text-gray-500">Session or per-hit pricing</span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-[11px] uppercase tracking-wide text-gray-500">Pricing mode</span>
                  <select
                    value={draft.pricingMode || 'hybrid'}
                    onChange={(event) => setDraft((current) => ({ ...current, pricingMode: event.target.value as ServicePolicy['pricingMode'] }))}
                    className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none"
                  >
                    <option value="per_hit">Per hit</option>
                    <option value="per_page">Per page</option>
                    <option value="session">Session</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-[11px] uppercase tracking-wide text-gray-500">API hit credits</span>
                  <input
                    type="number"
                    min="0"
                    value={numberValue(draft.creditsPerHit)}
                    onChange={(event) => setDraft((current) => ({ ...current, creditsPerHit: numberOrNull(event.target.value) }))}
                    placeholder="Optional"
                    className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none placeholder:text-gray-600"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[11px] uppercase tracking-wide text-gray-500">Per page</span>
                  <input
                    type="number"
                    min="0"
                    value={numberValue(draft.creditsPerPage)}
                    onChange={(event) => setDraft((current) => ({ ...current, creditsPerPage: numberOrNull(event.target.value) }))}
                    placeholder="Optional"
                    className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none placeholder:text-gray-600"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[11px] uppercase tracking-wide text-gray-500">Session start</span>
                  <input
                    type="number"
                    min="0"
                    value={numberValue(draft.sessionStartCredits)}
                    onChange={(event) => setDraft((current) => ({ ...current, sessionStartCredits: numberOrNull(event.target.value) }))}
                    placeholder="Optional"
                    className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none placeholder:text-gray-600"
                  />
                </label>
                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-[11px] uppercase tracking-wide text-gray-500">Runtime credits per minute</span>
                  <input
                    type="number"
                    min="0"
                    value={numberValue(draft.creditsPerMinute)}
                    onChange={(event) => setDraft((current) => ({ ...current, creditsPerMinute: numberOrNull(event.target.value) }))}
                    placeholder="Optional"
                    className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none placeholder:text-gray-600"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Extra limits</p>
                <button type="button" onClick={() => setDraft((current) => ({ ...current, limits: [...(current.limits || []), { key: '', label: '', value: '' }] }))} className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[11px] text-gray-200 hover:bg-white/[0.06]">
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {rows.limits.length === 0 && <p className="text-xs text-gray-500">No custom limit rows yet.</p>}
                {rows.limits.map((row, index) => (
                  <div key={`limit-${index}`} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2">
                    <input
                      value={row.key || ''}
                      onChange={(event) => setLimit(index, { key: event.target.value })}
                      placeholder="Key"
                      className="min-w-0 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white outline-none placeholder:text-gray-600"
                    />
                    <input
                      value={row.label}
                      onChange={(event) => setLimit(index, { label: event.target.value })}
                      placeholder="Label"
                      className="min-w-0 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white outline-none placeholder:text-gray-600"
                    />
                    <input
                      value={row.value}
                      onChange={(event) => setLimit(index, { value: event.target.value })}
                      placeholder="Value"
                      className="min-w-0 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white outline-none placeholder:text-gray-600"
                    />
                    <button type="button" onClick={() => setDraft((current) => ({ ...current, limits: (current.limits || []).filter((_, rowIndex) => rowIndex !== index) }))} className="rounded-md border border-white/10 px-2 text-xs text-gray-300 hover:bg-white/[0.06]">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Extra pricing</p>
                <button type="button" onClick={() => setDraft((current) => ({ ...current, pricing: [...(current.pricing || []), { key: '', label: '', value: '' }] }))} className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[11px] text-gray-200 hover:bg-white/[0.06]">
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {rows.pricing.length === 0 && <p className="text-xs text-gray-500">No custom credit rows yet.</p>}
                {rows.pricing.map((row, index) => (
                  <div key={`pricing-${index}`} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2">
                    <input
                      value={row.key || ''}
                      onChange={(event) => setPricing(index, { key: event.target.value })}
                      placeholder="Key"
                      className="min-w-0 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white outline-none placeholder:text-gray-600"
                    />
                    <input
                      value={row.label}
                      onChange={(event) => setPricing(index, { label: event.target.value })}
                      placeholder="Label"
                      className="min-w-0 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white outline-none placeholder:text-gray-600"
                    />
                    <input
                      value={row.value}
                      onChange={(event) => setPricing(index, { value: event.target.value })}
                      placeholder="Value"
                      className="min-w-0 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white outline-none placeholder:text-gray-600"
                    />
                    <button type="button" onClick={() => setDraft((current) => ({ ...current, pricing: (current.pricing || []).filter((_, rowIndex) => rowIndex !== index) }))} className="rounded-md border border-white/10 px-2 text-xs text-gray-300 hover:bg-white/[0.06]">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Notes</p>
              <button type="button" onClick={() => setDraft((current) => ({ ...current, notes: [...(current.notes || []), ''] }))} className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[11px] text-gray-200 hover:bg-white/[0.06]">
                <Plus className="h-3.5 w-3.5" />
                Add note
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {rows.notes.length === 0 && <p className="text-xs text-gray-500">No notes yet.</p>}
              {rows.notes.map((note, index) => (
                <div key={`note-${index}`} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <input
                    value={note}
                    onChange={(event) => setDraft((current) => ({
                      ...current,
                      notes: (current.notes || []).map((row, rowIndex) => (rowIndex === index ? event.target.value : row)),
                    }))}
                    placeholder="Policy note"
                    className="min-w-0 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white outline-none placeholder:text-gray-600"
                  />
                  <button type="button" onClick={() => setDraft((current) => ({ ...current, notes: (current.notes || []).filter((_, rowIndex) => rowIndex !== index) }))} className="rounded-md border border-white/10 px-2 text-xs text-gray-300 hover:bg-white/[0.06]">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Readout">
        <div className="grid gap-3">
          <div className="rounded-md border border-white/10 bg-black/20 p-3">
            <div className="grid gap-1">
              <DataRow label="Policy source" value={draft.source || 'catalog'} />
              <DataRow label="Pricing mode" value={draft.pricingMode || 'hybrid'} />
              <DataRow label="Editable" value={draft.editable === false ? 'no' : 'yes'} tone={draft.editable === false ? 'warn' : 'good'} />
              <DataRow label="Limits" value={String(livePolicy?.limits?.length || 0)} />
              <DataRow label="Credits" value={String(livePolicy?.pricing?.length || 0)} />
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-black/20 p-3">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">Live preview</p>
            <p className="mt-2 text-sm text-gray-200">{summarizeServicePolicy(livePolicy)}</p>
            <div className="mt-3 grid gap-2">
              <div className="grid gap-1 rounded-md border border-white/10 bg-white/[0.03] p-2.5 text-xs text-gray-300">
                <DataRow label="Upload size" value={draft.maxUploadSizeMB != null ? `${draft.maxUploadSizeMB} MB` : 'unset'} />
                <DataRow label="Page count" value={draft.maxPages != null ? `${draft.maxPages} pages` : 'unset'} />
                <DataRow label="File count" value={draft.maxFiles != null ? `${draft.maxFiles} file${draft.maxFiles === 1 ? '' : 's'}` : 'unset'} />
                <DataRow label="Formats" value={draft.allowedFormats?.length ? draft.allowedFormats.join(', ') : 'unset'} />
              </div>
              <div className="grid gap-1 rounded-md border border-white/10 bg-white/[0.03] p-2.5 text-xs text-gray-300">
                <DataRow label="API hit" value={draft.creditsPerHit != null ? `${draft.creditsPerHit} credits` : 'unset'} />
                <DataRow label="Per page" value={draft.creditsPerPage != null ? `${draft.creditsPerPage} credits / page` : 'unset'} />
                <DataRow label="Session start" value={draft.sessionStartCredits != null ? `${draft.sessionStartCredits} credits` : 'unset'} />
                <DataRow label="Runtime" value={draft.creditsPerMinute != null ? `${draft.creditsPerMinute} credits / minute` : 'unset'} />
              </div>
              {livePolicy?.notes?.length ? (
                <div className="rounded-md border border-white/10 bg-white/[0.03] p-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">Notes</p>
                  <div className="mt-2 space-y-1 text-xs text-gray-200">
                    {livePolicy.notes.map((note) => (
                      <p key={note} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300/70" />
                        <span>{note}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            {savedAt && <p className="mt-2 text-xs text-emerald-200">Draft saved locally at {new Date(savedAt).toLocaleTimeString()}.</p>}
          </div>

          {runtime.pool?.policySummary && (
            <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-3">
              <p className="text-[11px] uppercase tracking-wide text-amber-200/80">Runtime policy</p>
              <p className="mt-2 text-sm text-amber-50/90">{runtime.pool.policySummary}</p>
              <a
                href={`/admin/gpu-pools?tag=${encodeURIComponent(runtime.tag)}&tab=policy`}
                className="mt-3 inline-flex items-center gap-2 rounded-md border border-amber-400/20 bg-black/20 px-3 py-2 text-xs font-semibold text-amber-100 hover:bg-black/30"
              >
                Open GPU policy
              </a>
            </div>
          )}

          <p className="text-xs text-gray-500">
            Drafts stay in this browser and mirror into Try API views that use the same catalog override.
          </p>
        </div>
      </Section>
    </div>
  );
}

function ServiceWorkspace({
  service,
  runtime,
  details,
  activeTab,
  busy,
  loadingDetails,
  onTab,
  onRuntimeSelect,
  onRefreshDetails,
  onAction,
  onDrawer,
  onOpenServices,
  onPolicySaved,
}: {
  service: AIService;
  runtime: RuntimeFacet;
  details?: RuntimeDetails;
  activeTab: DetailTab;
  busy: string | null;
  loadingDetails: boolean;
  onTab: (tab: DetailTab) => void;
  onRuntimeSelect: (tag: string) => void;
  onRefreshDetails: () => void;
  onAction: (action: RuntimeAction) => void;
  onDrawer: (drawer: DrawerId) => void;
  onOpenServices: () => void;
  onPolicySaved: () => void | Promise<void>;
}) {
  const diag = details?.diagnostics;
  const support = details?.support;
  const latestJob = activeRuntimeJob(runtime, details);
  const nodePresent = hasRuntimeNode(runtime, details);
  const tabs = DETAIL_TABS.filter((tab) => runtime.kind === 'gpu' || !['runtime', 'recovery'].includes(tab.id));

  return (
    <main className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-black/20">
      <div className="shrink-0 border-b border-white/10 p-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-xl font-semibold text-white">{service.name}</h1>
              <StatePill state={service.state} />
            </div>
            <p className="mt-1 truncate text-xs text-gray-500">{service.slug} / {service.category} / {service.access}</p>
          </div>
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={onOpenServices}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-2 text-[11px] font-semibold text-gray-200 hover:bg-white/5 lg:hidden"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Services
            </button>
            <a href={`/services/${encodeURIComponent(service.slug)}`} title="Open product" className="rounded-md border border-white/10 p-2 text-gray-300 hover:bg-white/5 hover:text-white">
              <ExternalLink className="h-4 w-4" />
            </a>
            <a href={service.docs} title="Open docs" className="rounded-md border border-white/10 p-2 text-gray-300 hover:bg-white/5 hover:text-white">
              <FileText className="h-4 w-4" />
            </a>
            <button type="button" onClick={onRefreshDetails} disabled={runtime.kind !== 'gpu' || loadingDetails} title="Refresh runtime facts" className="rounded-md border border-white/10 p-2 text-gray-300 disabled:opacity-40">
              {loadingDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
          <MiniStat label="Runtime" value={`${runtime.tag} / ${runtime.state}`} tone={runtime.state === 'ready' ? 'good' : 'warn'} />
          <MiniStat label="Provider" value={runtime.provider} />
          <MiniStat label="Sessions" value={String(runtime.sessions)} />
          <MiniStat label="Cost" value={`${service.runCost} credits/run`} />
        </div>

        <div className="mt-3">
          <CommandStrip service={service} runtime={runtime} details={details} busy={busy} onAction={onAction} onDrawer={onDrawer} />
        </div>
      </div>

      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 bg-black/15 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTab(tab.id)}
              className={`inline-flex min-w-[96px] flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition ${
                activeTab === tab.id ? 'bg-white/12 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-3">
        {activeTab === 'overview' && (
          <div className="grid h-full min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
            <Section title="Service status">
              <div className="grid gap-1">
                <DataRow label="API state" value={service.state} tone={service.state === 'ready' ? 'good' : 'warn'} />
                <DataRow label="User start" value={support ? (support.canStart ? 'available' : 'blocked') : (runtime.kind === 'gpu' ? 'unknown' : 'available')} tone={support?.canStart || runtime.kind !== 'gpu' ? 'good' : 'warn'} />
                <DataRow label="Next action" value={nextActionLabel(runtime, details)} />
                <DataRow label="Endpoint" value={service.endpoint} />
                <DataRow label="Access" value={service.access} />
                <DataRow label="Policy" value={service.policySummary} />
                <DataRow label="Last issue" value={runtime.pool?.lastError || support?.userFacingError || 'none'} tone={runtime.pool?.lastError || support?.userFacingError ? 'warn' : 'normal'} />
              </div>
            </Section>

            <Section title="Runtime summary">
              <div className="grid gap-1">
                <DataRow label="Facet" value={`${runtime.tag} / ${runtime.kind}`} />
                <DataRow label="State" value={runtime.state} tone={runtime.state === 'ready' ? 'good' : 'warn'} />
                <DataRow label="Provider" value={runtime.provider} />
                <DataRow label="Node / IP" value={runtime.apiUrl || runtime.node} tone={nodePresent ? 'good' : 'normal'} />
                <DataRow label="Reuse" value={reuseLabel(runtime.reuse)} tone={runtime.reuse === 'ready' ? 'good' : runtime.reuse === 'blocked' ? 'warn' : 'normal'} />
                <DataRow label="Job" value={latestJob ? `${latestJob.type} / ${latestJob.status}` : 'none'} tone={latestJob?.status === 'failed' ? 'warn' : 'normal'} />
              </div>
            </Section>
          </div>
        )}

        {activeTab === 'policy' && (
          <PolicyEditor service={service} runtime={runtime} onSaved={onPolicySaved} />
        )}

        {activeTab === 'runtime' && (
          <div className="grid h-full min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
            <Section title="Runtime facets">
              <div className="grid gap-2">
                <div className="hidden grid-cols-[minmax(0,1.4fr)_96px_minmax(96px,0.8fr)_70px_minmax(0,1fr)] gap-3 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 md:grid">
                  <span>Runtime</span>
                  <span>State</span>
                  <span>Provider</span>
                  <span>Users</span>
                  <span>Node</span>
                </div>
                {service.runtimes.map((item) => (
                  <RuntimeRow key={item.tag} runtime={item} selected={item.tag === runtime.tag} onSelect={() => onRuntimeSelect(item.tag)} />
                ))}
              </div>
            </Section>

            <Section title="Selected facet">
              <div className="grid gap-1">
                <DataRow label="Owner" value={runtime.pool?.nodeOwner || '-'} />
                <DataRow label="Warm hold" value={runtime.pool?.adminWarmHold ? 'enabled' : 'off'} tone={runtime.pool?.adminWarmHold ? 'good' : 'normal'} />
                <DataRow label="Ready at" value={runtime.pool?.readyAt || '-'} />
                <DataRow label="Updated" value={runtime.pool?.updatedAt || '-'} />
                <DataRow label="Policy" value={runtime.pool?.policySummary || diag?.policySummary || '-'} />
              </div>
            </Section>
          </div>
        )}

        {activeTab === 'recovery' && (
          <div className="grid h-full min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
            <Section
              title="Diagnostics"
              action={(
                <button type="button" onClick={() => onDrawer('logs')} className="text-xs font-semibold text-sky-200 hover:text-sky-100">
                  View logs
                </button>
              )}
            >
              <div className="grid gap-1">
                <DataRow label="Node live" value={diag ? (diag.nodeLive ? 'yes' : 'no') : 'not probed'} tone={diag?.nodeLive ? 'good' : 'normal'} />
                <DataRow label="Gateway" value={diag ? (diag.gatewayHealth ? 'healthy' : 'unreachable') : 'not probed'} tone={diag?.gatewayHealth ? 'good' : 'normal'} />
                <DataRow label="Provider nodes" value={String(diag?.providerNodeCount ?? '-')} />
                <DataRow label="User error" value={support?.userFacingError || runtime.pool?.lastError || 'none'} tone={support?.userFacingError || runtime.pool?.lastError ? 'warn' : 'normal'} />
                <DataRow label="Raw error" value={support?.lastErrorRaw || runtime.pool?.lastErrorRaw || 'none'} />
              </div>
            </Section>

            <Section title="Current job">
              <div className="grid gap-1">
                <DataRow label="Status" value={latestJob ? latestJob.status : 'none'} tone={latestJob?.status === 'failed' ? 'warn' : 'normal'} />
                <DataRow label="Type" value={latestJob?.type || '-'} />
                <DataRow label="Attempts" value={latestJob ? `${latestJob.attempts}/${latestJob.maxAttempts}` : '-'} />
                <DataRow label="Started" value={latestJob?.startedAt || '-'} />
                <DataRow label="Last error" value={latestJob?.lastError || 'none'} tone={latestJob?.lastError ? 'warn' : 'normal'} />
              </div>
            </Section>
          </div>
        )}

        {activeTab === 'access' && (
          <div className="grid h-full min-h-0 gap-3 xl:grid-cols-2">
            <Section title="API access">
              <div className="grid gap-1">
                <DataRow label="Model" value={service.access} />
                <DataRow label="Endpoint" value={service.endpoint} />
                <DataRow label="Docs" value={service.docs} />
                <DataRow label="Public API" value={service.state === 'blocked' ? 'blocked' : 'enabled'} tone={service.state === 'blocked' ? 'warn' : 'good'} />
                <DataRow label="Run cost" value={`${service.runCost} credits`} />
                <DataRow label="Policy" value={service.policySummary} />
              </div>
            </Section>

            <Section title="Facets">
              <div className="grid gap-2">
                {service.betaServices.length === 0 && <div className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-gray-400">No beta facets registered.</div>}
                {service.betaServices.map((beta) => (
                  <div key={beta.tag} className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-white">{beta.label || beta.tag}</span>
                      <StatePill state={beta.isActive ? 'ready' : 'blocked'} />
                    </div>
                    <div title={beta.apiUrl} className="mt-1 truncate text-xs text-gray-500">{beta.tag} / {beta.apiUrl}</div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="grid h-full min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
            <Section title="Usage health">
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <MiniStat label="Calls" value={String(service.calls)} />
                <MiniStat label="Success" value={String(service.success)} tone="good" />
                <MiniStat label="Failed" value={String(service.failed)} tone={service.failed ? 'warn' : 'normal'} />
                <MiniStat label="Credits" value={String(service.creditsUsed)} />
              </div>
              <div className="mt-3 grid gap-1">
                <DataRow label="Success rate" value={service.successRate} tone={service.failed ? 'warn' : 'good'} />
                <DataRow label="Run cost" value={`${service.runCost} credits/run`} />
                <DataRow label="Billing" value="Product run billing plus runtime metering where applicable" />
              </div>
            </Section>

            <Section title="Links">
              <div className="grid gap-2">
                <a href={`/admin/services?service=${encodeURIComponent(service.slug)}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/12 bg-white/[0.04] px-3 text-xs font-semibold text-gray-100 hover:bg-white/[0.08]">
                  <Activity className="h-4 w-4" />
                  Usage analytics
                </a>
                <a href={`/services/${encodeURIComponent(service.slug)}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/12 bg-white/[0.04] px-3 text-xs font-semibold text-gray-100 hover:bg-white/[0.08]">
                  <Play className="h-4 w-4" />
                  Product page
                </a>
                <a href={service.docs} className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/12 bg-white/[0.04] px-3 text-xs font-semibold text-gray-100 hover:bg-white/[0.08]">
                  <FileText className="h-4 w-4" />
                  Docs
                </a>
              </div>
            </Section>
          </div>
        )}
      </div>
    </main>
  );
}

function DetailDrawer({
  drawer,
  runtime,
  details,
  onClose,
}: {
  drawer: DrawerId;
  runtime: RuntimeFacet;
  details?: RuntimeDetails;
  onClose: () => void;
}) {
  if (!drawer) return null;

  const lines = drawer === 'logs'
    ? details?.logLines || ['No log lines loaded yet.']
    : [
      `serviceTag=${runtime.tag}`,
      `state=${runtime.state}`,
      `provider=${runtime.provider}`,
      `node=${runtime.apiUrl || runtime.node}`,
      `sessions=${runtime.sessions}`,
      `support.canStart=${details?.support ? String(details.support.canStart) : 'unknown'}`,
      `support.maintenance=${details?.support ? String(details.support.maintenanceBlock) : 'unknown'}`,
      `lastError=${details?.support?.userFacingError || runtime.pool?.lastError || 'none'}`,
      `raw=${details?.support?.lastErrorRaw || runtime.pool?.lastErrorRaw || 'none'}`,
    ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45">
      <div className="flex h-full w-full max-w-[460px] flex-col border-l border-white/10 bg-[#0b0b0d] shadow-2xl">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">{drawer === 'logs' ? 'Runtime logs' : 'Support view'}</h3>
            <p className="truncate text-[11px] text-gray-500">{runtime.tag}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md border border-white/10 p-1.5 text-gray-300 hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="grid gap-1.5">
            {lines.slice(-80).map((line, index) => (
              <div key={`${drawer}-${index}`} title={line} className="rounded border border-white/10 bg-black/35 px-2 py-1.5 font-mono text-[11px] leading-4 text-gray-300">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  pending,
  busy,
  onCancel,
  onConfirm,
}: {
  pending: PendingConfirm | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!pending) return null;
  const Icon = pending.action.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-[#0b0b0d] p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className={`rounded-md border p-2 ${pending.action.tone === 'danger' ? 'border-red-500/40 bg-red-500/10 text-red-100' : 'border-amber-500/40 bg-amber-500/10 text-amber-100'}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-white">{pending.action.label}</h3>
            <p className="mt-1 text-sm text-gray-400">Confirm this action for {pending.serviceTag}. The current node is {pending.node || 'not recorded'}.</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={busy} className="h-9 rounded-md border border-white/10 px-3 text-xs font-semibold text-gray-200 hover:bg-white/5 disabled:opacity-40">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className={`h-9 rounded-md border px-3 text-xs font-semibold disabled:opacity-40 ${iconActionClass(pending.action.tone)}`}>
            {busy ? 'Running...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AIServiceAdminPreview() {
  const [catalog, setCatalog] = useState<Solution[]>(() => getAvailableSolutions());
  const [selectedSlug, setSelectedSlug] = useState('ocr');
  const [selectedRuntimeTag, setSelectedRuntimeTag] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');
  const [mobilePane, setMobilePane] = useState<MobilePane>('services');
  const [page, setPage] = useState(0);
  const [pools, setPools] = useState<GPUPoolAdminInfo[]>([]);
  const [billing, setBilling] = useState<GPUPoolBillingInfo | null>(null);
  const [usageStats, setUsageStats] = useState<ServiceUsageStat[]>([]);
  const [betaServices, setBetaServices] = useState<BetaServiceInfo[]>([]);
  const [loadedSources, setLoadedSources] = useState<LoadSource[]>(['catalog']);
  const [runtimeDetails, setRuntimeDetails] = useState<Record<string, RuntimeDetails>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);

  useEffect(() => {
    const refreshCatalog = () => setCatalog(getAvailableSolutions());
    refreshCatalog();
    window.addEventListener('automica-solution-policy-changed', refreshCatalog as EventListener);
    window.addEventListener('storage', refreshCatalog);
    return () => {
      window.removeEventListener('automica-solution-policy-changed', refreshCatalog as EventListener);
      window.removeEventListener('storage', refreshCatalog);
    };
  }, []);

  const services = useMemo(
    () => buildServices(catalog, pools, usageStats, betaServices),
    [catalog, pools, usageStats, betaServices]
  );

  const visibleServices = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return services.filter((service) => {
      const textMatch = !needle || (
        service.name.toLowerCase().includes(needle) ||
        service.slug.toLowerCase().includes(needle) ||
        service.category.toLowerCase().includes(needle)
      );
      if (!textMatch) return false;
      if (filter === 'attention') return service.state !== 'ready';
      if (filter === 'gpu') return service.requiresGpu;
      if (filter === 'beta') return service.hasBeta;
      if (filter === 'public') return service.access.includes('Public API');
      return true;
    });
  }, [filter, query, services]);

  const selected = useMemo(
    () => services.find((service) => service.slug === selectedSlug) ?? services[0],
    [services, selectedSlug]
  );

  const selectedRuntime = useMemo(() => {
    if (!selected) return undefined;
    return selected.runtimes.find((runtime) => runtime.tag === selectedRuntimeTag) ?? primaryRuntime(selected);
  }, [selected, selectedRuntimeTag]);

  const fleet = useMemo(() => ({
    total: services.length,
    ready: services.filter((service) => service.state === 'ready').length,
    attention: services.filter((service) => service.state !== 'ready').length,
    gpu: services.filter((service) => service.requiresGpu).length,
    sessions: services.reduce((sum, service) => sum + service.runtimes.reduce((inner, runtime) => inner + runtime.sessions, 0), 0),
    calls: services.reduce((sum, service) => sum + service.calls, 0),
  }), [services]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loaded = new Set<LoadSource>(['catalog']);
      const [poolRes, usageRes, betaRes] = await Promise.allSettled([
        apiService.listGpuPools(),
        apiService.getGlobalUsageStats(),
        apiService.listBetaServices(undefined, false),
      ]);

      if (poolRes.status === 'fulfilled') {
        setPools(poolRes.value.pools || []);
        setBilling(poolRes.value.billing || null);
        loaded.add('gpu-pools');
      } else {
        setPools([]);
      }

      if (usageRes.status === 'fulfilled') {
        setUsageStats(usageRes.value.stats || []);
        loaded.add('usage');
      } else {
        setUsageStats([]);
      }

      if (betaRes.status === 'fulfilled') {
        setBetaServices(betaRes.value.services || []);
        loaded.add('beta-services');
      } else {
        setBetaServices([]);
      }

      setLoadedSources(Array.from(loaded));
      const failed = [
        poolRes.status === 'rejected' ? 'GPU pools' : '',
        usageRes.status === 'rejected' ? 'usage analytics' : '',
        betaRes.status === 'rejected' ? 'beta registry' : '',
      ].filter(Boolean);
      if (failed.length) setError(`Partial live data: ${failed.join(', ')} unavailable.`);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPolicyState = useCallback(async () => {
    await load();
  }, [load]);

  const refreshRuntimeDetails = useCallback(async (tag: string, runDiagnostics = false) => {
    setRuntimeDetails((prev) => ({ ...prev, [tag]: { ...prev[tag], loading: true, error: undefined } }));
    const [supportRes, jobsRes, logRes, diagRes] = await Promise.allSettled([
      apiService.getGpuPoolSupport(tag),
      apiService.listGpuPoolJobs(tag),
      apiService.getGpuPoolJobLog(tag),
      runDiagnostics ? apiService.runGpuPoolDiagnostics(tag) : Promise.resolve(undefined),
    ]);

    setRuntimeDetails((prev) => {
      const current = prev[tag] || {};
      return {
        ...prev,
        [tag]: {
          ...current,
          loading: false,
          support: supportRes.status === 'fulfilled' ? supportRes.value : current.support,
          jobs: jobsRes.status === 'fulfilled' ? jobsRes.value.jobs || [] : current.jobs,
          logLines: logRes.status === 'fulfilled' ? logRes.value.lines || [] : current.logLines,
          diagnostics: diagRes.status === 'fulfilled' && diagRes.value ? diagRes.value : current.diagnostics,
          error: [supportRes, jobsRes, logRes, diagRes].some((res) => res.status === 'rejected') ? 'Some runtime facts could not be loaded.' : undefined,
        },
      };
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selectedRuntimeTag && selected) {
      setSelectedRuntimeTag(primaryRuntime(selected).tag);
    }
  }, [selected, selectedRuntimeTag]);

  useEffect(() => {
    if (selectedRuntime?.kind === 'gpu') {
      void refreshRuntimeDetails(selectedRuntime.tag, false);
    }
  }, [refreshRuntimeDetails, selectedRuntime?.kind, selectedRuntime?.tag]);

  const runAction = async (action: RuntimeAction) => {
    if (!action.enabled || !selectedRuntime) return;
    if (action.confirm) {
      setPendingConfirm({ action, serviceTag: selectedRuntime.tag, node: selectedRuntime.apiUrl || selectedRuntime.node });
      return;
    }
    await executeAction(action);
  };

  const executeAction = async (action: RuntimeAction) => {
    if (!selectedRuntime) return;
    try {
      setBusy(selectedRuntime.tag);
      setError(null);
      const result = await action.run();
      if (action.id === 'diagnostics') {
        setRuntimeDetails((prev) => ({
          ...prev,
          [selectedRuntime.tag]: { ...prev[selectedRuntime.tag], diagnostics: result as GPUPoolDiagnosticsResult, loading: false },
        }));
      }
      await load();
      await refreshRuntimeDetails(selectedRuntime.tag, action.id !== 'diagnostics');
    } catch (err) {
      setError(err instanceof Error ? err.message : `${action.label} failed`);
    } finally {
      setBusy(null);
      setPendingConfirm(null);
    }
  };

  if (!selected || !selectedRuntime) {
    return <div className="h-full rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-gray-300">Loading AI Services...</div>;
  }

  const details = runtimeDetails[selectedRuntime.tag];
  const loadingDetails = Boolean(details?.loading);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="mb-2 grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-white/10 bg-black/25 px-3 py-2">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-white">AI Services</h1>
          <p className="truncate text-xs text-gray-500">API-first admin: product, runtime, access, usage, provider, and recovery.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs text-gray-300">
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">APIs {fleet.total}</span>
          <span className="hidden rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-100 sm:inline-flex">Ready {fleet.ready}</span>
          <span className="hidden rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-100 sm:inline-flex">Watch {fleet.attention}</span>
          <span className="hidden rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-sky-100 md:inline-flex">GPU {fleet.gpu}</span>
          <span className="hidden rounded-md border border-white/10 bg-white/5 px-2 py-1 lg:inline-flex">Sessions {fleet.sessions}</span>
          {billing && <span className="hidden rounded-md border border-white/10 bg-white/5 px-2 py-1 xl:inline-flex">{billing.startupCredits} start / {billing.creditsPerMin} min</span>}
          <button type="button" onClick={() => void load()} disabled={loading} className="rounded-md border border-white/10 p-1.5 text-gray-300 disabled:opacity-40" title={`Refresh AI Services. Sources: ${loadedSources.join(', ')}`}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-2 shrink-0 truncate rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {error}
        </div>
      )}

      <div className="sticky top-0 z-20 mb-2 grid shrink-0 grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black/55 p-2 backdrop-blur-xl lg:hidden">
        {(['services', 'detail'] as MobilePane[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMobilePane(item)}
            className={`rounded-md border px-3 py-2 text-xs font-semibold capitalize ${mobilePane === item ? 'border-sky-400/40 bg-sky-500/10 text-sky-100' : 'border-white/10 bg-white/5 text-gray-300'}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="hidden min-h-0 flex-1 grid-cols-[clamp(270px,24vw,330px)_minmax(0,1fr)] gap-2 overflow-hidden lg:grid">
        <ServiceLedger
          services={visibleServices}
          selected={selected.slug}
          query={query}
          filter={filter}
          page={page}
          onQuery={setQuery}
          onFilter={setFilter}
          onPage={setPage}
          onSelect={(slug) => {
            const next = services.find((service) => service.slug === slug);
            setSelectedSlug(slug);
            setSelectedRuntimeTag(next ? primaryRuntime(next).tag : null);
            setActiveTab('overview');
            setDrawer(null);
          }}
        />
        <ServiceWorkspace
          service={selected}
          runtime={selectedRuntime}
          details={details}
          activeTab={activeTab}
          busy={busy}
          loadingDetails={loadingDetails}
          onTab={setActiveTab}
          onRuntimeSelect={(tag) => {
            setSelectedRuntimeTag(tag);
            setActiveTab(tag.endsWith('-api') ? 'overview' : 'runtime');
          }}
          onRefreshDetails={() => void refreshRuntimeDetails(selectedRuntime.tag, true)}
          onAction={(action) => void runAction(action)}
          onDrawer={setDrawer}
          onOpenServices={() => setMobilePane('services')}
          onPolicySaved={refreshPolicyState}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden lg:hidden">
        {mobilePane === 'services' ? (
          <ServiceLedger
            services={visibleServices}
            selected={selected.slug}
            query={query}
            filter={filter}
            page={page}
            onQuery={setQuery}
            onFilter={setFilter}
            onPage={setPage}
            onSelect={(slug) => {
              const next = services.find((service) => service.slug === slug);
              setSelectedSlug(slug);
              setSelectedRuntimeTag(next ? primaryRuntime(next).tag : null);
              setActiveTab('overview');
              setDrawer(null);
              setMobilePane('detail');
            }}
          />
        ) : (
          <ServiceWorkspace
            service={selected}
            runtime={selectedRuntime}
            details={details}
            activeTab={activeTab}
            busy={busy}
            loadingDetails={loadingDetails}
            onTab={setActiveTab}
            onRuntimeSelect={(tag) => {
              setSelectedRuntimeTag(tag);
              setActiveTab(tag.endsWith('-api') ? 'overview' : 'runtime');
            }}
            onRefreshDetails={() => void refreshRuntimeDetails(selectedRuntime.tag, true)}
            onAction={(action) => void runAction(action)}
            onDrawer={setDrawer}
            onOpenServices={() => setMobilePane('services')}
            onPolicySaved={refreshPolicyState}
          />
        )}
      </div>

      <DetailDrawer drawer={drawer} runtime={selectedRuntime} details={details} onClose={() => setDrawer(null)} />
      <ConfirmModal
        pending={pendingConfirm}
        busy={Boolean(busy)}
        onCancel={() => setPendingConfirm(null)}
        onConfirm={() => {
          if (pendingConfirm) void executeAction(pendingConfirm.action);
        }}
      />
    </div>
  );
}
