'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { Database, Pencil, Plus, RefreshCw } from 'lucide-react';
import {
  apiService,
  type BetaServiceCreateRequest,
  type BetaServiceInfo,
  type BetaServiceRegistryAuth,
  type BetaServiceRegistryProvider,
  type BetaServiceRegistrySettings,
} from '../../lib/apiService';

type RegistryDraft = {
  enabled: boolean;
  provider: BetaServiceRegistryProvider;
  auth: BetaServiceRegistryAuth;
  server: string;
  namespace: string;
  region: string;
  imageTag: string;
  preferRegistryPull: boolean;
  loginRequired: boolean;
};

type FormDraft = {
  tag: string;
  label: string;
  apiUrl: string;
  isActive: boolean;
  registry: RegistryDraft;
};

type FormErrors = Partial<Record<string, string>>;

const DEFAULT_SERVICE = 'signature-verification';
const TAG_PATTERN = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;
const SERVER_PATTERN = /^(localhost|[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)(?::[0-9]{2,5})?$/;
const NAMESPACE_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*(?:\/[a-z0-9]+(?:[._-][a-z0-9]+)*)*$/;

const PROVIDER_OPTIONS: Array<{ value: BetaServiceRegistryProvider; label: string }> = [
  { value: 'ghcr', label: 'GHCR' },
  { value: 'ecr', label: 'AWS ECR' },
  { value: 'gcr', label: 'GCR' },
  { value: 'gar', label: 'GAR' },
  { value: 'dockerhub', label: 'Docker Hub' },
  { value: 'acr', label: 'Azure ACR' },
  { value: 'quay', label: 'Quay' },
  { value: 'custom', label: 'Custom' },
];

const AUTH_OPTIONS: Array<{ value: BetaServiceRegistryAuth; label: string }> = [
  { value: 'none', label: 'No login' },
  { value: 'basic', label: 'Basic auth' },
  { value: 'token', label: 'Token / PAT' },
  { value: 'aws', label: 'AWS IAM / ECR' },
];

function createEmptyRegistryDraft(): RegistryDraft {
  return {
    enabled: false,
    provider: 'ghcr',
    auth: 'token',
    server: '',
    namespace: '',
    region: '',
    imageTag: '',
    preferRegistryPull: true,
    loginRequired: true,
  };
}

function createEmptyFormDraft(): FormDraft {
  return {
    tag: '',
    label: '',
    apiUrl: '',
    isActive: true,
    registry: createEmptyRegistryDraft(),
  };
}

function registryDraftFromSettings(settings?: BetaServiceRegistrySettings): RegistryDraft {
  const draft = createEmptyRegistryDraft();
  if (!settings) return draft;
  return {
    enabled: true,
    provider: settings.provider || 'ghcr',
    auth: settings.auth || (settings.provider === 'ecr' ? 'aws' : 'token'),
    server: settings.server || '',
    namespace: settings.namespace || '',
    region: settings.region || '',
    imageTag: settings.imageTag || '',
    preferRegistryPull: settings.preferRegistryPull ?? true,
    loginRequired: settings.loginRequired ?? true,
  };
}

function formDraftFromService(service: BetaServiceInfo): FormDraft {
  return {
    tag: service.tag,
    label: service.label,
    apiUrl: service.apiUrl,
    isActive: service.isActive,
    registry: registryDraftFromSettings(service.registrySettings),
  };
}

function trimmed(value: string): string {
  return value.trim();
}

function buildRegistrySettings(draft: RegistryDraft): BetaServiceRegistrySettings | undefined {
  if (!draft.enabled) return undefined;
  return {
    provider: draft.provider,
    auth: draft.auth,
    server: trimmed(draft.server).toLowerCase(),
    namespace: trimmed(draft.namespace).toLowerCase().replace(/^\/+|\/+$/g, ''),
    region: trimmed(draft.region).toLowerCase(),
    imageTag: trimmed(draft.imageTag),
    preferRegistryPull: draft.preferRegistryPull,
    loginRequired: draft.loginRequired,
  };
}

function validateDraft(draft: FormDraft, requireTag: boolean): FormErrors {
  const errors: FormErrors = {};
  const tag = trimmed(draft.tag);
  const label = trimmed(draft.label);
  const apiUrl = trimmed(draft.apiUrl);

  if (requireTag) {
    if (!tag) {
      errors.tag = 'Tag is required.';
    } else if (!TAG_PATTERN.test(tag)) {
      errors.tag = 'Use 3-50 lowercase letters/numbers with optional hyphens.';
    }
  }

  if (!label) {
    errors.label = 'Label is required.';
  } else if (label.length > 100) {
    errors.label = 'Label must be 100 characters or less.';
  }

  if (!apiUrl) {
    errors.apiUrl = 'Internal API URL is required.';
  } else {
    try {
      const url = new URL(apiUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        errors.apiUrl = 'Use an absolute http or https URL.';
      }
    } catch {
      errors.apiUrl = 'Use an absolute http or https URL.';
    }
  }

  if (draft.registry.enabled) {
    const server = trimmed(draft.registry.server).toLowerCase();
    const namespace = trimmed(draft.registry.namespace).toLowerCase().replace(/^\/+|\/+$/g, '');
    const region = trimmed(draft.registry.region).toLowerCase();
    const imageTag = trimmed(draft.registry.imageTag);

    if (!server) {
      errors.registryServer = 'Registry server is required.';
    } else if (!SERVER_PATTERN.test(server)) {
      errors.registryServer = 'Use a registry host like ghcr.io or 123456789012.dkr.ecr.ap-south-1.amazonaws.com.';
    }

    if (!namespace) {
      errors.registryNamespace = 'Registry namespace is required.';
    } else if (!NAMESPACE_PATTERN.test(namespace)) {
      errors.registryNamespace = 'Use lowercase slash-separated registry path segments.';
    }

    if (draft.registry.provider === 'ecr' && !region) {
      errors.registryRegion = 'AWS region is required for ECR.';
    }

    if (draft.registry.preferRegistryPull && !imageTag) {
      errors.registryImageTag = 'Image tag is required when registry pull is preferred.';
    }

    if (draft.registry.loginRequired && draft.registry.auth === 'none') {
      errors.registryAuth = 'Pick an auth mode when login is required.';
    }
  }

  return errors;
}

function providerLabel(provider?: string): string {
  return PROVIDER_OPTIONS.find((option) => option.value === provider)?.label || 'Not configured';
}

function registrySummary(settings?: BetaServiceRegistrySettings): string {
  if (!settings) return 'Not configured';
  return [
    providerLabel(settings.provider),
    settings.server,
    settings.namespace,
    settings.imageTag ? `tag:${settings.imageTag}` : '',
    settings.region,
  ].filter(Boolean).join(' · ');
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-xs text-red-300">{message}</p>;
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  readOnly,
  helpText,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  readOnly?: boolean;
  helpText?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-300">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full rounded-2xl border bg-black/40 px-3 py-2 text-sm text-white ${readOnly ? 'cursor-not-allowed opacity-70' : ''} ${error ? 'border-red-500/40' : 'border-white/10'}`}
      />
      {!error && helpText ? <p className="mt-2 text-xs text-gray-500">{helpText}</p> : null}
      <FieldError message={error} />
    </div>
  );
}

