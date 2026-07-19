import type { AISaaSRuntimeProfile, AISaaSServiceRecord, AISaaSWarning } from '../../lib/apiService';

/**
 * Pure view-model logic for the AI Services workbench (/admin/ai-services).
 *
 * Ported from ai-saas/workbenchModel.ts and extended with ledger filters,
 * domain tabs, human status labels, and GPU command gating so all behavior
 * can be regression-tested without a DOM.
 *
 * apiId is the only selection identity — never slug/serviceTag/betaServiceTag.
 */

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

/**
 * Selection retention after a (re)load: keep the current apiId when it still
 * exists in the response, otherwise fall back to the first service.
 */
export function retainSelectedApiId(current: string, services: AISaaSServiceRecord[]): string {
  if (current && services.some((service) => service.apiId === current)) {
    return current;
  }
  return services[0]?.apiId || '';
}

/**
 * Detail pane resolution: selected apiId wins; if the selection is not in the
 * list (e.g. filtered out), fall back to the first filtered row, then the
 * first service, then null.
 */
export function resolveSelectedService(
  services: AISaaSServiceRecord[],
  filteredServices: AISaaSServiceRecord[],
  selectedApiId: string,
): AISaaSServiceRecord | null {
  return services.find((service) => service.apiId === selectedApiId) || filteredServices[0] || services[0] || null;
}

// ---------------------------------------------------------------------------
// Search + ledger filters
// ---------------------------------------------------------------------------

export type LedgerFilterId = 'all' | 'attention' | 'gpu' | 'beta' | 'public';

export const LEDGER_FILTERS: { id: LedgerFilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'attention', label: 'Needs attention' },
  { id: 'gpu', label: 'GPU' },
  { id: 'beta', label: 'Beta' },
  { id: 'public', label: 'Public' },
];

export function serviceSearchText(service: AISaaSServiceRecord): string {
  const runtimes = service.runtime || [];
  const registry = runtimes.flatMap((runtime) => [
    runtime.registry?.provider,
    runtime.registry?.server,
    runtime.registry?.namespace,
    runtime.registry?.imageTag,
    runtime.provision?.primaryProvider,
    runtime.provision?.fallbackProvider,
    runtime.serviceTag,
  ]);
  return [
    service.apiId,
    service.slug,
    service.displayName,
    ...service.aliases.catalogSlugs,
    ...service.aliases.usageNames,
    ...service.aliases.betaServiceNames,
    ...service.aliases.betaServiceTags,
    ...service.aliases.gpuServiceTags,
    ...service.aliases.pipelineServices,
    ...registry,
  ].filter(Boolean).join(' ').toLowerCase();
}

export function hasGpuRuntime(service: AISaaSServiceRecord | null | undefined): boolean {
  if (!service) return false;
  if ((service.aliases?.gpuServiceTags || []).length > 0) return true;
  return (service.runtime || []).some((runtime) => Boolean(runtime.serviceTag) || runtime.runtimeId?.startsWith('gpu:'));
}

export function needsAttention(service: AISaaSServiceRecord): boolean {
  if ((service.warnings?.length || 0) > 0) return true;
  const readiness = (service.readiness || '').toLowerCase();
  if (['failed', 'error', 'attention', 'warning', 'blocked', 'unmapped'].some((token) => readiness.includes(token))) {
    return true;
  }
  return (service.runtime || []).some((runtime) => {
    const state = (runtime.state || '').toLowerCase();
    // Draining with no sessions and no error is expected grace — not fleet attention.
    if (state.includes('draining')) {
      return Boolean(runtime.lastError) || (runtime.activeSessions || 0) > 0;
    }
    return Boolean(runtime.lastError) || state.includes('failed');
  });
}

export function isBetaService(service: AISaaSServiceRecord): boolean {
  return (
    service.access.betaSupported ||
    service.access.totalBetaKeys > 0 ||
    (service.aliases.betaServiceTags?.length || 0) > 0
  );
}

