import {
  apiService,
  type AISaaSListResponse,
  type AISaaSQueryParams,
  type AISaaSRuntimeProfile,
  type AISaaSServiceRecord,
  type BetaServicePolicy,
  type BetaServiceRegistryAuth,
  type BetaServiceRegistryProvider,
  type BetaServiceRegistrySettings,
  type GPUPoolJobInfo,
  type GPUPoolSupportView,
  type GPUPoolDiagnosticsResult,
  type GPUProvisionConfig,
} from '../../../lib/apiService';

/**
 * Data access for /admin/ai-services.
 * Reads and writes go through the apiId-scoped AI Services facade when present.
 */

export async function listAIServices(params?: AISaaSQueryParams): Promise<AISaaSListResponse> {
  if (typeof apiService.listAIServices === 'function') {
    return apiService.listAIServices(params);
  }
  return apiService.listAISaaSServices(params);
}

export function getDateRangePresets() {
  return apiService.getDateRangePresets();
}

// ---------------------------------------------------------------------------
// GPU runtime commands (serviceTag comes from the selected apiId's runtime
// profile; apiId stays the selection identity in the UI).
// ---------------------------------------------------------------------------

export type RuntimeCommandId =
  | 'start'
  | 'recover'
  | 'diagnostics'
  | 'retry'
  | 'abort'
  | 'keepRunning'
  | 'extendGrace5'
  | 'extendGrace15'
  | 'graceStop'
  | 'destroyNow';

const COMMAND_TO_ACTION: Record<RuntimeCommandId, string> = {
  start: 'warm-start',
  recover: 'recover',
  diagnostics: 'diagnostics',
  retry: 'retry-provision',
  abort: 'abort-provision',
  keepRunning: 'cancel-grace',
  extendGrace5: 'extend-grace',
  extendGrace15: 'extend-grace',
  graceStop: 'grace-stop',
  destroyNow: 'destroy',
};

const EXTEND_MINUTES: Partial<Record<RuntimeCommandId, number>> = {
  extendGrace5: 5,
  extendGrace15: 15,
};

export async function runRuntimeCommand(
  command: RuntimeCommandId,
  serviceTag: string,
  apiId?: string,
  options?: { confirm?: string; expectedState?: string },
): Promise<unknown> {
  const extendMinutes = EXTEND_MINUTES[command];
  if (apiId && typeof apiService.runAIServiceRuntimeAction === 'function' && command !== 'diagnostics') {
    return apiService.runAIServiceRuntimeAction(apiId, {
      action: COMMAND_TO_ACTION[command],
      runtimeProfile: serviceTag,
      confirm: options?.confirm,
      expectedState: options?.expectedState,
      immediate: command === 'destroyNow',
      extendMinutes,
    });
  }
  switch (command) {
    case 'start':
      return apiService.warmStartGpuPool(serviceTag);
    case 'recover':
      return apiService.recoverGpuPool(serviceTag);
    case 'diagnostics':
      return apiService.runGpuPoolDiagnostics(serviceTag);
    case 'retry':
      return apiService.retryGpuPoolProvision(serviceTag);
    case 'abort':
      return apiService.abortGpuPoolProvision(serviceTag);
    case 'keepRunning':
      return apiService.cancelGpuPoolGrace(serviceTag);
    case 'extendGrace5':
      return apiService.extendGpuPoolGrace(serviceTag, 5);
    case 'extendGrace15':
      return apiService.extendGpuPoolGrace(serviceTag, 15);
    case 'graceStop':
      return apiService.shutdownGpuPool(serviceTag, false);
    case 'destroyNow':
      return apiService.shutdownGpuPool(serviceTag, true);
  }
}

// ---------------------------------------------------------------------------
// On-demand runtime facts for the Recovery tab (never part of the list load).
// ---------------------------------------------------------------------------

export interface RuntimeFacts {
  support?: GPUPoolSupportView;
  jobs?: GPUPoolJobInfo[];
  logLines?: string[];
  diagnostics?: GPUPoolDiagnosticsResult;
  partial: boolean;
}

export async function fetchRuntimeFacts(serviceTag: string): Promise<RuntimeFacts> {
  const [supportRes, jobsRes, logRes] = await Promise.allSettled([
    apiService.getGpuPoolSupport(serviceTag),
    apiService.listGpuPoolJobs(serviceTag),
    apiService.getGpuPoolJobLog(serviceTag),
  ]);
  return {
    support: supportRes.status === 'fulfilled' ? supportRes.value : undefined,
    jobs: jobsRes.status === 'fulfilled' ? jobsRes.value.jobs || [] : undefined,
    logLines: logRes.status === 'fulfilled' ? logRes.value.lines || [] : undefined,
    partial: [supportRes, jobsRes, logRes].some((res) => res.status === 'rejected'),
  };
}

// ---------------------------------------------------------------------------
// Policy save
// ---------------------------------------------------------------------------

