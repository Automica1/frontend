'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { AISaaSRuntimeProfile, AISaaSServiceRecord, GPUProvisionConfig, RegistryImageCatalog, RegistryImageTag } from '../../../../lib/apiService';
import { apiService } from '../../../../lib/apiService';
import {
  applyRegistryProviderPreset,
  emptyRegistryDraft,
  loadServiceProvision,
  loadServiceRegistry,
  registryDraftEquals,
  registryDraftFromSettings,
  resolveRegistryOwnerTag,
  saveServiceProvision,
  saveServiceRegistry,
  type RegistryDraft,
} from '../../lib/dataService';
import {
  AdminField,
  CapabilityHint,
  DataRow,
  EmptyState,
  INPUT_CLASS,
  MiniStat,
  SectionSaveButton,
  StatusPill,
} from '../primitives';

type ProviderName = 'e2e' | 'aws' | 'gcp' | 'none';

/**
 * Runtime tab: one outer scroll. Live facts stay read-only. Registry + infra
 * load their owning documents when opened — empty fields mean empty storage.
 */
export default function RuntimeTab({
  service,
  onSaved,
}: {
  service: AISaaSServiceRecord;
  onSaved: () => void | Promise<void>;
}) {
  const runtimes = service.runtime || [];

  if (runtimes.length === 0) {
    return (
      <div className="h-full min-h-0 overflow-y-auto">
        <RuntimeSection title="Runtime">
          <EmptyState message="No GPU runtime profile resolved for this API." />
        </RuntimeSection>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 space-y-3 overflow-y-auto pr-0.5">
      {runtimes.map((runtime) => (
        <div key={runtime.runtimeId} className="space-y-3">
          <RuntimeProfileCard runtime={runtime} />
          <RegistryEditor service={service} runtime={runtime} onSaved={onSaved} />
          <ProvisionPolicyEditor service={service} runtime={runtime} onSaved={onSaved} />
          <InfrastructureEditor service={service} runtime={runtime} onSaved={onSaved} />
        </div>
      ))}
    </div>
  );
}

/** Auto-height card — never h-full, so stacked panels do not clip each other. */
function RuntimeSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="shrink-0 rounded-lg border border-white/10 bg-black/20">
      <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {action}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

function RuntimeProfileCard({ runtime }: { runtime: AISaaSRuntimeProfile }) {
  const hasNode = Boolean(runtime.publicIp || runtime.nodeId);
  const nextProvider = runtime.provision?.primaryProvider || runtime.provider || '';
  const liveProvider = hasNode ? runtime.provider || nextProvider : nextProvider;
  const registryLabel = [
    runtime.registry?.provider,
    runtime.registry?.imageTag || runtime.deployVersion,
  ]
    .filter(Boolean)
    .join(':');
  const liveJob = runtime.jobs?.find((job) => job.status === 'pending' || job.status === 'running');
  const failedJob =
    !liveJob &&
    runtime.jobs?.find((job) => job.status === 'failed' || job.status === 'dead' || Boolean(job.lastError));

  return (
    <RuntimeSection title="Live runtime">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill value={runtime.state} showRaw />
        <span className="break-all font-mono text-xs text-gray-300">{runtime.serviceTag || runtime.runtimeId}</span>
        {runtime.routeAliases && runtime.routeAliases.length > 0 ? (
          <span className="text-xs text-gray-500" title="Legacy gateway path; same policy">
            also serves {runtime.routeAliases.join(', ')}
          </span>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-3">
        <MiniStat
          label={hasNode ? 'Cloud' : 'Next start'}
          value={liveProvider || 'not set'}
        />
        <MiniStat label="Node / IP" value={runtime.publicIp || runtime.nodeId || 'none'} />
        <MiniStat label="Sessions" value={String(runtime.activeSessions)} />
      </div>

      <div className="mt-3 grid gap-1">
        {registryLabel ? <DataRow label="Registry image" value={registryLabel} title={registryLabel} /> : null}
        {liveJob ? (
          <DataRow
            label="Job"
            value={`${liveJob.type} · ${liveJob.status} · ${liveJob.attempts}/${liveJob.maxAttempts}`}
            title={liveJob.lastError}
          />
        ) : null}
        {failedJob ? (
          <DataRow
            label="Last failed job"
            value={`${failedJob.type} · ${failedJob.status}`}
            tone="warn"
            title={failedJob.lastError}
          />
        ) : null}
        {runtime.lastError ? (
          <DataRow label="Last issue" value={runtime.lastError} tone="warn" title={runtime.lastError} />
        ) : null}
      </div>
    </RuntimeSection>
  );
}

function RegistryEditor({
  service,
  runtime,
  onSaved,
}: {
  service: AISaaSServiceRecord;
  runtime: AISaaSRuntimeProfile;
  onSaved: () => void | Promise<void>;
}) {
  const ownerTag = resolveRegistryOwnerTag(service, runtime.serviceTag || runtime.runtimeId);
  const [baseline, setBaseline] = useState<RegistryDraft>(emptyRegistryDraft());
  const [draft, setDraft] = useState<RegistryDraft>(emptyRegistryDraft());
  const [docExists, setDocExists] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(Boolean(ownerTag));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<RegistryImageCatalog | null>(null);
  const [catalogImage, setCatalogImage] = useState('');

  const reload = async () => {
    if (!ownerTag) return;
    setLoading(true);
    setError(null);
    try {
      const loaded = await loadServiceRegistry(ownerTag);
      const next = registryDraftFromSettings(loaded.settings);
      setDocExists(loaded.exists);
      setBaseline(next);
      setDraft(next);
      setSavedAt(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load registry settings');
      setDocExists(false);
      setBaseline(emptyRegistryDraft());
      setDraft(emptyRegistryDraft());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerTag, service.apiId]);

  const dirty = !registryDraftEquals(draft, baseline);

  const selectProvider = (provider: string) => {
    setDraft((current) => applyRegistryProviderPreset(current, provider));
    setError(null);
  };

  const save = async () => {
    if (!ownerTag) return;
    if (!draft.provider) {
      setError('Pick GHCR or ECR — Automica fills the rest.');
      return;
    }
    const payload =
      draft.provider === 'ghcr' || draft.provider === 'ecr'
        ? applyRegistryProviderPreset(draft, draft.provider)
        : draft;
    setSaving(true);
    setError(null);
    try {
      await saveServiceRegistry(service, payload, ownerTag);
      const loaded = await loadServiceRegistry(ownerTag);
      const next = registryDraftFromSettings(loaded.settings);
      setDocExists(loaded.exists);
      setBaseline(next);
      setDraft(next);
      setSavedAt(new Date().toLocaleTimeString());
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save registry');
    } finally {
      setSaving(false);
    }
  };

  const browseTags = async (imageOverride?: string) => {
    const provider = draft.provider === 'ghcr' || draft.provider === 'ecr' ? draft.provider : undefined;
    if (!provider) {
      setCatalogError('Pick GHCR or ECR before browsing tags.');
      setCatalogOpen(true);
      return;
    }
    setCatalogOpen(true);
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const next = await apiService.listAIServiceRegistryImages(service.apiId, {
        runtimeProfile: runtime.runtimeId,
        provider,
        image: imageOverride || catalogImage || undefined,
      });
      setCatalog(next);
      if (!catalogImage && next.relatedRepos?.length) {
        const primary = next.repository.split('/').pop() || '';
        setCatalogImage(primary);
      }
    } catch (err) {
      setCatalog(null);
      setCatalogError(err instanceof Error ? err.message : 'Failed to list registry tags');
    } finally {
      setCatalogLoading(false);
    }
  };

  const pickTag = (tag: RegistryImageTag) => {
    setDraft((current) => ({ ...current, imageTag: tag.name }));
    setCatalogOpen(false);
  };

  if (!ownerTag) {
    return (
      <RuntimeSection title="Deployment registry">
        <CapabilityHint hint="No service-tag registry owner resolved for this API. Add a beta or GPU service tag alias first." />
      </RuntimeSection>
    );
  }

  return (
    <RuntimeSection
      title="Deployment registry"
      action={(
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] text-gray-500">{ownerTag}</span>
          <button
            type="button"
            disabled={loading || saving}
            onClick={() => void reload()}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2.5 text-[11px] font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Reload
          </button>
          <button
            type="button"
            disabled={!dirty || saving || loading}
            onClick={() => setDraft(baseline)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2.5 text-[11px] font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-40"
          >
            Reset
          </button>
          <SectionSaveButton dirty={dirty} saving={saving} onSave={() => void save()} />
        </div>
      )}
    >
      {error ? <p className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</p> : null}
      {savedAt && !dirty ? <p className="mb-3 text-xs text-emerald-200">Saved at {savedAt}.</p> : null}
      {!loading && !docExists ? (
        <CapabilityHint hint={`No registry document for tag ${ownerTag} yet — Save writes Automica defaults for the selected provider.`} />
      ) : null}

      {loading ? (
        <p className="text-xs text-gray-500">Loading registry settings…</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField label="Registry">
              <select
                value={draft.provider === 'ghcr' || draft.provider === 'ecr' ? draft.provider : draft.provider ? 'custom' : ''}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value === 'custom') {
                    setShowAdvanced(true);
                    setDraft((current) => ({ ...current, provider: current.provider && current.provider !== 'ghcr' && current.provider !== 'ecr' ? current.provider : 'custom' }));
                    return;
                  }
                  selectProvider(value);
                }}
                className={INPUT_CLASS}
              >
                <option value="">Not set</option>
                <option value="ghcr">GHCR (Automica default)</option>
                <option value="ecr">ECR (Automica default)</option>
                <option value="custom">Custom / other</option>
              </select>
            </AdminField>
            <AdminField label="Image tag">
              <div className="flex gap-2">
                <input
                  value={draft.imageTag}
                  onChange={(event) => setDraft((current) => ({ ...current, imageTag: event.target.value }))}
                  className={`${INPUT_CLASS} flex-1`}
                  placeholder="dev2"
                />
                <button
                  type="button"
                  disabled={loading || saving || catalogLoading || (draft.provider !== 'ghcr' && draft.provider !== 'ecr')}
                  onClick={() => void browseTags()}
                  className="inline-flex shrink-0 items-center rounded-md border border-sky-500/40 bg-sky-500/10 px-2.5 text-[11px] font-semibold text-sky-100 hover:bg-sky-500/20 disabled:opacity-40"
                >
                  {catalogLoading ? '…' : 'Browse tags'}
                </button>
              </div>
            </AdminField>
          </div>

          {catalogOpen ? (
            <div className="mt-3 rounded-md border border-white/10 bg-black/40 p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-gray-200">
                  Live tags{catalog?.repository ? ` · ${catalog.repository}` : ''}
                </p>
                <button
                  type="button"
                  onClick={() => setCatalogOpen(false)}
                  className="text-[11px] text-gray-400 hover:text-gray-200"
                >
                  Close
                </button>
              </div>
              {catalog?.relatedRepos && catalog.relatedRepos.length > 1 ? (
                <div className="flex flex-wrap gap-2">
                  {catalog.relatedRepos.map((img) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => {
                        setCatalogImage(img);
                        void browseTags(img);
                      }}
                      className={`rounded border px-2 py-0.5 font-mono text-[10px] ${
                        catalogImage === img || catalog.repository.endsWith(`/${img}`)
                          ? 'border-sky-400/50 text-sky-100'
                          : 'border-white/10 text-gray-400 hover:border-white/25'
                      }`}
                    >
                      {img}
                    </button>
                  ))}
                </div>
              ) : null}
              {catalogError ? <p className="text-xs text-red-200">{catalogError}</p> : null}
              {catalogLoading ? <p className="text-xs text-gray-500">Querying registry…</p> : null}
              {!catalogLoading && catalog?.message ? <p className="text-xs text-amber-200/90">{catalog.message}</p> : null}
              {!catalogLoading && catalog && catalog.tags.length > 0 ? (
                <ul className="max-h-48 space-y-1 overflow-y-auto">
                  {catalog.tags.map((tag) => (
                    <li key={`${tag.name}-${tag.digest || ''}`}>
                      <button
                        type="button"
                        onClick={() => pickTag(tag)}
                        className="flex w-full items-center justify-between gap-3 rounded px-2 py-1.5 text-left text-[11px] hover:bg-white/5"
                      >
                        <span className="font-mono text-emerald-100">{tag.name}</span>
                        <span className="shrink-0 text-gray-500">
                          {tag.pushedAt ? new Date(tag.pushedAt).toLocaleString() : '—'}
                          {tag.sizeBytes ? ` · ${Math.round(tag.sizeBytes / 1e6)}MB` : ''}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {catalog?.source ? (
                <p className="text-[10px] text-gray-600">source={catalog.source}{catalog.region ? ` · ${catalog.region}` : ''}</p>
              ) : null}
              <p className="text-[10px] text-gray-500">Selecting a tag updates the draft only — Save to persist.</p>
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-300">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.preferRegistryPull}
                onChange={(event) => setDraft((current) => ({ ...current, preferRegistryPull: event.target.checked }))}
              />
              Prefer registry pull
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.loginRequired}
                onChange={(event) => setDraft((current) => ({ ...current, loginRequired: event.target.checked }))}
              />
              Login required
            </label>
          </div>

          {(draft.provider === 'ghcr' || draft.provider === 'ecr') && (
            <p className="mt-3 rounded-md border border-white/10 bg-black/30 px-3 py-2 font-mono text-[11px] leading-relaxed text-gray-400">
              {draft.provider === 'ecr'
                ? `${draft.server || '…'}/${draft.namespace || 'automica-ai'}:… · region ${draft.region || 'eu-north-1'} · auth aws`
                : `${draft.server || 'ghcr.io'}/${draft.namespace || 'automica-ai'}:… · auth token`}
              {' · '}credentials from pipeline env, not this form
            </p>
          )}

          <button
            type="button"
            onClick={() => setShowAdvanced((value) => !value)}
            className="mt-3 text-[11px] font-semibold text-sky-300/90 hover:text-sky-200"
          >
            {showAdvanced ? 'Hide advanced overrides' : 'Advanced overrides'}
          </button>

          {showAdvanced ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <AdminField label="Provider id">
                <select
                  value={draft.provider}
                  onChange={(event) => selectProvider(event.target.value)}
                  className={INPUT_CLASS}
                >
                  <option value="">Not set</option>
                  <option value="ghcr">ghcr</option>
                  <option value="ecr">ecr</option>
                  <option value="gcr">gcr</option>
                  <option value="gar">gar</option>
                  <option value="dockerhub">dockerhub</option>
                  <option value="acr">acr</option>
                  <option value="quay">quay</option>
                  <option value="custom">custom</option>
                </select>
              </AdminField>
              <AdminField label="Auth mode">
                <select
                  value={draft.auth}
                  onChange={(event) => setDraft((current) => ({ ...current, auth: event.target.value }))}
                  className={INPUT_CLASS}
                >
                  <option value="">Not set</option>
                  <option value="none">None</option>
                  <option value="token">Token</option>
                  <option value="basic">Basic</option>
                  <option value="aws">AWS</option>
                  <option value="gcp">GCP</option>
                  <option value="azure">Azure</option>
                </select>
              </AdminField>
              <AdminField label="Server">
                <input
                  value={draft.server}
                  onChange={(event) => setDraft((current) => ({ ...current, server: event.target.value }))}
                  className={INPUT_CLASS}
                />
              </AdminField>
              <AdminField label="Namespace">
                <input
                  value={draft.namespace}
                  onChange={(event) => setDraft((current) => ({ ...current, namespace: event.target.value }))}
                  className={INPUT_CLASS}
                />
              </AdminField>
              <AdminField label="Region">
                <input
                  value={draft.region}
                  onChange={(event) => setDraft((current) => ({ ...current, region: event.target.value }))}
                  className={INPUT_CLASS}
                />
              </AdminField>
            </div>
          ) : null}

          <p className="mt-2 text-[11px] text-gray-500">
            Switching GHCR ↔ ECR applies Automica script defaults (account/region/server/namespace). You only change image tag unless you open advanced.
          </p>
        </>
      )}
    </RuntimeSection>
  );
}

function ProvisionPolicyEditor({
  service,
  runtime,
  onSaved,
}: {
  service: AISaaSServiceRecord;
  runtime: AISaaSRuntimeProfile;
  onSaved: () => void | Promise<void>;
}) {
  const serviceTag = runtime.serviceTag;
  const [config, setConfig] = useState<GPUProvisionConfig | null>(null);
  const [baseline, setBaseline] = useState('');
  const [policySummary, setPolicySummary] = useState('');
  const [loading, setLoading] = useState(Boolean(serviceTag));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const reload = async () => {
    if (!serviceTag) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getGpuPoolPolicy(serviceTag);
      setConfig(response.policy);
      setBaseline(JSON.stringify(response.policy));
      setPolicySummary(response.policySummary || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load provision policy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceTag]);

  const dirty = Boolean(config && baseline && JSON.stringify(config) !== baseline);

  const save = async () => {
    if (!config || !serviceTag) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await saveServiceProvision(service, config, {
        runtimeProfile: serviceTag,
        expectedUpdatedAt: config.updatedAt,
      });
      setConfig(updated);
      setBaseline(JSON.stringify(updated));
      setSavedAt(new Date().toLocaleTimeString());
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save provision policy');
    } finally {
      setSaving(false);
    }
  };

  if (!serviceTag) return null;

  return (
    <RuntimeSection
      title="Provision policy"
      action={(
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={loading || saving} onClick={() => void reload()} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2.5 text-[11px] font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-40">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Reload
          </button>
          <button type="button" disabled={!dirty || saving || !config} onClick={() => setConfig(JSON.parse(baseline) as GPUProvisionConfig)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2.5 text-[11px] font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-40">
            Reset
          </button>
          <SectionSaveButton dirty={dirty} saving={saving} onSave={() => void save()} />
        </div>
      )}
    >
      {policySummary ? <p className="mb-3 text-[11px] text-gray-400">{policySummary}</p> : null}
      {error ? <p className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</p> : null}
      {savedAt && !dirty ? <p className="mb-3 text-xs text-emerald-200">Saved at {savedAt}.</p> : null}
      {loading && !config ? (
        <p className="text-xs text-gray-500">Loading provision policy…</p>
      ) : !config ? (
        <CapabilityHint hint="Could not load provision policy for editing." />
      ) : (
        <>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Cold start</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <AdminField label="SSH wait primary (sec)">
              <input type="number" min={60} max={1800} value={config.timeouts.sshReadyPrimarySec ?? ''} onChange={(e) => setConfig((c) => c ? { ...c, timeouts: { ...c.timeouts, sshReadyPrimarySec: e.target.value === '' ? undefined : Number(e.target.value) } } : c)} className={INPUT_CLASS} />
            </AdminField>
            <AdminField label="SSH wait fallback (sec)">
              <input type="number" min={60} max={900} value={config.timeouts.sshReadyFallbackSec ?? ''} onChange={(e) => setConfig((c) => c ? { ...c, timeouts: { ...c.timeouts, sshReadyFallbackSec: e.target.value === '' ? undefined : Number(e.target.value) } } : c)} className={INPUT_CLASS} />
            </AdminField>
            <AdminField label="Deploy health (sec)">
              <input type="number" min={30} max={600} value={config.timeouts.deployHealthSec ?? ''} onChange={(e) => setConfig((c) => c ? { ...c, timeouts: { ...c.timeouts, deployHealthSec: e.target.value === '' ? undefined : Number(e.target.value) } } : c)} className={INPUT_CLASS} />
            </AdminField>
            <AdminField label="E2E wait (sec)">
              <input type="number" min={120} max={2400} value={config.timeouts.e2eWaitSec ?? ''} onChange={(e) => setConfig((c) => c ? { ...c, timeouts: { ...c.timeouts, e2eWaitSec: e.target.value === '' ? undefined : Number(e.target.value) } } : c)} className={INPUT_CLASS} />
            </AdminField>
            <AdminField label="E2E stall (sec)">
              <input type="number" min={60} max={900} value={config.timeouts.e2eStallSec ?? ''} onChange={(e) => setConfig((c) => c ? { ...c, timeouts: { ...c.timeouts, e2eStallSec: e.target.value === '' ? undefined : Number(e.target.value) } } : c)} className={INPUT_CLASS} />
            </AdminField>
            <AdminField label="E2E teardown (sec)">
              <input type="number" min={60} max={600} value={config.timeouts.e2eDestroyWaitSec ?? ''} onChange={(e) => setConfig((c) => c ? { ...c, timeouts: { ...c.timeouts, e2eDestroyWaitSec: e.target.value === '' ? undefined : Number(e.target.value) } } : c)} className={INPUT_CLASS} />
            </AdminField>
            <AdminField label="Provision retries">
              <input type="number" min={1} max={5} value={config.retries.provisionMaxAttempts ?? ''} onChange={(e) => setConfig((c) => c ? { ...c, retries: { ...c.retries, provisionMaxAttempts: e.target.value === '' ? undefined : Number(e.target.value) } } : c)} className={INPUT_CLASS} />
            </AdminField>
            <AdminField label="Destroy retries">
              <input type="number" min={1} max={5} value={config.retries.destroyMaxAttempts ?? ''} onChange={(e) => setConfig((c) => c ? { ...c, retries: { ...c.retries, destroyMaxAttempts: e.target.value === '' ? undefined : Number(e.target.value) } } : c)} className={INPUT_CLASS} />
            </AdminField>
            <AdminField label="User retry hint (min)">
              <input type="number" min={1} max={60} value={config.lifecycle.userRetryHintMin ?? ''} onChange={(e) => setConfig((c) => c ? { ...c, lifecycle: { ...c.lifecycle, userRetryHintMin: e.target.value === '' ? undefined : Number(e.target.value) } } : c)} className={INPUT_CLASS} />
            </AdminField>
          </div>
          <label className="mt-3 inline-flex items-center gap-2 text-xs text-gray-300">
            <input type="checkbox" checked={Boolean(config.retries.reuseNodeOnRetry)} onChange={(e) => setConfig((c) => c ? { ...c, retries: { ...c.retries, reuseNodeOnRetry: e.target.checked } } : c)} />
            Reuse partial VM on retry
          </label>

          <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Hot / idle</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <AdminField label="Idle grace (min)">
              <input type="number" min={1} max={60} value={config.lifecycle.gracePeriodMin ?? ''} onChange={(e) => setConfig((c) => c ? { ...c, lifecycle: { ...c.lifecycle, gracePeriodMin: e.target.value === '' ? undefined : Number(e.target.value) } } : c)} className={INPUT_CLASS} />
            </AdminField>
            <AdminField label="Reconnect cooldown (sec)">
              <input type="number" min={0} value={config.lifecycle.reconnectCooldownSec ?? ''} onChange={(e) => setConfig((c) => c ? { ...c, lifecycle: { ...c.lifecycle, reconnectCooldownSec: e.target.value === '' ? undefined : Number(e.target.value) } } : c)} className={INPUT_CLASS} />
            </AdminField>
            <AdminField label="No-job stuck (min)">
              <input type="number" min={5} max={120} value={config.lifecycle.stuckProvisionNoJobMin ?? ''} onChange={(e) => setConfig((c) => c ? { ...c, lifecycle: { ...c.lifecycle, stuckProvisionNoJobMin: e.target.value === '' ? undefined : Number(e.target.value) } } : c)} className={INPUT_CLASS} />
            </AdminField>
            <AdminField label="Zombie job (min)">
              <input type="number" min={10} max={180} value={config.lifecycle.stuckProvisionZombieMin ?? ''} onChange={(e) => setConfig((c) => c ? { ...c, lifecycle: { ...c.lifecycle, stuckProvisionZombieMin: e.target.value === '' ? undefined : Number(e.target.value) } } : c)} className={INPUT_CLASS} />
            </AdminField>
          </div>

          <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Maintenance</p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-300">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={Boolean(config.flags.maintenanceMode)} onChange={(e) => setConfig((c) => c ? { ...c, flags: { ...c.flags, maintenanceMode: e.target.checked } } : c)} />
              Maintenance mode
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={Boolean(config.flags.blockNewSessions)} onChange={(e) => setConfig((c) => c ? { ...c, flags: { ...c.flags, blockNewSessions: e.target.checked } } : c)} />
              Block new sessions
            </label>
          </div>
          <AdminField label="Maintenance message">
            <input value={config.flags.maintenanceMessage || ''} onChange={(e) => setConfig((c) => c ? { ...c, flags: { ...c.flags, maintenanceMessage: e.target.value } } : c)} className={INPUT_CLASS} placeholder="Shown when blocked" />
          </AdminField>
          <p className="mt-2 text-[11px] text-gray-500">GPU cold/hot knobs — separate from product Policy (pricing/limits).</p>
        </>
      )}
    </RuntimeSection>
  );
}

function InfrastructureEditor({
  service,
  runtime,
  onSaved,
}: {
  service: AISaaSServiceRecord;
  runtime: AISaaSRuntimeProfile;
  onSaved: () => void | Promise<void>;
}) {
  const serviceTag = runtime.serviceTag;
  const [config, setConfig] = useState<GPUProvisionConfig | null>(null);
  const [baseline, setBaseline] = useState('');
  const [loading, setLoading] = useState(Boolean(serviceTag));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const reload = async () => {
    if (!serviceTag) return;
    setLoading(true);
    setError(null);
    try {
      const policy = await loadServiceProvision(serviceTag);
      setConfig(policy);
      setBaseline(JSON.stringify(policy));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load provision config');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceTag]);

  const dirty = Boolean(config && baseline && JSON.stringify(config) !== baseline);

  const save = async () => {
    if (!config || !serviceTag) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await saveServiceProvision(service, config, {
        runtimeProfile: serviceTag,
        expectedUpdatedAt: config.updatedAt,
      });
      setConfig(updated);
      setBaseline(JSON.stringify(updated));
      setSavedAt(new Date().toLocaleTimeString());
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save provision config');
    } finally {
      setSaving(false);
    }
  };

  if (!serviceTag) {
    return (
      <RuntimeSection title="Infrastructure">
        <CapabilityHint hint="No GPU service tag resolved for provision writes." />
      </RuntimeSection>
    );
  }

  return (
    <RuntimeSection
      title="Infrastructure"
      action={(
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={loading || saving}
            onClick={() => void reload()}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2.5 text-[11px] font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Reload
          </button>
          <button
            type="button"
            disabled={!dirty || saving || !config}
            onClick={() => setConfig(JSON.parse(baseline) as GPUProvisionConfig)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2.5 text-[11px] font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-40"
          >
            Reset
          </button>
          <SectionSaveButton dirty={dirty} saving={saving} onSave={() => void save()} />
        </div>
      )}
    >
      {error ? <p className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</p> : null}
      {savedAt && !dirty ? <p className="mb-3 text-xs text-emerald-200">Saved at {savedAt}.</p> : null}

      {loading && !config ? (
        <p className="text-xs text-gray-500">Loading provision config…</p>
      ) : !config ? (
        <div className="grid gap-1">
          <DataRow label="Primary" value={runtime.provision?.primaryProvider || 'not set'} />
          <DataRow label="Fallback" value={runtime.provision?.fallbackProvider || 'not set'} />
          <DataRow
            label="AWS"
            value={[runtime.provision?.awsRegion, runtime.provision?.awsInstanceType, runtime.provision?.awsCapacityType].filter(Boolean).join(' / ') || 'not set'}
          />
          <DataRow
            label="E2E"
            value={[runtime.provision?.e2eLocation, runtime.provision?.e2eGpuCard].filter(Boolean).join(' / ') || 'not set'}
          />
          <DataRow label="Grace" value={runtime.provision?.gracePeriodMin != null ? `${runtime.provision.gracePeriodMin} min` : 'not set'} />
          <DataRow
            label="Maintenance"
            value={runtime.provision?.maintenanceMode || runtime.provision?.blockNewSessions ? 'blocking new sessions' : 'open'}
            tone={runtime.provision?.maintenanceMode || runtime.provision?.blockNewSessions ? 'warn' : 'normal'}
          />
          <CapabilityHint hint={error || 'Could not load full provision config for editing.'} />
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <AdminField label="Primary provider">
              <select
                value={config.infrastructure.primaryProvider || 'e2e'}
                onChange={(event) =>
                  setConfig((current) =>
                    current
                      ? {
                          ...current,
                          infrastructure: {
                            ...current.infrastructure,
                            primaryProvider: event.target.value as ProviderName,
                          },
                        }
                      : current,
                  )
                }
                className={INPUT_CLASS}
              >
                <option value="e2e">E2E</option>
                <option value="aws">AWS</option>
                <option value="gcp">GCP</option>
                <option value="none">None</option>
              </select>
            </AdminField>
            <AdminField label="Fallback provider">
              <select
                value={config.infrastructure.fallbackProvider || 'none'}
                onChange={(event) =>
                  setConfig((current) =>
                    current
                      ? {
                          ...current,
                          infrastructure: {
                            ...current.infrastructure,
                            fallbackProvider: event.target.value as ProviderName,
                          },
                        }
                      : current,
                  )
                }
                className={INPUT_CLASS}
              >
                <option value="e2e">E2E</option>
                <option value="aws">AWS</option>
                <option value="gcp">GCP</option>
                <option value="none">None</option>
              </select>
            </AdminField>

            <AdminField label="E2E location">
              <input
                value={config.infrastructure.e2e?.location || ''}
                onChange={(event) =>
                  setConfig((current) =>
                    current
                      ? {
                          ...current,
                          infrastructure: {
                            ...current.infrastructure,
                            e2e: { ...current.infrastructure.e2e, location: event.target.value },
                          },
                        }
                      : current,
                  )
                }
                className={INPUT_CLASS}
              />
            </AdminField>
            <AdminField label="E2E GPU card">
              <input
                value={config.infrastructure.e2e?.gpuCard || ''}
                onChange={(event) =>
                  setConfig((current) =>
                    current
                      ? {
                          ...current,
                          infrastructure: {
                            ...current.infrastructure,
                            e2e: { ...current.infrastructure.e2e, gpuCard: event.target.value },
                          },
                        }
                      : current,
                  )
                }
                className={INPUT_CLASS}
              />
            </AdminField>
            <AdminField label="E2E plan">
              <input
                value={config.infrastructure.e2e?.plan || ''}
                onChange={(event) =>
                  setConfig((current) =>
                    current
                      ? {
                          ...current,
                          infrastructure: {
                            ...current.infrastructure,
                            e2e: { ...current.infrastructure.e2e, plan: event.target.value },
                          },
                        }
                      : current,
                  )
                }
                className={INPUT_CLASS}
              />
            </AdminField>

            <AdminField label="AWS region">
              <input
                value={config.infrastructure.aws?.region || ''}
                onChange={(event) =>
                  setConfig((current) =>
                    current
                      ? {
                          ...current,
                          infrastructure: {
                            ...current.infrastructure,
                            aws: { ...current.infrastructure.aws, region: event.target.value },
                          },
                        }
                      : current,
                  )
                }
                className={INPUT_CLASS}
              />
            </AdminField>
            <AdminField label="AWS instance type">
              <input
                value={config.infrastructure.aws?.instanceType || ''}
                onChange={(event) =>
                  setConfig((current) =>
                    current
                      ? {
                          ...current,
                          infrastructure: {
                            ...current.infrastructure,
                            aws: { ...current.infrastructure.aws, instanceType: event.target.value },
                          },
                        }
                      : current,
                  )
                }
                className={INPUT_CLASS}
              />
            </AdminField>
            <AdminField label="AWS capacity">
              <select
                value={config.infrastructure.aws?.capacityType || 'on-demand'}
                onChange={(event) =>
                  setConfig((current) =>
                    current
                      ? {
                          ...current,
                          infrastructure: {
                            ...current.infrastructure,
                            aws: {
                              ...current.infrastructure.aws,
                              capacityType: event.target.value as 'spot' | 'on-demand',
                            },
                          },
                        }
                      : current,
                  )
                }
                className={INPUT_CLASS}
              >
                <option value="on-demand">On-demand</option>
                <option value="spot">Spot</option>
              </select>
            </AdminField>
            <AdminField label="AWS capacity fallback">
              <select
                value={config.infrastructure.aws?.capacityFallback || 'on-demand'}
                onChange={(event) =>
                  setConfig((current) =>
                    current
                      ? {
                          ...current,
                          infrastructure: {
                            ...current.infrastructure,
                            aws: {
                              ...current.infrastructure.aws,
                              capacityFallback: event.target.value as 'spot' | 'on-demand' | 'none',
                            },
                          },
                        }
                      : current,
                  )
                }
                className={INPUT_CLASS}
              >
                <option value="on-demand">On-demand</option>
                <option value="spot">Spot</option>
                <option value="none">None</option>
              </select>
            </AdminField>
            <AdminField label="AWS fallback capacity">
              <select
                value={config.infrastructure.aws?.fallbackCapacity || 'on-demand'}
                onChange={(event) =>
                  setConfig((current) =>
                    current
                      ? {
                          ...current,
                          infrastructure: {
                            ...current.infrastructure,
                            aws: {
                              ...current.infrastructure.aws,
                              fallbackCapacity: event.target.value as 'spot' | 'on-demand' | 'none',
                            },
                          },
                        }
                      : current,
                  )
                }
                className={INPUT_CLASS}
              >
                <option value="on-demand">On-demand</option>
                <option value="spot">Spot</option>
                <option value="none">None</option>
              </select>
            </AdminField>
            <AdminField label="Pipeline service name">
              <input
                value={config.serviceName || ''}
                onChange={(event) =>
                  setConfig((current) => (current ? { ...current, serviceName: event.target.value } : current))
                }
                className={INPUT_CLASS}
              />
            </AdminField>
            <AdminField label="Subnet (read-only)">
              <input value={config.infrastructure.aws?.subnetId || ''} readOnly className={`${INPUT_CLASS} text-gray-400`} />
            </AdminField>
            <AdminField label="Security group (read-only)">
              <input value={config.infrastructure.aws?.securityGroupId || ''} readOnly className={`${INPUT_CLASS} text-gray-400`} />
            </AdminField>
          </div>

          <p className="mt-2 text-[11px] text-gray-500">
            Providers and cloud shape. Grace / maintenance / timeouts live under Provision policy above. Saves use optimistic concurrency.
          </p>
        </>
      )}
    </RuntimeSection>
  );
}