export function isPublicService(service: AISaaSServiceRecord): boolean {
  return (service.public.status || '').toLowerCase().includes('public');
}

export function matchesFilter(service: AISaaSServiceRecord, filter: LedgerFilterId): boolean {
  switch (filter) {
    case 'attention':
      return needsAttention(service);
    case 'gpu':
      return hasGpuRuntime(service);
    case 'beta':
      return isBetaService(service);
    case 'public':
      return isPublicService(service);
    default:
      return true;
  }
}

export function filterServices(
  services: AISaaSServiceRecord[],
  query: string,
  filter: LedgerFilterId = 'all',
): AISaaSServiceRecord[] {
  const normalized = query.trim().toLowerCase();
  return services.filter((service) => {
    if (!matchesFilter(service, filter)) return false;
    if (!normalized) return true;
    return serviceSearchText(service).includes(normalized);
  });
}

// ---------------------------------------------------------------------------
// Domain tabs
// ---------------------------------------------------------------------------

export type WorkbenchTabId =
  | 'overview'
  | 'public'
  | 'runtime'
  | 'policy'
  | 'access'
  | 'usage'
  | 'feedback'
  | 'recovery';

export const DEFAULT_TAB: WorkbenchTabId = 'overview';

export const ALL_TABS: { id: WorkbenchTabId; label: string; gpuOnly: boolean }[] = [
  { id: 'overview', label: 'Overview', gpuOnly: false },
  { id: 'public', label: 'Public API', gpuOnly: false },
  { id: 'runtime', label: 'Runtime', gpuOnly: true },
  { id: 'policy', label: 'Policy', gpuOnly: false },
  { id: 'access', label: 'Access', gpuOnly: false },
  { id: 'usage', label: 'Usage', gpuOnly: false },
  { id: 'feedback', label: 'Feedback', gpuOnly: false },
  { id: 'recovery', label: 'Recovery', gpuOnly: true },
];

/** Runtime and Recovery only exist for APIs with a GPU runtime profile. */
export function visibleTabs(service: AISaaSServiceRecord | null): typeof ALL_TABS {
  const gpu = service ? hasGpuRuntime(service) : false;
  return ALL_TABS.filter((tab) => gpu || !tab.gpuOnly);
}

/** URL/tab-state guard: unknown or hidden tabs resolve to Overview. */
export function normalizeTab(value: string | null | undefined, service: AISaaSServiceRecord | null): WorkbenchTabId {
  const candidate = (value || '').toLowerCase() as WorkbenchTabId;
  return visibleTabs(service).some((tab) => tab.id === candidate) ? candidate : DEFAULT_TAB;
}

// ---------------------------------------------------------------------------
// Human status labels (raw codes stay visible but secondary)
// ---------------------------------------------------------------------------

export type StatusTone = 'ok' | 'busy' | 'warn' | 'bad' | 'muted';

const STATUS_LABELS: Record<string, { label: string; tone: StatusTone }> = {
  ready: { label: 'Ready', tone: 'ok' },
  active: { label: 'Active', tone: 'ok' },
  completed: { label: 'Completed', tone: 'ok' },
  idle: { label: 'GPU idle', tone: 'muted' },
  'public-only': { label: 'Catalog only', tone: 'muted' },
  provisioning: { label: 'Starting', tone: 'busy' },
  pending: { label: 'Queued', tone: 'busy' },
  running: { label: 'Running', tone: 'busy' },
  draining: { label: 'Winding down', tone: 'warn' },
  attention: { label: 'Needs attention', tone: 'warn' },
  warning: { label: 'Needs attention', tone: 'warn' },
  failed: { label: 'Failed', tone: 'bad' },
  error: { label: 'Failed', tone: 'bad' },
  blocked: { label: 'Blocked', tone: 'bad' },
  unmapped: { label: 'Unmapped', tone: 'bad' },
  unknown: { label: 'Unknown', tone: 'muted' },
};

