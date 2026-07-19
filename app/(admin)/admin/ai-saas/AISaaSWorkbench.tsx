'use client';

import React, { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Database,
  ExternalLink,
  Gauge,
  GitBranch,
  KeyRound,
  Layers3,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Timer,
} from 'lucide-react';
import {
  apiService,
  type AISaaSListResponse,
  type AISaaSQueryParams,
  type AISaaSRuntimeProfile,
  type AISaaSServiceRecord,
  type AISaaSWarning,
} from '../../lib/apiService';
import {
  filterServices,
  legacyAliasGroups,
  limitsText,
  mergeDetailWarnings,
  nextMobilePane,
  registryProviderLabel,
  resolveSelectedService,
  retainSelectedApiId,
  sessionPricing,
  sourcePillTone,
  type MobileWorkbenchPane,
  type MobileWorkbenchPaneEvent,
} from './workbenchModel';

type DateFilter = Pick<AISaaSQueryParams, 'start_date' | 'end_date'>;

const EMPTY_FILTER: DateFilter = {};

export default function AISaaSWorkbench() {
  const [data, setData] = useState<AISaaSListResponse | null>(null);
  const [selectedApiId, setSelectedApiId] = useState<string>('');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [dateFilter, setDateFilter] = useState<DateFilter>(EMPTY_FILTER);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Mobile (<lg) single-focus pane; desktop split-pane ignores this state.
  const [mobilePane, setMobilePane] = useState<MobileWorkbenchPane>('list');

  const load = useCallback(async (nextFilter = dateFilter, quiet = false) => {
    try {
      if (quiet) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await apiService.listAISaaSServices(nextFilter);
      setData(response);
      setSelectedApiId((current) => retainSelectedApiId(current, response.services));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI SaaS services.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    void load(dateFilter);
  }, [dateFilter, load]);

  const filteredServices = useMemo(
    () => filterServices(data?.services || [], deferredQuery),
    [data?.services, deferredQuery],
  );

  const selectedService = useMemo(
    () => resolveSelectedService(data?.services || [], filteredServices, selectedApiId),
    [data?.services, filteredServices, selectedApiId],
  );

  const goToPane = useCallback((event: MobileWorkbenchPaneEvent, hasSelectableService: boolean) => {
    setMobilePane((current) => nextMobilePane(current, event, hasSelectableService));
  }, []);

  const selectService = useCallback((apiId: string) => {
    setSelectedApiId(apiId);
    goToPane('selectService', true);
  }, [goToPane]);

  const applyPreset = (preset: 'all' | 'last7Days' | 'last30Days' | 'thisMonth') => {
    startTransition(() => {
      if (preset === 'all') {
        setDateFilter(EMPTY_FILTER);
        return;
      }
      const presets = apiService.getDateRangePresets();
      setDateFilter(presets[preset]);
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#07090f] text-white shadow-2xl shadow-black/40">
      <section className="shrink-0 border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.22),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))] px-4 py-3 lg:px-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="mb-1 hidden items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-teal-100 md:inline-flex">
              <Sparkles className="h-3.5 w-3.5" />
              AI API Singleton Control Plane
            </div>
            <h1 className="truncate text-2xl font-black tracking-tight text-white md:text-3xl">AI SaaS</h1>
            <p className="mt-1 hidden max-w-4xl text-sm text-slate-300 md:block">
              One row per AI API. Beta access, GPU runtime, registry provider, usage, feedback, and deployment state are child facets.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto_auto] xl:min-w-[640px]">
            <label className="grid gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Start
              <input
                type="date"
                value={dateFilter.start_date || ''}
                onChange={(event) => setDateFilter((current) => ({ ...current, start_date: event.target.value || undefined }))}
                className="h-9 rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-semibold normal-case tracking-normal text-white outline-none focus:border-teal-300/50"
              />
            </label>
            <label className="grid gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              End
              <input
                type="date"
                value={dateFilter.end_date || ''}
                onChange={(event) => setDateFilter((current) => ({ ...current, end_date: event.target.value || undefined }))}
                className="h-9 rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-semibold normal-case tracking-normal text-white outline-none focus:border-teal-300/50"
              />
            </label>
            <button
              type="button"
              onClick={() => void load(dateFilter, true)}
              className="mt-auto inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 text-sm font-bold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={refreshing}
            >
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </button>
            <div className="mt-auto flex h-9 overflow-hidden rounded-xl border border-white/10 bg-black/20 text-[11px] font-bold text-slate-300">
              <button type="button" onClick={() => applyPreset('all')} className="px-2.5 hover:bg-white/10">All</button>
              <button type="button" onClick={() => applyPreset('last7Days')} className="border-l border-white/10 px-2.5 hover:bg-white/10">7d</button>
              <button type="button" onClick={() => applyPreset('last30Days')} className="border-l border-white/10 px-2.5 hover:bg-white/10">30d</button>
              <button type="button" onClick={() => applyPreset('thisMonth')} className="border-l border-white/10 px-2.5 hover:bg-white/10">MTD</button>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="shrink-0 border-b border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-100">
          {error}
        </div>
      )}

      <section className="shrink-0 border-b border-white/10 bg-black/20 px-4 py-3 lg:px-5">
        {loading && !data ? (
          <div className="flex h-20 items-center justify-center gap-2 text-sm font-semibold text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading AI SaaS ledger
          </div>
        ) : data ? (
          <div className="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 xl:grid-cols-6">
            <MetricCard label="AI APIs" value={data.fleet.totalServices} icon={Layers3} tone="teal" />
            <MetricCard label="GPU-backed" value={data.fleet.gpuBackedServices} icon={Cpu} tone="blue" />
            <MetricCard label="Ready runtimes" value={data.fleet.readyRuntimes} icon={CheckCircle2} tone="green" />
            <MetricCard label="Active beta keys" value={data.fleet.activeBetaKeys} icon={KeyRound} tone="amber" />
            <MetricCard label="Usage calls" value={data.fleet.totalCalls} icon={Activity} tone="violet" />
            <MetricCard label="Source warnings" value={data.fleet.partialSourceCount} icon={ShieldAlert} tone="red" />
          </div>
        ) : null}
      </section>

      <nav aria-label="Workbench pane" className="flex shrink-0 gap-1 border-b border-white/10 bg-black/30 px-4 py-2 lg:hidden">
        <button
          type="button"
          aria-pressed={mobilePane === 'list'}
          onClick={() => goToPane('backToList', Boolean(selectedService))}
          className={`flex-1 rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-wider transition ${mobilePane === 'list' ? 'border-teal-300/40 bg-teal-300/15 text-teal-100' : 'border-white/10 bg-white/[0.04] text-slate-400'}`}
        >
          List
        </button>
        <button
          type="button"
          aria-pressed={mobilePane === 'detail'}
          disabled={!selectedService}
          onClick={() => goToPane('showDetail', Boolean(selectedService))}
          className={`flex-1 rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50 ${mobilePane === 'detail' ? 'border-teal-300/40 bg-teal-300/15 text-teal-100' : 'border-white/10 bg-white/[0.04] text-slate-400'}`}
        >
          Details
        </button>
      </nav>

      <section className="min-h-0 flex-1 overflow-hidden">
        {data ? (
          <div className="grid h-full min-h-0 grid-cols-1 grid-rows-[minmax(0,1fr)] lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]">
            <aside className={`min-h-0 flex-col border-white/10 bg-slate-950/65 lg:border-r ${mobilePane === 'list' ? 'flex' : 'hidden'} lg:flex`}>
              <div className="shrink-0 border-b border-white/10 p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search apiId, serviceTag, image, provider..."
                    className="h-10 w-full rounded-2xl border border-white/10 bg-black/30 pl-10 pr-3 text-sm font-medium text-white outline-none placeholder:text-slate-600 focus:border-teal-300/50"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {data.sources.map((source) => (
                    <SourcePill key={source.name} name={source.name} status={source.status} count={source.count} />
                  ))}
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {filteredServices.map((service) => (
                  <ServiceLedgerRow
                    key={service.apiId}
                    service={service}
                    selected={service.apiId === selectedService?.apiId}
                    onSelect={() => selectService(service.apiId)}
                  />
                ))}
                {filteredServices.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
                    No AI APIs match this search.
                  </div>
                )}
              </div>
            </aside>

            <main className={`min-h-0 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_26%)] p-3 lg:block lg:p-4 ${mobilePane === 'detail' ? 'block' : 'hidden'}`}>
              <button
                type="button"
                onClick={() => goToPane('backToList', Boolean(selectedService))}
                className="mb-3 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10 lg:hidden"
              >
                &larr; Back to list
              </button>
              {selectedService ? (
                <ServiceDetail service={selectedService} generatedAt={data.generatedAt} warnings={data.warnings || []} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">Select an AI API.</div>
              )}
            </main>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ServiceLedgerRow({ service, selected, onSelect }: { service: AISaaSServiceRecord; selected: boolean; onSelect: () => void }) {
  const runtime = service.runtime?.[0];
  const registryLabel = registryProviderLabel(service);
  const warningCount = service.warnings?.length || 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`mb-2 w-full rounded-2xl border p-3 text-left transition ${selected ? 'border-teal-300/40 bg-teal-300/10 shadow-lg shadow-teal-950/30' : 'border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{service.displayName}</p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-teal-200">{service.apiId}</p>
        </div>
        <StatusBadge value={service.readiness} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <MiniStat label="Runtime" value={service.runtime?.length || 0} />
        <MiniStat label="Calls" value={formatNumber(service.usage.totalCalls)} />
        <MiniStat label="Keys" value={service.access.activeBetaKeys} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {registryLabel && <Badge>{registryLabel}</Badge>}
        {runtime?.serviceTag && <Badge>serviceTag: {runtime.serviceTag}</Badge>}
        {warningCount > 0 && <Badge tone="red">{warningCount} warning{warningCount === 1 ? '' : 's'}</Badge>}
      </div>
    </button>
  );
}

function ServiceDetail({ service, generatedAt, warnings }: { service: AISaaSServiceRecord; generatedAt: string; warnings: AISaaSWarning[] }) {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-3">
      <section className="rounded-[26px] border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={service.readiness} />
              <Badge tone={service.lifecycle === 'unmapped' ? 'red' : 'teal'}>{service.lifecycle}</Badge>
              <Badge>schema checked {formatDate(generatedAt)}</Badge>
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white">{service.displayName}</h2>
            <p className="mt-1 font-mono text-sm text-teal-200">apiId: {service.apiId}</p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{service.nextSafeAction}</p>
          </div>
          <div className="grid min-w-[280px] gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <LockNotice title="Public writes blocked" message={service.public.blockedBy || 'Public config writes are not enabled from AI SaaS yet.'} />
            <LockNotice title="Access writes blocked" message={service.access.blockedBy || 'Access routes are not canonical yet.'} />
          </div>
        </div>
      </section>

      <WarningPanel warnings={mergeDetailWarnings(service, warnings)} />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="grid gap-3">
          <Panel title="Public API" icon={ExternalLink}>
            <InfoGrid>
              <KV label="Public status" value={service.public.status} />
              <KV label="Public slug" value={service.slug} />
              <KV label="Endpoint" value={service.public.endpoint || 'Not resolved'} mono />
              <KV label="Source" value={service.public.source || 'frontend catalog alias'} />
            </InfoGrid>
            <div className="mt-3 flex flex-wrap gap-2">
              <RealLink href={service.public.tryApiPath || `/services/${service.slug}`}>Open service page</RealLink>
              <RealLink href={service.public.docsPath || '/api-docs'}>Open docs</RealLink>
            </div>
          </Panel>

          <Panel title="Runtime And Deployment" icon={Cpu}>
            {service.runtime?.length ? (
              <div className="grid gap-3">
                {service.runtime.map((runtime) => (
                  <RuntimeCard key={runtime.runtimeId} runtime={runtime} />
                ))}
              </div>
            ) : (
              <EmptyState message="No GPU/runtime profile resolved for this API." />
            )}
          </Panel>

          <Panel title="Policy And Billing" icon={Gauge}>
            <InfoGrid>
              <KV label="Policy source" value={service.policy.source || 'none'} />
              <KV label="Summary" value={service.policy.summary || 'No backend policy resolved'} />
              <KV label="Pricing mode" value={service.policy.pricingMode || 'not set'} />
              <KV label="Credits/hit" value={service.policy.creditsPerHit ?? 'not set'} />
              <KV label="Credits/page" value={service.policy.creditsPerPage ?? 'not set'} />
              <KV label="Session credits" value={sessionPricing(service)} />
              <KV label="Limits" value={limitsText(service)} />
              <KV label="Formats" value={service.policy.allowedFormats?.join(', ') || 'not set'} />
            </InfoGrid>
            <LockNotice title="Policy edits disabled here" message={service.policy.blockedBy || 'Canonical public policy writes are not cut over.'} />
          </Panel>
        </div>

        <div className="grid content-start gap-3">
          <Panel title="Access" icon={KeyRound}>
            <InfoGrid compact>
              <KV label="Model" value={service.access.model} />
              <KV label="Beta supported" value={service.access.betaSupported ? 'yes' : 'no'} />
              <KV label="Active beta keys" value={service.access.activeBetaKeys} />
              <KV label="Total beta keys" value={service.access.totalBetaKeys} />
              <KV label="Revoked" value={service.access.revokedBetaKeys} />
              <KV label="Expired" value={service.access.expiredBetaKeys} />
            </InfoGrid>
            <AliasChips label="Beta tags" values={service.access.betaServiceTags || []} />
            <div className="mt-3 flex flex-wrap gap-2">
              <RealLink href="/admin/beta-keys">Open beta keys</RealLink>
              <RealLink href="/admin/beta-services">Open beta services</RealLink>
            </div>
          </Panel>

          <Panel title="Usage" icon={Activity}>
            <InfoGrid compact>
              <KV label="Total calls" value={formatNumber(service.usage.totalCalls)} />
              <KV label="Success" value={formatNumber(service.usage.successCalls)} />
              <KV label="Failed" value={formatNumber(service.usage.failedCalls)} />
              <KV label="Credits" value={formatNumber(service.usage.totalCredits)} />
            </InfoGrid>
            <RealLink href="/admin/services">Open usage analytics</RealLink>
          </Panel>

          <Panel title="Feedback / QA" icon={ShieldAlert}>
            <InfoGrid compact>
              <KV label="Recent sessions" value={service.feedback.recentSessions} />
              <KV label="Pending" value={service.feedback.pendingSessions} />
              <KV label="Refunded credits" value={service.feedback.refundedCredits} />
              <KV label="Last feedback" value={formatDate(service.feedback.lastCreatedAt)} />
            </InfoGrid>
            <RealLink href="/admin/beta-feedback">Open beta feedback</RealLink>
          </Panel>

          <Panel title="Legacy Aliases" icon={GitBranch}>
            {legacyAliasGroups(service).map((group) => (
              <AliasChips key={group.label} label={group.label} values={group.values} />
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function RuntimeCard({ runtime }: { runtime: AISaaSRuntimeProfile }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-black/25 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={runtime.readiness} />
            <Badge>{runtime.runtimeId}</Badge>
            {runtime.serviceTag && <Badge>serviceTag: {runtime.serviceTag}</Badge>}
          </div>
          <p className="mt-3 text-lg font-black text-white">{runtime.state}</p>
          <p className="mt-1 text-sm text-slate-400">{runtime.lastError || 'No current runtime error in aggregate.'}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm md:min-w-[340px]">
          <MiniStat label="Ref count" value={runtime.refCount} />
          <MiniStat label="Sessions" value={runtime.activeSessions} />
          <MiniStat label="Provider" value={runtime.provider || runtime.provision?.primaryProvider || 'not set'} />
          <MiniStat label="Region" value={runtime.region || runtime.provision?.awsRegion || runtime.provision?.gcpRegion || 'not set'} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <h4 className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">Registry Image</h4>
          {runtime.registry ? (
            <InfoGrid compact>
              <KV label="Provider" value={runtime.registry.provider || 'not set'} />
              <KV label="Auth" value={runtime.registry.authMode || 'not set'} />
              <KV label="Server" value={runtime.registry.server || 'not set'} mono />
              <KV label="Namespace" value={runtime.registry.namespace || 'not set'} mono />
              <KV label="Region" value={runtime.registry.region || 'not set'} />
              <KV label="Image tag" value={runtime.registry.imageTag || 'not set'} mono />
              <KV label="Prefer pull" value={runtime.registry.preferRegistryPull === undefined ? 'not set' : runtime.registry.preferRegistryPull ? 'yes' : 'no'} />
              <KV label="Login required" value={runtime.registry.loginRequired === undefined ? 'not set' : runtime.registry.loginRequired ? 'yes' : 'no'} />
            </InfoGrid>
          ) : (
            <EmptyState message="No registry settings resolved for this runtime." />
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <h4 className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">Provision Chain</h4>
          {runtime.provision ? (
            <InfoGrid compact>
              <KV label="Primary" value={runtime.provision.primaryProvider || 'not set'} />
              <KV label="Fallback" value={runtime.provision.fallbackProvider || 'not set'} />
              <KV label="AWS" value={[runtime.provision.awsRegion, runtime.provision.awsInstanceType, runtime.provision.awsCapacityType].filter(Boolean).join(' / ') || 'not set'} />
              <KV label="E2E" value={[runtime.provision.e2eLocation, runtime.provision.e2eGpuCard].filter(Boolean).join(' / ') || 'not set'} />
              <KV label="Grace" value={runtime.provision.gracePeriodMin ? `${runtime.provision.gracePeriodMin} min` : 'not set'} />
              <KV label="Maintenance" value={runtime.provision.maintenanceMode || runtime.provision.blockNewSessions ? 'blocking new sessions' : 'not blocking'} />
            </InfoGrid>
          ) : (
            <EmptyState message="No provision config resolved for this runtime." />
          )}
        </div>
      </div>

      {!!runtime.jobs?.length && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <h4 className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
            <Timer className="h-3.5 w-3.5" />
            Recent GPU Jobs
          </h4>
          <div className="grid gap-2">
            {runtime.jobs.map((job) => (
              <div key={job.id} className="grid gap-2 rounded-xl border border-white/10 bg-black/25 p-2 text-xs md:grid-cols-[110px_1fr_120px]">
                <StatusBadge value={job.status} />
                <span className="min-w-0 truncate font-mono text-slate-300">{job.type}</span>
                <span className="text-slate-500">{formatDate(job.createdAt)}</span>
                {job.lastError && <span className="md:col-span-3 text-red-200">{job.lastError}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function WarningPanel({ warnings }: { warnings: AISaaSWarning[] }) {
  if (!warnings.length) {
    return (
      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-semibold text-emerald-100">
        No warnings for the selected API in the aggregate response.
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-black text-amber-100">
        <AlertTriangle className="h-4 w-4" />
        Source and alignment warnings
      </div>
      <div className="grid gap-2">
        {warnings.map((warning, index) => (
          <div key={`${warning.code}-${index}`} className="rounded-xl border border-amber-200/15 bg-black/20 px-3 py-2 text-sm text-amber-50">
            <span className="font-black uppercase tracking-wider">{warning.code}</span>
            <span className="mx-2 text-amber-300/60">/</span>
            <span>{warning.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4 shadow-lg shadow-black/20">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-slate-400">
        <Icon className="h-4 w-4 text-teal-200" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function InfoGrid({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return <div className={`grid gap-2 ${compact ? '' : 'md:grid-cols-2'}`}>{children}</div>;
}

function KV({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`mt-1 min-w-0 truncate text-sm font-semibold text-slate-100 ${mono ? 'font-mono' : ''}`}>{value || 'not set'}</p>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; tone: string }) {
  const toneClass = {
    teal: 'from-teal-400/18 to-teal-400/5 text-teal-100',
    blue: 'from-sky-400/18 to-sky-400/5 text-sky-100',
    green: 'from-emerald-400/18 to-emerald-400/5 text-emerald-100',
    amber: 'from-amber-400/18 to-amber-400/5 text-amber-100',
    violet: 'from-violet-400/18 to-violet-400/5 text-violet-100',
    red: 'from-red-400/18 to-red-400/5 text-red-100',
  }[tone] || 'from-slate-400/18 to-slate-400/5 text-slate-100';

  return (
    <div className={`min-w-[132px] shrink-0 rounded-2xl border border-white/10 bg-gradient-to-br ${toneClass} p-3 md:min-w-0`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
        <Icon className="h-4 w-4 opacity-80" />
      </div>
      <p className="mt-2 text-xl font-black md:text-2xl">{formatNumber(value)}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-black/20 px-2 py-1.5">
      <p className="truncate text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-0.5 truncate text-xs font-black text-white">{value}</p>
    </div>
  );
}

function Badge({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'slate' | 'teal' | 'red' }) {
  const toneClass = tone === 'teal'
    ? 'border-teal-300/20 bg-teal-300/10 text-teal-100'
    : tone === 'red'
      ? 'border-red-300/20 bg-red-300/10 text-red-100'
      : 'border-white/10 bg-white/[0.06] text-slate-300';
  return <span className={`inline-flex max-w-full items-center rounded-full border px-2 py-1 text-[10px] font-bold ${toneClass}`}>{children}</span>;
}

function StatusBadge({ value }: { value: string }) {
  const normalized = (value || 'unknown').toLowerCase();
  const tone = normalized.includes('ready') || normalized.includes('active') || normalized.includes('completed')
    ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
    : normalized.includes('failed') || normalized.includes('error') || normalized.includes('dead')
      ? 'border-red-300/20 bg-red-300/10 text-red-100'
      : normalized.includes('provision') || normalized.includes('pending') || normalized.includes('running')
        ? 'border-amber-300/20 bg-amber-300/10 text-amber-100'
        : 'border-slate-300/15 bg-slate-300/10 text-slate-200';
  return <span className={`inline-flex shrink-0 rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-wider ${tone}`}>{value || 'unknown'}</span>;
}

function SourcePill({ name, status, count }: { name: string; status: string; count: number }) {
  const tone = sourcePillTone(status) === 'ok'
    ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
    : 'border-amber-300/20 bg-amber-300/10 text-amber-100';
  return <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${tone}`}>{name}: {count}</span>;
}

function RealLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-teal-100 transition hover:border-teal-300/30 hover:bg-teal-300/10"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" />
    </Link>
  );
}

function LockNotice({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3">
      <p className="text-xs font-black uppercase tracking-widest text-amber-100">{title}</p>
      <p className="mt-1 text-xs leading-5 text-amber-50/85">{message}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-500">{message}</div>;
}

function AliasChips({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="mt-3">
      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {values?.length ? values.map((value) => <Badge key={value}>{value}</Badge>) : <span className="text-xs text-slate-600">none</span>}
      </div>
    </div>
  );
}

function formatNumber(value: number | string): string {
  if (typeof value === 'string') return value;
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

function formatDate(value?: string): string {
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
