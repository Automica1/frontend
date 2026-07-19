'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AISaaSServiceRecord } from '../../../../lib/apiService';
import { capabilityCue, limitsText, sessionPricing } from '../../workbenchModel';
import {
  policyDraftFromService,
  policyDraftEquals,
  saveServicePolicy,
  type PolicyDraft,
} from '../../lib/dataService';
import {
  AdminField,
  AdminSection,
  CapabilityHint,
  DataRow,
  INPUT_CLASS,
  SectionSaveButton,
} from '../primitives';

function numberValue(value: number | null): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}

function numberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Policy: pricing and limits. Real inputs with a dirty Save in section chrome
 * when a write target exists; plain read-only rows plus a quiet hint when not.
 */
export default function PolicyTab({
  service,
  onSaved,
}: {
  service: AISaaSServiceRecord;
  onSaved: () => void | Promise<void>;
}) {
  const hasWriteTarget = service.policy.configurable || (service.aliases.betaServiceTags?.length || 0) > 0;
  const cue = capabilityCue(hasWriteTarget, service.policy.blockedBy);

  const initial = useMemo(() => policyDraftFromService(service), [service]);
  const [draft, setDraft] = useState<PolicyDraft>(initial);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    setDraft(initial);
    setSaveError(null);
    setSavedAt(null);
  }, [initial]);

  const dirty = !policyDraftEquals(draft, initial);

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await saveServicePolicy(service, draft);
      setSavedAt(new Date().toLocaleTimeString());
      await onSaved();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save policy');
    } finally {
      setSaving(false);
    }
  };

  if (!cue.writable) {
    return (
      <div className="grid h-full min-h-0 gap-3 xl:grid-cols-2">
        <AdminSection title="Limits">
          <div className="grid gap-1">
            <DataRow label="Upload size" value={service.policy.maxUploadSizeMB != null ? `${service.policy.maxUploadSizeMB} MB` : 'not set'} />
            <DataRow label="Pages" value={service.policy.maxPages != null ? `${service.policy.maxPages} pages` : 'not set'} />
            <DataRow label="Files" value={service.policy.maxFiles != null ? `${service.policy.maxFiles} files` : 'not set'} />
            <DataRow label="Formats" value={service.policy.allowedFormats?.join(', ') || 'not set'} />
            <DataRow label="Summary" value={limitsText(service)} />
          </div>
          <CapabilityHint hint={cue.hint} />
        </AdminSection>
        <AdminSection title="Pricing">
          <div className="grid gap-1">
            <DataRow label="Source" value={service.policy.source || 'none'} />
            <DataRow label="Mode" value={service.policy.pricingMode || 'not set'} />
            <DataRow label="Per hit" value={service.policy.creditsPerHit != null ? `${service.policy.creditsPerHit} credits` : 'not set'} />
            <DataRow label="Per page" value={service.policy.creditsPerPage != null ? `${service.policy.creditsPerPage} credits` : 'not set'} />
            <DataRow label="Session" value={sessionPricing(service)} />
            <DataRow label="Notes" value={service.policy.notes || 'none'} title={service.policy.notes} />
          </div>
        </AdminSection>
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
      <AdminSection
        title="Policy editor"
        action={<SectionSaveButton dirty={dirty} saving={saving} onSave={() => void save()} />}
      >
        {saveError && (
          <p className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{saveError}</p>
        )}
        {savedAt && !dirty && <p className="mb-3 text-xs text-emerald-200">Saved at {savedAt}.</p>}

        <div className="grid gap-3">
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Limits</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <AdminField label="Max upload size (MB)">
                <input
                  type="number"
                  min="0"
                  value={numberValue(draft.maxUploadSizeMB)}
                  onChange={(event) => setDraft((current) => ({ ...current, maxUploadSizeMB: numberOrNull(event.target.value) }))}
                  placeholder="Optional"
                  className={INPUT_CLASS}
                />
              </AdminField>
              <AdminField label="Max pages">
                <input
                  type="number"
                  min="0"
                  value={numberValue(draft.maxPages)}
                  onChange={(event) => setDraft((current) => ({ ...current, maxPages: numberOrNull(event.target.value) }))}
                  placeholder="Optional"
                  className={INPUT_CLASS}
                />
              </AdminField>
              <AdminField label="Max files">
                <input
                  type="number"
                  min="0"
                  value={numberValue(draft.maxFiles)}
                  onChange={(event) => setDraft((current) => ({ ...current, maxFiles: numberOrNull(event.target.value) }))}
                  placeholder="Optional"
                  className={INPUT_CLASS}
                />
              </AdminField>
              <AdminField label="Allowed formats" hint="Comma separated, e.g. PDF, JPG, PNG">
                <input
                  value={draft.allowedFormats.join(', ')}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    allowedFormats: event.target.value.split(',').map((entry) => entry.trim().toUpperCase()).filter(Boolean),
                  }))}
                  placeholder="PDF, JPG, PNG"
                  className={INPUT_CLASS}
                />
              </AdminField>
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Pricing</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <AdminField label="Pricing mode">
                <select
                  value={draft.pricingMode}
                  onChange={(event) => setDraft((current) => ({ ...current, pricingMode: event.target.value }))}
                  className={INPUT_CLASS}
                >
                  <option value="per_hit">Per hit</option>
                  <option value="per_page">Per page</option>
                  <option value="session">Session</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </AdminField>
              <AdminField label="Credits per hit">
                <input
                  type="number"
                  min="0"
                  value={numberValue(draft.creditsPerHit)}
                  onChange={(event) => setDraft((current) => ({ ...current, creditsPerHit: numberOrNull(event.target.value) }))}
                  placeholder="Optional"
                  className={INPUT_CLASS}
                />
              </AdminField>
              <AdminField label="Credits per page">
                <input
                  type="number"
                  min="0"
                  value={numberValue(draft.creditsPerPage)}
                  onChange={(event) => setDraft((current) => ({ ...current, creditsPerPage: numberOrNull(event.target.value) }))}
                  placeholder="Optional"
                  className={INPUT_CLASS}
                />
              </AdminField>
              <AdminField label="Session start credits">
                <input
                  type="number"
                  min="0"
                  value={numberValue(draft.startupCredits)}
                  onChange={(event) => setDraft((current) => ({ ...current, startupCredits: numberOrNull(event.target.value) }))}
                  placeholder="Optional"
                  className={INPUT_CLASS}
                />
              </AdminField>
              <AdminField label="Runtime credits per minute">
                <input
                  type="number"
                  min="0"
                  value={numberValue(draft.creditsPerMinute)}
                  onChange={(event) => setDraft((current) => ({ ...current, creditsPerMinute: numberOrNull(event.target.value) }))}
                  placeholder="Optional"
                  className={INPUT_CLASS}
                />
              </AdminField>
              <AdminField label="Notes">
                <input
                  value={draft.notes}
                  onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="Optional policy note"
                  className={INPUT_CLASS}
                />
              </AdminField>
            </div>
          </div>
        </div>
      </AdminSection>

      <AdminSection title="Effective policy">
        <div className="grid gap-1">
          <DataRow label="Source" value={service.policy.source || 'none'} />
          <DataRow label="Upload size" value={draft.maxUploadSizeMB != null ? `${draft.maxUploadSizeMB} MB` : 'unbounded'} />
          <DataRow label="Pages" value={draft.maxPages != null ? `${draft.maxPages} pages` : 'open'} />
          <DataRow label="Files" value={draft.maxFiles != null ? `${draft.maxFiles} files` : 'open'} />
          <DataRow label="Formats" value={draft.allowedFormats.join(', ') || 'open'} />
          <DataRow label="Mode" value={draft.pricingMode} />
          <DataRow label="Per hit" value={draft.creditsPerHit != null ? `${draft.creditsPerHit} credits` : 'unset'} />
          <DataRow label="Per page" value={draft.creditsPerPage != null ? `${draft.creditsPerPage} credits` : 'unset'} />
          <DataRow label="Session" value={`${draft.startupCredits ?? 0} start + ${draft.creditsPerMinute ?? 0}/min`} />
        </div>
        <p className="mt-3 text-[11px] text-gray-500">
          Saves land on this API&apos;s beta service policy record — the same target the Beta Access page edits.
        </p>
      </AdminSection>
    </div>
  );
}