export function humanStatus(raw: string | undefined | null): { label: string; tone: StatusTone; raw: string } {
  const code = (raw || 'unknown').toLowerCase();
  const exact = STATUS_LABELS[code];
  if (exact) return { ...exact, raw: code };
  const partial = Object.keys(STATUS_LABELS).find((key) => code.includes(key));
  if (partial) return { ...STATUS_LABELS[partial], raw: code };
  return { label: code.charAt(0).toUpperCase() + code.slice(1), tone: 'muted', raw: code };
}

/** Warning codes -> operator language; raw code stays as secondary metadata. */
export function humanWarning(warning: AISaaSWarning): string {
  const known: Record<string, string> = {
    LIMITED_GPU_CONFIG_DISCOVERY: 'Limited GPU config list',
    PARTIAL_SOURCE: 'Some data sources were unavailable',
    AMBIGUOUS_ALIAS: 'Alias maps to more than one API',
    CONFLICTING_ALIAS: 'Conflicting alias records',
    MISSING_SOURCE: 'A data source is missing',
  };
  return known[warning.code] || warning.message || warning.code;
}

// ---------------------------------------------------------------------------
// Warnings
// ---------------------------------------------------------------------------

/**
 * Warnings shown on the detail pane: the service's own warnings plus global
 * (un-scoped) response warnings, without duplicating warnings that are already
 * attached to the selected apiId.
 */
export function mergeDetailWarnings(service: AISaaSServiceRecord, responseWarnings: AISaaSWarning[]): AISaaSWarning[] {
  const globalWarnings = responseWarnings.filter((warning) => !warning.apiId || warning.apiId === service.apiId);
  return [...(service.warnings || []), ...globalWarnings.filter((warning) => warning.apiId !== service.apiId)];
}

// ---------------------------------------------------------------------------
// Mobile single-focus pane
// ---------------------------------------------------------------------------

export type MobileWorkbenchPane = 'list' | 'detail';

export type MobileWorkbenchPaneEvent = 'selectService' | 'showDetail' | 'backToList';

/**
 * Mobile single-focus pane state (<lg only; desktop split-pane ignores this).
 * Selecting a service focuses Details; Back returns to List. Details can never
 * be focused when there is no resolvable service to show.
 */
export function nextMobilePane(
  current: MobileWorkbenchPane,
  event: MobileWorkbenchPaneEvent,
  hasSelectableService: boolean,
): MobileWorkbenchPane {
  if (event === 'backToList') return 'list';
  if (!hasSelectableService) return 'list';
  if (event === 'selectService' || event === 'showDetail') return 'detail';
  return current;
}

// ---------------------------------------------------------------------------
// Runtime facts + GPU command gating
// ---------------------------------------------------------------------------

/** Primary runtime profile for command strip and overview facts. */
export function primaryRuntime(service: AISaaSServiceRecord): AISaaSRuntimeProfile | null {
  return service.runtime?.[0] || null;
}

export function runtimeHasNode(runtime: AISaaSRuntimeProfile): boolean {
  return Boolean(runtime.publicIp || runtime.nodeId);
}

export function runtimeActiveJob(runtime: AISaaSRuntimeProfile) {
  return runtime.jobs?.find((job) => job.status === 'pending' || job.status === 'running') || runtime.jobs?.[0];
}

export interface CommandAvailability {
  canStart: boolean;
  canRecover: boolean;
  canDiagnostics: boolean;
  canRetry: boolean;
  canAbort: boolean;
  canKeepRunning: boolean;
  canExtendGrace: boolean;
  canGraceStop: boolean;
  canDestroy: boolean;
  draining: boolean;
  busyReason?: string;
}

/**
 * GPU command gating from the aggregate runtime profile. Mirrors the safety
 * rules used on /admin/gpu-pools: no start while provisioning, recover only
 * with a reusable node or a failure, destroy only with a node present.
 */