export interface PolicyDraft {
  maxUploadSizeMB: number | null;
  maxPages: number | null;
  maxFiles: number | null;
  allowedFormats: string[];
  pricingMode: string;
  creditsPerHit: number | null;
  creditsPerPage: number | null;
  startupCredits: number | null;
  creditsPerMinute: number | null;
  notes: string;
}

export function policyDraftFromService(service: AISaaSServiceRecord): PolicyDraft {
  const policy = service.policy;
  return {
    maxUploadSizeMB: policy.maxUploadSizeMB ?? null,
    maxPages: policy.maxPages ?? null,
    maxFiles: policy.maxFiles ?? null,
    allowedFormats: policy.allowedFormats ? [...policy.allowedFormats] : [],
    pricingMode: policy.pricingMode || 'hybrid',
    creditsPerHit: policy.creditsPerHit ?? null,
    creditsPerPage: policy.creditsPerPage ?? null,
    startupCredits: policy.startupCredits ?? null,
    creditsPerMinute: policy.creditsPerMinute ?? null,
    notes: policy.notes || '',
  };
}

export function policyDraftEquals(a: PolicyDraft, b: PolicyDraft): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function draftToBackendPolicy(draft: PolicyDraft): BetaServicePolicy {
  return {
    limits: {
      ...(draft.maxUploadSizeMB != null ? { maxUploadSizeMB: draft.maxUploadSizeMB } : {}),
      ...(draft.maxPages != null ? { maxPages: draft.maxPages } : {}),
      ...(draft.maxFiles != null ? { maxFiles: draft.maxFiles } : {}),
      ...(draft.allowedFormats.length ? { allowedFormats: draft.allowedFormats.map((entry) => entry.trim()).filter(Boolean) } : {}),
    },
    pricing: {
      ...(draft.pricingMode ? { mode: draft.pricingMode } : {}),
      ...(draft.creditsPerHit != null ? { creditsPerHit: draft.creditsPerHit } : {}),
      ...(draft.creditsPerPage != null ? { creditsPerPage: draft.creditsPerPage } : {}),
      ...(draft.startupCredits != null ? { startupCredits: draft.startupCredits } : {}),
      ...(draft.creditsPerMinute != null ? { creditsPerMinute: draft.creditsPerMinute } : {}),
    },
    ...(draft.notes.trim() ? { notes: draft.notes.trim() } : {}),
  };
}

/**
 * Saves the policy for the selected API. Until /admin/ai-services/{apiId}/policy
 * exists, the write lands on the beta-service record resolved through the
 * API's explicit beta tag alias — the same target the beta-services admin
 * page edits today.
 */
export async function saveServicePolicy(service: AISaaSServiceRecord, draft: PolicyDraft): Promise<void> {
  const facade = apiService as typeof apiService & {
    updateAIServicePolicy?: (apiId: string, policy: BetaServicePolicy) => Promise<unknown>;
  };
  const payload = draftToBackendPolicy(draft);
  if (typeof facade.updateAIServicePolicy === 'function') {
    await facade.updateAIServicePolicy(service.apiId, payload);
    return;
  }
  const betaTag = service.aliases.betaServiceTags?.[0];
  if (!betaTag) {
    throw new Error(
      `No writable policy target for ${service.apiId} yet. Create its beta service record first (Admin -> Beta Access).`,
    );
  }
  await apiService.updateBetaService(betaTag, { servicePolicy: payload });
}

// ---------------------------------------------------------------------------
// Runtime tab: registry + provision (tight editable set)
// ---------------------------------------------------------------------------

export type RegistryDraft = {
  provider: string;
  auth: string;
  server: string;
  namespace: string;
  region: string;
  imageTag: string;
  preferRegistryPull: boolean;
  loginRequired: boolean;
};

/** Same fixed values as scripts/push_ocr_dev2_ecr.sh + gpu_host_registry_env.sh. */
export const AUTOMICA_REGISTRY_PRESETS: Record<'ghcr' | 'ecr', RegistryDraft> = {
  ghcr: {
    provider: 'ghcr',
    auth: 'token',
    server: 'ghcr.io',
    namespace: 'automica-ai',
    region: '',
    imageTag: 'dev2',
    preferRegistryPull: true,
    loginRequired: true,
  },
  ecr: {
    provider: 'ecr',
    auth: 'aws',
    server: '472929790350.dkr.ecr.eu-north-1.amazonaws.com',
    namespace: 'automica-ai',
    region: 'eu-north-1',
    imageTag: 'dev2',
    preferRegistryPull: true,
    loginRequired: true,
  },
};

export function emptyRegistryDraft(): RegistryDraft {
  return {
    provider: '',
    auth: '',
    server: '',
    namespace: '',
    region: '',
    imageTag: '',
    preferRegistryPull: false,
    loginRequired: false,
  };
}

/** Provider switch applies Automica script defaults; keeps image tag if already set. */
export function applyRegistryProviderPreset(current: RegistryDraft, provider: string): RegistryDraft {
  if (provider === 'ghcr' || provider === 'ecr') {
    const preset = AUTOMICA_REGISTRY_PRESETS[provider];
    return {
      ...preset,
      imageTag: current.imageTag.trim() || preset.imageTag,
    };
  }
  return {
    ...current,
    provider,
  };
}