function RegistrySettingsEditor({
  draft,
  errors,
  onChange,
}: {
  draft: RegistryDraft;
  errors: FormErrors;
  onChange: (next: RegistryDraft) => void;
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Registry settings</h4>
          <p className="mt-1 text-xs text-gray-400">
            Configure non-secret image registry metadata. Credentials stay on the worker or GPU host, not in this admin form.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(e) => onChange({ ...draft, enabled: e.target.checked })}
          />
          Enable
        </label>
      </div>

      {draft.enabled ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-gray-300">Provider</label>
              <select
                value={draft.provider}
                onChange={(e) => {
                  const provider = e.target.value as BetaServiceRegistryProvider;
                  onChange({
                    ...draft,
                    provider,
                    auth: provider === 'ecr' ? 'aws' : draft.auth === 'aws' ? 'token' : draft.auth,
                  });
                }}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              >
                {PROVIDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-300">Auth mode</label>
              <select
                value={draft.auth}
                onChange={(e) => onChange({ ...draft, auth: e.target.value as BetaServiceRegistryAuth })}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              >
                {AUTH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <FieldError message={errors.registryAuth} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Registry server"
              value={draft.server}
              onChange={(value) => onChange({ ...draft, server: value })}
              placeholder="ghcr.io"
              error={errors.registryServer}
            />
            <TextInput
              label="Namespace"
              value={draft.namespace}
              onChange={(value) => onChange({ ...draft, namespace: value })}
              placeholder="automica-ai"
              error={errors.registryNamespace}
              helpText="Relative path under the registry server, without the host prefix."
            />
            <TextInput
              label="Image tag"
              value={draft.imageTag}
              onChange={(value) => onChange({ ...draft, imageTag: value })}
              placeholder="dev"
              error={errors.registryImageTag}
            />
            <TextInput
              label="Region"
              value={draft.region}
              onChange={(value) => onChange({ ...draft, region: value })}
              placeholder="ap-south-1"
              error={errors.registryRegion}
              helpText={draft.provider === 'ecr' ? 'Required for ECR.' : 'Only needed for region-specific registries like ECR.'}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={draft.preferRegistryPull}
                onChange={(e) => onChange({ ...draft, preferRegistryPull: e.target.checked })}
              />
              Prefer registry pull
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={draft.loginRequired}
                onChange={(e) => onChange({ ...draft, loginRequired: e.target.checked })}
              />
              Login required
            </label>
          </div>
        </>
      ) : null}
    </div>
  );
}