export function commandAvailability(runtime: AISaaSRuntimeProfile | null, busy: boolean): CommandAvailability {
  const none: CommandAvailability = {
    canStart: false,
    canRecover: false,
    canDiagnostics: false,
    canRetry: false,
    canAbort: false,
    canKeepRunning: false,
    canExtendGrace: false,
    canGraceStop: false,
    canDestroy: false,
    draining: false,
  };
  if (!runtime || !runtime.serviceTag) return none;
  if (busy) return { ...none, draining: runtime.state === 'draining', canExtendGrace: runtime.state === 'draining', busyReason: 'A command is already running' };

  const state = (runtime.state || '').toLowerCase();
  const ready = state === 'ready';
  const provisioning = state === 'provisioning';
  const failed = state === 'failed';
  const idle = state === 'idle';
  const draining = state === 'draining';
  const nodePresent = runtimeHasNode(runtime);
  const activeJob = runtimeActiveJob(runtime);
  const hasActiveJob = activeJob?.status === 'pending' || activeJob?.status === 'running';
  const hasPriorFailure = Boolean(runtime.lastError);

  return {
    canStart: !provisioning && !ready && !draining,
    canRecover: !provisioning && (nodePresent || failed || idle),
    canDiagnostics: nodePresent || ready || provisioning || failed || draining,
    canRetry: !hasActiveJob && (failed || (idle && hasPriorFailure)),
    canAbort: provisioning || hasActiveJob,
    canKeepRunning: draining,
    canExtendGrace: draining && nodePresent,
    canGraceStop: ready && nodePresent,
    canDestroy: nodePresent && (runtime.activeSessions || 0) === 0 && (runtime.refCount || 0) === 0,
    draining,
  };
}

/** Command strip headline: the single next safe GPU action for the operator. */
export function nextCommandLabel(runtime: AISaaSRuntimeProfile | null): string {
  if (!runtime) return 'No GPU runtime';
  const state = (runtime.state || '').toLowerCase();
  const activeJob = runtimeActiveJob(runtime);
  const jobActive = activeJob?.status === 'pending' || activeJob?.status === 'running';
  // Draining is authoritative for operator CTA unless a provision job is truly running.
  if (state === 'draining') return 'Keep running';
  if (jobActive || state === 'provisioning') return 'Watch or abort job';
  if (state === 'ready') return 'Keep serving';
  if (state === 'failed') return 'Recover runtime';
  if (runtimeHasNode(runtime)) return 'Recover reusable node';
  return 'Start runtime';
}

/** Prefer live GPU pool state over service readiness (jobs can inflate readiness to provisioning). */
export function displayRuntimeStatus(service: AISaaSServiceRecord): string {
  const runtime = primaryRuntime(service);
  if (runtime?.state) return runtime.state;
  return service.readiness || 'unknown';
}

// ---------------------------------------------------------------------------
// Read/write capability cues
// ---------------------------------------------------------------------------

export interface CapabilityCue {
  writable: boolean;
  hint?: string;
}

/**
 * Seamless read/write rule: real inputs when the aggregate marks the domain
 * configurable; read-only rows with a quiet capability hint otherwise.
 * No banner components — the hint is one muted line.
 */
export function capabilityCue(configurable: boolean, blockedBy?: string): CapabilityCue {
  if (configurable) return { writable: true };
  return {
    writable: false,
    hint: blockedBy || 'Read-only here for now. Edits open from the linked admin pages.',
  };
}

// ---------------------------------------------------------------------------
// Display helpers (ported)
// ---------------------------------------------------------------------------

export interface LegacyAliasGroup {
  label: string;
  values: string[];
}

/**
 * Legacy identifiers surfaced strictly as compatibility metadata under the
 * selected apiId — never as selection identity.
 */
