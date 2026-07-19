'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import type { AISaaSListResponse, GPUPoolDiagnosticsResult, GPUPoolRecoveryReport } from '../../lib/apiService';
import {
  DEFAULT_TAB,
  filterServices,
  needsAttention,
  nextMobilePane,
  normalizeTab,
  resolveSelectedService,
  retainSelectedApiId,
  type LedgerFilterId,
  type MobileWorkbenchPane,
  type MobileWorkbenchPaneEvent,
  type WorkbenchTabId,
} from './workbenchModel';
import {
  getDateRangePresets,
  listAIServices,
  runRuntimeCommand,
} from './lib/dataService';
import ServiceLedger from './components/ServiceLedger';
import ServiceWorkspace from './components/ServiceWorkspace';
import ConfirmModal, { type PendingConfirm } from './components/ConfirmModal';
import DetailDrawer, { type DrawerId } from './components/DetailDrawer';
import type { CommandDescriptor } from './components/CommandStrip';
import type { UsageWindow } from './components/tabs/UsageTab';

const LEDGER_FILTER_IDS: LedgerFilterId[] = ['all', 'attention', 'gpu', 'beta', 'public'];

/**
 * Composition root for /admin/ai-services.
 *
 * Selection identity is apiId only, mirrored to ?apiId=&tab= so operators can
 * deep-link a service and domain panel. The shell owns viewport fit; this
 * component never introduces page-wide scroll.
 */
