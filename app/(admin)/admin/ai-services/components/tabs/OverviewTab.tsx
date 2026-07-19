'use client';

import type { AISaaSServiceRecord, AISaaSWarning } from '../../../../lib/apiService';
import {
  humanStatus,
  humanWarning,
  limitsText,
  mergeDetailWarnings,
  primaryRuntime,
  runtimeHasNode,
  sessionPricing,
} from '../../workbenchModel';
import { AdminSection, Badge, CopyValue, DataRow, StatusPill } from '../primitives';

/** Default tab: identity, health, and the facts an operator checks first. */
export default function OverviewTab({
  service,
  responseWarnings,
}: {
  service: AISaaSServiceRecord;
  responseWarnings: AISaaSWarning[];
}) {
  const runtime = primaryRuntime(service);
  const warnings = mergeDetailWarnings(service, responseWarnings);
  const readiness = humanStatus(service.readiness);

  return (
    <div className="grid h-full min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
      <AdminSection title="Service status">
        <div className="grid gap-1">
          <DataRow label="API ID" value={<CopyValue value={service.apiId} />} title={service.apiId} />
          <DataRow label="Status" value={<StatusPill value={service.readiness} showRaw />} tone={readiness.tone === 'ok' ? 'good' : readiness.tone === 'muted' ? 'normal' : 'warn'} />
          <DataRow label="Lifecycle" value={humanStatus(service.lifecycle).label} />
          <DataRow label="Endpoint" value={<CopyValue value={service.public.endpoint || ''} />} title={service.public.endpoint} />
          <DataRow label="Access" value={service.access.model} />
          <DataRow label="Pricing" value={service.policy.summary || sessionPricing(service)} />
          <DataRow label="Limits" value={limitsText(service)} />
          <DataRow label="Next action" value={service.nextSafeAction || 'No action required.'} />
        </div>

        {warnings.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Warnings</p>
            <div className="grid gap-1.5">
              {warnings.map((warning, index) => (
                <div key={`${warning.code}-${index}`} className="flex min-w-0 items-baseline gap-2 rounded-md border border-amber-400/20 bg-amber-500/[0.07] px-2.5 py-1.5 text-sm text-amber-50">
                  <span className="min-w-0 truncate" title={warning.message}>{humanWarning(warning)}</span>
                  <span className="ml-auto shrink-0 font-mono text-[10px] text-amber-200/60">{warning.code}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </AdminSection>

      <AdminSection title="Runtime summary">
        {runtime ? (
          <div className="grid gap-1">
            <DataRow label="State" value={<StatusPill value={runtime.state} showRaw />} />
            <DataRow label="Service tag" value={<span className="font-mono text-[13px]">{runtime.serviceTag || '-'}</span>} title={runtime.serviceTag} />
            <DataRow label="Provider" value={runtime.provider || runtime.provision?.primaryProvider || 'not set'} />
            <DataRow label="Node / IP" value={runtime.publicIp || runtime.nodeId || 'no node'} tone={runtimeHasNode(runtime) ? 'good' : 'normal'} />
            <DataRow label="Sessions" value={String(runtime.activeSessions)} />
            <DataRow label="Ref count" value={String(runtime.refCount)} />
            <DataRow label="Last issue" value={runtime.lastError || 'none'} tone={runtime.lastError ? 'warn' : 'normal'} title={runtime.lastError} />
          </div>
        ) : (
          <div className="grid gap-2">
            <p className="text-sm text-gray-400">Served entirely by the Automica API. No GPU runtime to manage.</p>
            <Badge>API-only</Badge>
          </div>
        )}
      </AdminSection>
    </div>
  );
}