export function legacyAliasGroups(service: AISaaSServiceRecord): LegacyAliasGroup[] {
  return [
    { label: 'Catalog slugs', values: service.aliases.catalogSlugs },
    { label: 'Usage names', values: service.aliases.usageNames },
    { label: 'Beta names', values: service.aliases.betaServiceNames },
    { label: 'Beta tags', values: service.aliases.betaServiceTags },
    { label: 'GPU tags', values: service.aliases.gpuServiceTags },
    { label: 'Pipelines', values: service.aliases.pipelineServices },
  ];
}

export function registryProviderLabel(service: AISaaSServiceRecord): string {
  const runtime = service.runtime?.find((item) => item.registry?.provider);
  if (!runtime?.registry?.provider) return '';
  const image = runtime.registry.imageTag ? `:${runtime.registry.imageTag}` : '';
  return `${runtime.registry.provider}${image}`;
}

export function sessionPricing(service: AISaaSServiceRecord): string {
  if (service.policy.startupCredits === undefined && service.policy.creditsPerMinute === undefined) {
    return 'not set';
  }
  return `${service.policy.startupCredits ?? 0} start + ${service.policy.creditsPerMinute ?? 0}/min`;
}

export function limitsText(service: AISaaSServiceRecord): string {
  const parts = [
    service.policy.maxUploadSizeMB ? `${service.policy.maxUploadSizeMB}MB` : '',
    service.policy.maxPages ? `${service.policy.maxPages} pages` : '',
    service.policy.maxFiles ? `${service.policy.maxFiles} files` : '',
  ].filter(Boolean);
  return parts.join(' / ') || 'not set';
}

export type SourcePillTone = 'ok' | 'degraded';

/** Source pills render green only for fully-ok sources; partial/error/limited render amber. */
export function sourcePillTone(status: string): SourcePillTone {
  return status === 'ok' ? 'ok' : 'degraded';
}

export function formatNumber(value: number | string): string {
  if (typeof value === 'string') return value;
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

export function formatDate(value?: string): string {
  if (!value) return 'not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// ---------------------------------------------------------------------------
// Compatibility aliases used by the workbench shell / tabs
// ---------------------------------------------------------------------------

export type DetailTab = WorkbenchTabId;
export type LedgerFilter = LedgerFilterId;

export function parseDetailTab(raw: string | null | undefined): WorkbenchTabId {
  return normalizeTab(raw, null);
}

export function visibleTabsForService(service: AISaaSServiceRecord | null): WorkbenchTabId[] {
  return visibleTabs(service).map((tab) => tab.id);
}

export function coerceTabForService(tab: WorkbenchTabId, service: AISaaSServiceRecord | null): WorkbenchTabId {
  return normalizeTab(tab, service);
}

export function statusTone(code: string | undefined): string {
  const tone = humanStatus(code).tone;
  switch (tone) {
    case 'ok':
      return 'border-emerald-400/35 bg-emerald-500/10 text-emerald-100';
    case 'busy':
      return 'border-sky-400/35 bg-sky-500/10 text-sky-100';
    case 'warn':
      return 'border-amber-400/35 bg-amber-500/10 text-amber-100';
    case 'bad':
      return 'border-red-400/35 bg-red-500/10 text-red-100';
    default:
      return 'border-white/10 bg-white/5 text-gray-300';
  }
}

export function policyDraftFromSummary(service: AISaaSServiceRecord) {
  return {
    limits: {
      maxUploadSizeMB: service.policy.maxUploadSizeMB,
      maxPages: service.policy.maxPages,
      maxFiles: service.policy.maxFiles,
      allowedFormats: service.policy.allowedFormats || [],
    },
    pricing: {
      mode: service.policy.pricingMode || 'hybrid',
      creditsPerHit: service.policy.creditsPerHit,
      creditsPerPage: service.policy.creditsPerPage,
      startupCredits: service.policy.startupCredits,
      creditsPerMinute: service.policy.creditsPerMinute,
    },
    notes: service.policy.notes || '',
  };
}