/** Seed only from the owning registry document — never invent ghcr/none defaults. */
export function registryDraftFromSettings(
  settings: BetaServiceRegistrySettings | null | undefined,
): RegistryDraft {
  if (!settings) return emptyRegistryDraft();
  return {
    provider: settings.provider || '',
    auth: settings.auth || '',
    server: settings.server || '',
    namespace: settings.namespace || '',
    region: settings.region || '',
    imageTag: settings.imageTag || '',
    preferRegistryPull: Boolean(settings.preferRegistryPull),
    loginRequired: Boolean(settings.loginRequired),
  };
}

/** @deprecated Prefer registryDraftFromSettings after loadServiceRegistry. */
export function registryDraftFromRuntime(runtime: AISaaSRuntimeProfile | null | undefined): RegistryDraft {
  const registry = runtime?.registry;
  return registryDraftFromSettings(
    registry
      ? {
          provider: registry.provider as BetaServiceRegistryProvider | undefined,
          auth: registry.authMode as BetaServiceRegistryAuth | undefined,
          server: registry.server,
          namespace: registry.namespace,
          region: registry.region,
          imageTag: registry.imageTag,
          preferRegistryPull: registry.preferRegistryPull,
          loginRequired: registry.loginRequired,
        }
      : null,
  );
}

export function registryDraftEquals(a: RegistryDraft, b: RegistryDraft): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Same ownership rule as the AI Services facade: prefer GPU tags for runtime
 * editors (one shared policy). Legacy route tags (e.g. vlm-e2e-gpu) resolve to
 * the canonical GPU tag when present.
 */
export function resolveRegistryOwnerTag(
  service: AISaaSServiceRecord,
  runtimeProfile?: string,
): string | null {
  const beta = service.aliases.betaServiceTags || [];
  const gpu = service.aliases.gpuServiceTags || [];
  const tags = gpu.length > 0 ? gpu : beta;
  if (tags.length === 0) return null;

  if (runtimeProfile) {
    const want = runtimeProfile.toLowerCase().replace(/^gpu:/, '');
    const hit = tags.find((tag) => tag.toLowerCase() === want || tag.toLowerCase() === runtimeProfile.toLowerCase());
    if (hit) return hit;
    // Legacy route alias → canonical GPU tag (vlm-e2e-gpu → vlm-gpu).
    if (want === 'vlm-e2e-gpu') {
      const canonical = tags.find((tag) => tag.toLowerCase() === 'vlm-gpu');
      if (canonical) return canonical;
    }
    const betaHit = beta.find((tag) => tag.toLowerCase() === want);
    if (betaHit && gpu.length > 0) {
      if (want === 'vlm-e2e-gpu' || want === 'vlm-gpu') {
        return gpu[0];
      }
    }
    return betaHit || null;
  }
  return tags.length === 1 ? tags[0] : gpu[0] || null;
}

export async function loadServiceRegistry(ownerTag: string): Promise<{
  tag: string;
  exists: boolean;
  settings: BetaServiceRegistrySettings | null;
}> {
  try {
    const response = await apiService.getBetaService(ownerTag);
    return {
      tag: response.service.tag,
      exists: true,
      settings: response.service.registrySettings ?? null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Fall back to list when GET-by-tag is not on this environment yet.
    if (/404|not found|method not allowed/i.test(message)) {
      const listed = await apiService.listBetaServices();
      const row = listed.services.find((item) => item.tag === ownerTag);
      if (!row) {
        return { tag: ownerTag, exists: false, settings: null };
      }
      return { tag: row.tag, exists: true, settings: row.registrySettings ?? null };
    }
    throw err;
  }
}

export async function saveServiceRegistry(
  service: AISaaSServiceRecord,
  draft: RegistryDraft,
  runtimeProfile?: string,
): Promise<void> {
  const payload: BetaServiceRegistrySettings = {
    provider: draft.provider as BetaServiceRegistryProvider,
    auth: draft.auth as BetaServiceRegistryAuth,
    server: draft.server.trim() || undefined,
    namespace: draft.namespace.trim() || undefined,
    region: draft.region.trim() || undefined,
    imageTag: draft.imageTag.trim() || undefined,
    preferRegistryPull: draft.preferRegistryPull,
    loginRequired: draft.loginRequired,
  };
  await apiService.updateAIServiceRegistry(service.apiId, payload, runtimeProfile);
}

export async function loadServiceProvision(serviceTag: string): Promise<GPUProvisionConfig> {
  const response = await apiService.getGpuPoolPolicy(serviceTag);
  return response.policy;
}

export async function saveServiceProvision(
  service: AISaaSServiceRecord,
  config: GPUProvisionConfig,
  options?: { runtimeProfile?: string; expectedUpdatedAt?: string },
): Promise<GPUProvisionConfig> {
  return apiService.updateAIServiceProvision(service.apiId, config, options);
}