export default function AIServicesWorkbench({
  initialApiId = '',
  initialTab = '',
}: {
  initialApiId?: string;
  initialTab?: string;
}) {
  const [data, setData] = useState<AISaaSListResponse | null>(null);
  const [selectedApiId, setSelectedApiId] = useState(initialApiId);
  const [tabChoice, setTabChoice] = useState<string>(initialTab || DEFAULT_TAB);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<LedgerFilterId>('all');
  const [usageWindow, setUsageWindow] = useState<UsageWindow>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const [destroyToken, setDestroyToken] = useState('');
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [drawerLines, setDrawerLines] = useState<string[]>([]);
  const [lastDiagnostics, setLastDiagnostics] = useState<GPUPoolDiagnosticsResult | null>(null);
  const [lastRecovery, setLastRecovery] = useState<GPUPoolRecoveryReport | null>(null);
  // Mobile (<lg) single-focus pane; desktop split-pane ignores this state.
  const [mobilePane, setMobilePane] = useState<MobileWorkbenchPane>('list');

  const load = useCallback(async (window: UsageWindow, quiet = false) => {
    try {
      if (quiet) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await listAIServices(window);
      setData(response);
      setSelectedApiId((current) => retainSelectedApiId(current, response.services));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI services.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(usageWindow, Boolean(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usageWindow, load]);

  const services = useMemo(() => data?.services || [], [data?.services]);
  const filteredServices = useMemo(
    () => filterServices(services, query, filter),
    [services, query, filter],
  );
  const selectedService = useMemo(
    () => resolveSelectedService(services, filteredServices, selectedApiId),
    [services, filteredServices, selectedApiId],
  );
  const activeTab: WorkbenchTabId = useMemo(
    () => normalizeTab(tabChoice, selectedService),
    [tabChoice, selectedService],
  );

  // Deep-link mirror: keep ?apiId=&tab= current without triggering navigation.
  useEffect(() => {
    if (!selectedService) return;
    const params = new URLSearchParams(window.location.search);
    params.set('apiId', selectedService.apiId);
    if (activeTab === DEFAULT_TAB) {
      params.delete('tab');
    } else {
      params.set('tab', activeTab);
    }
    const next = `${window.location.pathname}?${params.toString()}`.replace(/\?$/, '');
    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, '', next);
    }
  }, [selectedService, activeTab]);

  const goToPane = useCallback((event: MobileWorkbenchPaneEvent, hasSelectableService: boolean) => {
    setMobilePane((current) => nextMobilePane(current, event, hasSelectableService));
  }, []);

  const selectService = useCallback((apiId: string) => {
    setSelectedApiId(apiId);
    setTabChoice(DEFAULT_TAB);
    setDrawer(null);
    goToPane('selectService', true);
  }, [goToPane]);

  const applyUsagePreset = useCallback((preset: 'all' | 'last7Days' | 'last30Days' | 'thisMonth') => {
    if (preset === 'all') {
      setUsageWindow({});
      return;
    }
    const presets = getDateRangePresets();
    setUsageWindow(presets[preset]);
  }, []);

  const executeCommand = useCallback(async (command: CommandDescriptor, serviceTag: string, apiId: string) => {
    try {
      setBusy(true);
      setError(null);
      const result = await runRuntimeCommand(command.id, serviceTag, apiId, {
        confirm: command.id === 'destroyNow' ? 'DESTROY' : undefined,
      });
      if (command.id === 'diagnostics' && result && typeof result === 'object') {
        const diag = result as GPUPoolDiagnosticsResult;
        setLastDiagnostics(diag);
        setDrawerLines(diag.summary || []);
        setDrawer('support');
      }
      if (command.id === 'recover' && result && typeof result === 'object') {
        const wrapped = result as { result?: GPUPoolRecoveryReport } & GPUPoolRecoveryReport;
        setLastRecovery(wrapped.result && typeof wrapped.result === 'object' ? wrapped.result : wrapped);
      }
      await load(usageWindow, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : `${command.label} failed`);
    } finally {
      setBusy(false);
      setPendingConfirm(null);
      setDestroyToken('');
    }
  }, [load, usageWindow]);

  const handleCommand = useCallback((command: CommandDescriptor) => {
    if (!command.enabled || !selectedService) return;
    const runtime = selectedService.runtime?.[0];
    if (!runtime?.serviceTag) return;
    if (command.confirm) {
      setDestroyToken('');
      setPendingConfirm({
        command,
        apiId: selectedService.apiId,
        serviceTag: runtime.serviceTag,
        node: runtime.publicIp || runtime.nodeId || '',
        sessions: runtime.activeSessions,
      });
      return;
    }
    void executeCommand(command, runtime.serviceTag, selectedService.apiId);
  }, [selectedService, executeCommand]);

  const attentionCount = useMemo(() => services.filter(needsAttention).length, [services]);

  if (loading && !data) {
    return (
      <div className="flex h-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-black/20 text-sm text-gray-300">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading AI services...
      </div>
    );
  }

  if (!data || !selectedService) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-gray-300">
        <p>{error || 'No AI services found.'}</p>
        <button
          type="button"
          onClick={() => void load(usageWindow)}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-white/12 bg-white/[0.04] px-3 text-xs font-semibold text-gray-100 transition hover:bg-white/[0.08]"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  const ledger = (
    <ServiceLedger
      services={filteredServices}
      totalCount={services.length}
      selectedApiId={selectedService.apiId}
      query={query}
      filter={filter}
      onQuery={setQuery}
      onFilter={(next) => setFilter(LEDGER_FILTER_IDS.includes(next) ? next : 'all')}
      onSelect={selectService}
    />
  );

  const workspace = (
    <ServiceWorkspace
      service={selectedService}
      responseWarnings={data.warnings || []}
      activeTab={activeTab}
      busy={busy}
      usageWindow={usageWindow}
      onTab={setTabChoice}
      onCommand={handleCommand}
      onBackToList={() => goToPane('backToList', true)}
      onOpenLogs={(lines) => {
        setDrawerLines(lines);
        setDrawer('logs');
      }}
      onUsageWindowChange={setUsageWindow}
      onUsagePreset={applyUsagePreset}
      onPolicySaved={() => load(usageWindow, true)}
      lastDiagnostics={lastDiagnostics}
      lastRecovery={lastRecovery}
    />
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="mb-2 grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-white/10 bg-black/25 px-3 py-2">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-white">AI Services</h1>
          <p className="truncate text-xs text-gray-400">
            Browse each AI API. Runtime, access, usage, and policy open from the selected row.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs text-gray-300">
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">APIs {data.fleet.totalServices}</span>
          {attentionCount > 0 && (
            <span className="hidden rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-100 sm:inline-flex">
              Attention {attentionCount}
            </span>
          )}
          <span className="hidden rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-100 md:inline-flex">
            Ready {data.fleet.readyRuntimes}
          </span>
          <span className="hidden rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-sky-100 lg:inline-flex">
            GPU {data.fleet.gpuBackedServices}
          </span>
          <button
            type="button"
            onClick={() => void load(usageWindow, true)}
            disabled={refreshing}
            title="Refresh AI services"
            className="rounded-md border border-white/10 p-1.5 text-gray-300 transition hover:bg-white/5 disabled:opacity-40"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-2 shrink-0 truncate rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100" title={error}>
          {error}
        </div>
      )}

      <nav aria-label="Workbench pane" className="mb-2 grid shrink-0 grid-cols-2 gap-2 lg:hidden">
        <button
          type="button"
          aria-pressed={mobilePane === 'list'}
          onClick={() => goToPane('backToList', true)}
          className={`rounded-md border px-3 py-2 text-xs font-semibold ${mobilePane === 'list' ? 'border-sky-400/40 bg-sky-500/10 text-sky-100' : 'border-white/10 bg-white/5 text-gray-300'}`}
        >
          List
        </button>
        <button
          type="button"
          aria-pressed={mobilePane === 'detail'}
          onClick={() => goToPane('showDetail', true)}
          className={`rounded-md border px-3 py-2 text-xs font-semibold ${mobilePane === 'detail' ? 'border-sky-400/40 bg-sky-500/10 text-sky-100' : 'border-white/10 bg-white/5 text-gray-300'}`}
        >
          Details
        </button>
      </nav>

      <div className="hidden min-h-0 flex-1 grid-cols-[clamp(280px,24vw,340px)_minmax(0,1fr)] gap-2 overflow-hidden lg:grid">
        {ledger}
        {workspace}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden lg:hidden">
        {mobilePane === 'list' ? ledger : workspace}
      </div>

      <DetailDrawer
        drawer={drawer}
        title={drawer === 'logs' ? 'Runtime logs' : 'Diagnostics summary'}
        subtitle={selectedService.runtime?.[0]?.serviceTag || selectedService.apiId}
        lines={drawerLines}
        onClose={() => setDrawer(null)}
      />
      <ConfirmModal
        pending={pendingConfirm}
        busy={busy}
        destroyToken={destroyToken}
        onDestroyToken={setDestroyToken}
        onCancel={() => {
          setPendingConfirm(null);
          setDestroyToken('');
        }}
        onConfirm={() => {
          if (pendingConfirm) {
            void executeCommand(pendingConfirm.command, pendingConfirm.serviceTag, pendingConfirm.apiId);
          }
        }}
      />
    </div>
  );
}
