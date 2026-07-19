'use client';

import { useCallback, useEffect, useState } from 'react';
import { FileText, Gauge, Loader2, RefreshCw } from 'lucide-react';
import type {
  AISaaSServiceRecord,
  GPUPoolDiagnosticsResult,
  GPUPoolRecoveryReport,
} from '../../../../lib/apiService';
import { apiService } from '../../../../lib/apiService';
import { formatDate, primaryRuntime } from '../../workbenchModel';
import { fetchRuntimeFacts, type RuntimeFacts } from '../../lib/dataService';
import { AdminSection, DataRow, EmptyState, StatusPill } from '../primitives';

/**
 * Recovery: support view, sessions, jobs, diagnostics probe, recovery report,
 * and log access — GPU Control Plane Operations/Support parity for one API.
 */
export default function RecoveryTab({
  service,
  onOpenLogs,
  lastDiagnostics,
  lastRecovery,
}: {
  service: AISaaSServiceRecord;
  onOpenLogs: (lines: string[]) => void;
  lastDiagnostics?: GPUPoolDiagnosticsResult | null;
  lastRecovery?: GPUPoolRecoveryReport | null;
}) {
  const runtime = primaryRuntime(service);
  const serviceTag = runtime?.serviceTag || '';
  const [facts, setFacts] = useState<RuntimeFacts | null>(null);
  const [diagnostics, setDiagnostics] = useState<GPUPoolDiagnosticsResult | null>(lastDiagnostics || null);
  const [diagBusy, setDiagBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!serviceTag) return;
    setLoading(true);
    setError(null);
    try {
      const next = await fetchRuntimeFacts(serviceTag);
      setFacts(next);
      if (next.partial) setError('Some runtime facts could not be loaded.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load runtime facts.');
    } finally {
      setLoading(false);
    }
  }, [serviceTag]);

  useEffect(() => {
    setFacts(null);
    void load();
  }, [load]);

  useEffect(() => {
    if (lastDiagnostics) setDiagnostics(lastDiagnostics);
  }, [lastDiagnostics]);

  const runDiagnostics = async () => {
    if (!serviceTag) return;
    setDiagBusy(true);
    setError(null);
    try {
      const result = await apiService.runGpuPoolDiagnostics(serviceTag);
      setDiagnostics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Diagnostics failed');
    } finally {
      setDiagBusy(false);
    }
  };

  if (!runtime || !serviceTag) {
    return (
      <AdminSection title="Recovery">
        <EmptyState message="No GPU runtime resolved for this API, so there is nothing to recover." />
      </AdminSection>
    );
  }

  const support = facts?.support;
  const jobs = facts?.jobs || [];
  const sessions = support?.sessions || [];
  const logLines = facts?.logLines || [];
  const probe = diagnostics;

  return (
    <div className="h-full min-h-0 space-y-3 overflow-y-auto">
      <div className="grid gap-3 xl:grid-cols-2">
        <AdminSection
          title="Support view"
          action={(
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenLogs(logLines)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 text-[11px] font-semibold text-gray-100 transition hover:bg-white/[0.08]"
              >
                <FileText className="h-3.5 w-3.5" />
                View logs
              </button>
              <button
                type="button"
                onClick={() => void load()}
                disabled={loading}
                title="Reload runtime facts"
                className="inline-flex h-8 items-center rounded-md border border-white/10 bg-white/[0.04] px-2 text-gray-300 transition hover:bg-white/[0.08] disabled:opacity-40"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}
        >
          {error && <p className="mb-2 text-[11px] text-amber-200">{error}</p>}
          <div className="grid gap-1">
            <DataRow label="Service tag" value={<span className="font-mono text-[13px]">{serviceTag}</span>} />
            <DataRow label="State" value={<StatusPill value={support?.state || runtime.state} showRaw />} />
            <DataRow
              label="User start"
              value={support ? (support.canStart ? 'available' : 'blocked') : 'not probed'}
              tone={support ? (support.canStart ? 'good' : 'warn') : 'normal'}
            />
            <DataRow
              label="Maintenance"
              value={support ? (support.maintenanceBlock ? 'blocking new sessions' : 'not blocking') : 'not probed'}
              tone={support?.maintenanceBlock ? 'warn' : 'normal'}
            />
            <DataRow label="Node / IP" value={support?.publicIp || runtime.publicIp || runtime.nodeId || 'no node'} />
            <DataRow
              label="User error"
              value={support?.userFacingError || runtime.lastError || 'none'}
              tone={support?.userFacingError || runtime.lastError ? 'warn' : 'normal'}
              title={support?.userFacingError || runtime.lastError}
            />
            <DataRow label="Raw error" value={<span className="font-mono text-[12px]">{support?.lastErrorRaw || 'none'}</span>} title={support?.lastErrorRaw} />
          </div>
        </AdminSection>

        <AdminSection
          title="Live probe"
          action={(
            <button
              type="button"
              onClick={() => void runDiagnostics()}
              disabled={diagBusy}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 text-[11px] font-semibold text-gray-100 transition hover:bg-white/[0.08] disabled:opacity-40"
            >
              {diagBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Gauge className="h-3.5 w-3.5" />}
              Run diagnostics
            </button>
          )}
        >
          {!probe ? (
            <EmptyState message="Run diagnostics from here or the command strip to probe node + gateway health." />
          ) : (
            <div className="grid gap-1">
              <DataRow label="Node live" value={probe.nodeLive ? 'yes' : 'no'} tone={probe.nodeLive ? 'good' : 'warn'} />
              <DataRow label="Gateway health" value={probe.gatewayHealth ? 'ok' : 'down'} tone={probe.gatewayHealth ? 'good' : 'warn'} />
              <DataRow label="Provider nodes" value={String(probe.providerNodeCount ?? 0)} />
              <DataRow label="Public IP" value={probe.publicIp || 'none'} />
              <DataRow label="Node ID" value={probe.nodeId || 'none'} />
              <DataRow label="Probed at" value={formatDate(probe.probedAt)} />
              {probe.summary?.length ? (
                <div className="mt-2 space-y-1 rounded-md border border-white/10 bg-black/30 p-2">
                  {probe.summary.map((line) => (
                    <p key={line} className="text-[11px] text-gray-300">{line}</p>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </AdminSection>
      </div>

      {lastRecovery ? (
        <AdminSection title="Last recovery report">
          <div className="grid gap-1">
            <DataRow label="Action" value={lastRecovery.action} />
            <DataRow label="Recovered" value={lastRecovery.recovered ? 'yes' : 'no'} tone={lastRecovery.recovered ? 'good' : 'warn'} />
            <DataRow label="SSH reachable" value={lastRecovery.sshReachable ? 'yes' : 'no'} tone={lastRecovery.sshReachable ? 'good' : 'warn'} />
            <DataRow label="Provider nodes" value={String(lastRecovery.providerNodeCount)} />
            <DataRow label="Message" value={lastRecovery.message || 'none'} title={lastRecovery.message} />
            <DataRow label="Probed at" value={formatDate(lastRecovery.probedAt)} />
            {lastRecovery.notes?.length ? (
              <div className="mt-2 space-y-1 rounded-md border border-white/10 bg-black/30 p-2">
                {lastRecovery.notes.map((note) => (
                  <p key={note} className="text-[11px] text-gray-300">{note}</p>
                ))}
              </div>
            ) : null}
          </div>
        </AdminSection>
      ) : null}

      <AdminSection title="Support sessions">
        {sessions.length === 0 ? (
          <EmptyState message={loading ? 'Loading sessions…' : 'No support sessions recorded for this runtime.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[11px]">
              <thead className="text-gray-500">
                <tr>
                  <th className="px-2 py-1 font-semibold">User</th>
                  <th className="px-2 py-1 font-semibold">Started</th>
                  <th className="px-2 py-1 font-semibold">Stopped</th>
                  <th className="px-2 py-1 font-semibold">Credits</th>
                  <th className="px-2 py-1 font-semibold">Active</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={`${session.userId}-${session.startedAt}`} className="border-t border-white/5 text-gray-300">
                    <td className="px-2 py-1.5 font-mono">{session.userId}</td>
                    <td className="px-2 py-1.5">{formatDate(session.startedAt)}</td>
                    <td className="px-2 py-1.5">{session.stoppedAt ? formatDate(session.stoppedAt) : '—'}</td>
                    <td className="px-2 py-1.5">{session.creditsCharged ?? session.creditsStartupCharged ?? 0}</td>
                    <td className="px-2 py-1.5">{session.active ? 'yes' : 'no'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSection>

      <div className="grid gap-3 xl:grid-cols-2">
        <AdminSection title="Provision jobs">
          {jobs.length === 0 ? (
            <EmptyState message={loading ? 'Loading job history…' : 'No provision jobs recorded for this runtime.'} />
          ) : (
            <div className="grid gap-2">
              {jobs.slice(0, 10).map((job) => (
                <div key={job.id} className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-xs text-gray-200">{job.type}</span>
                    <StatusPill value={job.status} />
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-gray-500">
                    <span>attempts {job.attempts}/{job.maxAttempts}</span>
                    <span>{formatDate(job.startedAt || job.createdAt)}</span>
                  </div>
                  {job.lastError && (
                    <p className="mt-1 truncate text-[11px] text-amber-200" title={job.lastError}>{job.lastError}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </AdminSection>

        <AdminSection title="Provision log preview">
          {logLines.length === 0 ? (
            <EmptyState message={loading ? 'Loading logs…' : 'No provision log lines yet.'} />
          ) : (
            <pre className="max-h-64 overflow-auto rounded-md border border-white/10 bg-black/40 p-2 font-mono text-[10px] leading-relaxed text-gray-300">
              {logLines.slice(-40).join('\n')}
            </pre>
          )}
        </AdminSection>
      </div>
    </div>
  );
}
