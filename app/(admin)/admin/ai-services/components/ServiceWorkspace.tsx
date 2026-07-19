'use client';

import Link from 'next/link';
import { ChevronLeft, ExternalLink, FileText } from 'lucide-react';
import type { AISaaSServiceRecord, AISaaSWarning, GPUPoolDiagnosticsResult, GPUPoolRecoveryReport } from '../../../lib/apiService';
import {
  displayRuntimeStatus,
  hasGpuRuntime,
  humanStatus,
  primaryRuntime,
  type WorkbenchTabId,
} from '../workbenchModel';
import { StatusPill } from './primitives';
import CommandStrip, { type CommandDescriptor } from './CommandStrip';
import TabBar from './TabBar';
import OverviewTab from './tabs/OverviewTab';
import PublicApiTab from './tabs/PublicApiTab';
import RuntimeTab from './tabs/RuntimeTab';
import PolicyTab from './tabs/PolicyTab';
import AccessTab from './tabs/AccessTab';
import UsageTab, { type UsageWindow } from './tabs/UsageTab';
import FeedbackTab from './tabs/FeedbackTab';
import RecoveryTab from './tabs/RecoveryTab';

/**
 * Right pane: identity header, GPU command strip (GPU APIs only), domain tab
 * strip, and exactly one open domain panel. Config saves live inside tabs.
 */
export default function ServiceWorkspace({
  service,
  responseWarnings,
  activeTab,
  busy,
  usageWindow,
  onTab,
  onCommand,
  onBackToList,
  onOpenLogs,
  onUsageWindowChange,
  onUsagePreset,
  onPolicySaved,
  lastDiagnostics,
  lastRecovery,
}: {
  service: AISaaSServiceRecord;
  responseWarnings: AISaaSWarning[];
  activeTab: WorkbenchTabId;
  busy: boolean;
  usageWindow: UsageWindow;
  onTab: (tab: WorkbenchTabId) => void;
  onCommand: (command: CommandDescriptor) => void;
  onBackToList: () => void;
  onOpenLogs: (lines: string[]) => void;
  onUsageWindowChange: (next: UsageWindow) => void;
  onUsagePreset: (preset: 'all' | 'last7Days' | 'last30Days' | 'thisMonth') => void;
  onPolicySaved: () => void | Promise<void>;
  lastDiagnostics?: GPUPoolDiagnosticsResult | null;
  lastRecovery?: GPUPoolRecoveryReport | null;
}) {
  const runtime = primaryRuntime(service);
  const gpu = hasGpuRuntime(service);
  const runtimeStatus = runtime ? humanStatus(runtime.state) : null;
  const commandSummary = runtime
    ? `${runtime.serviceTag || runtime.runtimeId} · ${runtimeStatus?.label || runtime.state} · ${runtime.activeSessions} session${runtime.activeSessions === 1 ? '' : 's'}`
    : '';

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-black/20">
      <div className="shrink-0 border-b border-white/10 p-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-xl font-semibold text-white">{service.displayName}</h1>
              <StatusPill value={displayRuntimeStatus(service)} showRaw />
            </div>
            <p className="mt-1 flex min-w-0 items-center gap-2 text-xs text-gray-400">
              <span className="truncate font-mono text-sky-200/90">{service.apiId}</span>
              <span className="shrink-0 text-gray-600">·</span>
              <span className="truncate">{service.access.model}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onBackToList}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-2 text-[11px] font-semibold text-gray-200 transition hover:bg-white/5 lg:hidden"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              List
            </button>
            <Link
              href={service.public.tryApiPath || `/services/${encodeURIComponent(service.slug)}`}
              title="Open product page"
              className="rounded-md border border-white/10 p-2 text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
            <Link
              href={service.public.docsPath || '/api-docs'}
              title="Open docs"
              className="rounded-md border border-white/10 p-2 text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              <FileText className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {gpu && (
          <div className="mt-3">
            <CommandStrip runtime={runtime} busy={busy} summary={commandSummary} onCommand={onCommand} />
          </div>
        )}
      </div>

      <TabBar service={service} activeTab={activeTab} onTab={onTab} />

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {activeTab === 'overview' && <OverviewTab service={service} responseWarnings={responseWarnings} />}
        {activeTab === 'public' && <PublicApiTab service={service} />}
        {activeTab === 'runtime' && gpu && <RuntimeTab service={service} onSaved={onPolicySaved} />}
        {activeTab === 'policy' && <PolicyTab service={service} onSaved={onPolicySaved} />}
        {activeTab === 'access' && <AccessTab service={service} onSaved={onPolicySaved} />}
        {activeTab === 'usage' && (
          <UsageTab
            service={service}
            window={usageWindow}
            onWindowChange={onUsageWindowChange}
            onPreset={onUsagePreset}
          />
        )}
        {activeTab === 'feedback' && <FeedbackTab service={service} />}
        {activeTab === 'recovery' && gpu && (
          <RecoveryTab
            service={service}
            onOpenLogs={onOpenLogs}
            lastDiagnostics={lastDiagnostics}
            lastRecovery={lastRecovery}
          />
        )}
      </div>
    </div>
  );
}