function BetaServiceModal({
  title,
  tagHint,
  draft,
  errors,
  isSaving,
  submitLabel,
  onChange,
  onClose,
  onSubmit,
  disableTag,
}: {
  title: string;
  tagHint?: string;
  draft: FormDraft;
  errors: FormErrors;
  isSaving: boolean;
  submitLabel: string;
  onChange: (next: FormDraft) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  disableTag?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[28px] border border-white/10 bg-[#0d0d10] p-6 shadow-2xl">
        <h3 className="mb-1 text-lg font-semibold text-white">{title}</h3>
        {tagHint ? <p className="mb-4 font-mono text-xs text-gray-400">{tagHint}</p> : null}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Tag"
              value={draft.tag}
              onChange={(value) => onChange({ ...draft, tag: value })}
              placeholder="cpu-v1"
              error={errors.tag}
              readOnly={disableTag}
              helpText={disableTag ? 'Tags remain stable after creation.' : undefined}
            />
            <TextInput
              label="Label"
              value={draft.label}
              onChange={(value) => onChange({ ...draft, label: value })}
              placeholder="CPU v1"
              error={errors.label}
            />
          </div>

          <TextInput
            label="Internal API URL"
            value={draft.apiUrl}
            onChange={(value) => onChange({ ...draft, apiUrl: value })}
            placeholder="https://api.automica.ai/v1/beta_cpu/sign_verify"
            error={errors.apiUrl}
          />

          <RegistrySettingsEditor
            draft={draft.registry}
            errors={errors}
            onChange={(registry) => onChange({ ...draft, registry })}
          />

          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(e) => onChange({ ...draft, isActive: e.target.checked })}
            />
            Active
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BetaServicesPage() {
  const { isAuthenticated, isLoading: authLoading } = useKindeBrowserClient();
  const [services, setServices] = useState<BetaServiceInfo[]>([]);
  const [supportedServices, setSupportedServices] = useState<string[]>([DEFAULT_SERVICE]);
  const [selectedService, setSelectedService] = useState(DEFAULT_SERVICE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingService, setEditingService] = useState<BetaServiceInfo | null>(null);
  const [createDraft, setCreateDraft] = useState<FormDraft>(createEmptyFormDraft());
  const [editDraft, setEditDraft] = useState<FormDraft>(createEmptyFormDraft());
  const [createErrors, setCreateErrors] = useState<FormErrors>({});
  const [editErrors, setEditErrors] = useState<FormErrors>({});

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.listBetaServices(selectedService);
      setServices(response.services || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load beta services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [selectedService]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    apiService.getSupportedBetaServices()
      .then((res) => {
        if (res.services?.length) {
          setSupportedServices(res.services);
          setSelectedService((current) => (res.services.includes(current) ? current : res.services[0]));
        }
      })
      .catch(() => undefined);
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    void loadServices();
  }, [authLoading, isAuthenticated, loadServices]);

  const resetCreateForm = () => {
    setCreateDraft(createEmptyFormDraft());
    setCreateErrors({});
  };

  const openEdit = (service: BetaServiceInfo) => {
    setEditingService(service);
    setEditDraft(formDraftFromService(service));
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateDraft(createDraft, true);
    setCreateErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setIsSaving(true);
      setError(null);
      const payload: BetaServiceCreateRequest = {
        tag: trimmed(createDraft.tag).toLowerCase(),
        serviceName: selectedService,
        label: trimmed(createDraft.label),
        apiUrl: trimmed(createDraft.apiUrl),
        isActive: createDraft.isActive,
        registrySettings: buildRegistrySettings(createDraft.registry),
      };
      await apiService.createBetaService(payload);
      setShowCreateModal(false);
      resetCreateForm();
      await loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create beta service');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const errors = validateDraft(editDraft, false);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setIsSaving(true);
      setError(null);
      await apiService.updateBetaService(editingService.tag, {
        label: trimmed(editDraft.label),
        apiUrl: trimmed(editDraft.apiUrl),
        isActive: editDraft.isActive,
        registrySettings: buildRegistrySettings(editDraft.registry),
      });
      setShowEditModal(false);
      setEditingService(null);
      await loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update beta service');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  if (authLoading) {
    return <div className="p-8 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-white">
            <Database className="h-6 w-6 text-cyan-300" />
            Beta Services
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Register internal ML endpoints and optional registry metadata for GPU-backed service images.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void loadServices()}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-white/5"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => {
              resetCreateForm();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
          >
            <Plus className="h-4 w-4" />
            Register service
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-gray-400">Product service</label>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        >
          {supportedServices.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-left text-gray-400">
            <tr>
              <th className="px-4 py-3">Tag</th>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">API URL</th>
              <th className="px-4 py-3">Registry</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading beta services...</td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No beta services registered yet.</td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.tag} className="border-t border-white/5 text-gray-200">
                  <td className="px-4 py-3 font-mono text-xs">{service.tag}</td>
                  <td className="px-4 py-3">{service.label}</td>
                  <td className="px-4 py-3 font-mono text-xs break-all">{service.apiUrl}</td>
                  <td className="px-4 py-3 text-xs text-gray-300">{registrySummary(service.registrySettings)}</td>
                  <td className="px-4 py-3">{service.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-3">{formatDate(service.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(service)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-gray-200 hover:bg-white/5"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <BetaServiceModal
          title="Register beta service"
          draft={createDraft}
          errors={createErrors}
          isSaving={isSaving}
          submitLabel="Create"
          onChange={setCreateDraft}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {showEditModal && editingService && (
        <BetaServiceModal
          title="Edit beta service"
          tagHint={editingService.tag}
          draft={editDraft}
          errors={editErrors}
          isSaving={isSaving}
          submitLabel="Save"
          onChange={setEditDraft}
          onClose={() => {
            setShowEditModal(false);
            setEditingService(null);
          }}
          onSubmit={handleUpdate}
          disableTag
        />
      )}
    </div>
  );
}
