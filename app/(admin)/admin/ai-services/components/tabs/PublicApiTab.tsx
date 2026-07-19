'use client';

import Link from 'next/link';
import { ExternalLink, FileText } from 'lucide-react';
import type { AISaaSServiceRecord } from '../../../../lib/apiService';
import { capabilityCue, legacyAliasGroups } from '../../workbenchModel';
import { AdminSection, AliasChips, CapabilityHint, CopyValue, DataRow, StatusPill } from '../primitives';

/** Public contract: endpoint, docs, catalog identity, and legacy aliases. */
export default function PublicApiTab({ service }: { service: AISaaSServiceRecord }) {
  const cue = capabilityCue(service.public.configurable, service.public.blockedBy);

  return (
    <div className="grid h-full min-h-0 gap-3 xl:grid-cols-2">
      <AdminSection title="Public contract">
        <div className="grid gap-1">
          <DataRow label="API ID" value={<CopyValue value={service.apiId} />} title={service.apiId} />
          <DataRow label="Public slug" value={<CopyValue value={service.slug} />} title={service.slug} />
          <DataRow label="Status" value={<StatusPill value={service.public.status} showRaw />} />
          <DataRow label="Endpoint" value={<CopyValue value={service.public.endpoint || ''} />} title={service.public.endpoint} />
          <DataRow label="Config source" value={service.public.source || 'frontend catalog alias'} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={service.public.tryApiPath || `/services/${encodeURIComponent(service.slug)}`}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-white/12 bg-white/[0.04] px-3 text-xs font-semibold text-gray-100 transition hover:bg-white/[0.08]"
          >
            <ExternalLink className="h-4 w-4" />
            Open service page
          </Link>
          <Link
            href={service.public.docsPath || '/api-docs'}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-white/12 bg-white/[0.04] px-3 text-xs font-semibold text-gray-100 transition hover:bg-white/[0.08]"
          >
            <FileText className="h-4 w-4" />
            Open docs
          </Link>
        </div>
        <CapabilityHint hint={cue.hint} />
      </AdminSection>

      <AdminSection title="Compatibility aliases">
        <p className="mb-2 text-[11px] text-gray-500">Legacy identifiers that resolve to this API. Metadata only — never selection identity.</p>
        {legacyAliasGroups(service).map((group) => (
          <AliasChips key={group.label} label={group.label} values={group.values} />
        ))}
      </AdminSection>
    </div>
  );
}
