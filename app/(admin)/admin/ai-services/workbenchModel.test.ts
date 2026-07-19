import { describe, expect, it } from 'vitest';
import type { AISaaSRuntimeProfile, AISaaSServiceRecord, AISaaSWarning } from '../../lib/apiService';
import {
  ALL_TABS,
  DEFAULT_TAB,
  capabilityCue,
  commandAvailability,
  filterServices,
  hasGpuRuntime,
  humanStatus,
  humanWarning,
  legacyAliasGroups,
  limitsText,
  matchesFilter,
  mergeDetailWarnings,
  needsAttention,
  nextCommandLabel,
  nextMobilePane,
  normalizeTab,
  registryProviderLabel,
  resolveSelectedService,
  retainSelectedApiId,
  sessionPricing,
  sourcePillTone,
  visibleTabs,
} from './workbenchModel';

function makeRuntime(overrides: Partial<AISaaSRuntimeProfile> = {}): AISaaSRuntimeProfile {
  return {
    runtimeId: 'ocr-gpu',
    serviceTag: 'ocr-gpu',
    state: 'idle',
    readiness: 'idle',
    refCount: 0,
    activeSessions: 0,
    ...overrides,
  };
}

function makeService(overrides: Partial<AISaaSServiceRecord> & { apiId: string }): AISaaSServiceRecord {
  return {
    slug: overrides.apiId,
    displayName: overrides.apiId.toUpperCase(),
    lifecycle: 'active',
    readiness: 'ready',
    nextSafeAction: 'No action required.',
    public: { status: 'public', configurable: false },
    aliases: {
      catalogSlugs: [],
      usageNames: [],
      betaServiceNames: [],
      betaServiceTags: [],
      gpuServiceTags: [],
      pipelineServices: [],
      feedbackServiceNames: [],
    },
    sources: [],
    policy: { hasPolicy: false, configurable: false },
    access: {
      model: 'public',
      betaSupported: false,
      totalBetaKeys: 0,
      activeBetaKeys: 0,
      revokedBetaKeys: 0,
      expiredBetaKeys: 0,
      configurable: false,
    },
    usage: { totalCalls: 0, successCalls: 0, failedCalls: 0, totalCredits: 0 },
    feedback: { recentSessions: 0, pendingSessions: 0, refundedCredits: 0 },
    runtime: [],
    links: [],
    ...overrides,
  };
}

const ocr = makeService({
  apiId: 'ocr',
  aliases: {
    catalogSlugs: ['ocr'],
    usageNames: ['OCR'],
    betaServiceNames: [],
    betaServiceTags: [],
    gpuServiceTags: ['ocr-gpu'],
    pipelineServices: [],
    feedbackServiceNames: [],
  },
  runtime: [makeRuntime({ registry: { source: 'beta', provider: 'ghcr', imageTag: 'v3' } })],
});

const signature = makeService({
  apiId: 'signature-verification',
  readiness: 'idle',
  access: {
    model: 'public + beta',
    betaSupported: true,
    totalBetaKeys: 4,
    activeBetaKeys: 2,
    revokedBetaKeys: 1,
    expiredBetaKeys: 1,
    configurable: false,
  },
  runtime: [makeRuntime({ runtimeId: 'sig-gpu', serviceTag: 'sign_verify_vlm_gpu', state: 'failed', lastError: 'provision failed' })],
});

const qr = makeService({ apiId: 'qr-extract', readiness: 'public-only' });

const all = [ocr, signature, qr];

describe('apiId selection', () => {
  it('retains the selected apiId across reloads when it still exists', () => {
    expect(retainSelectedApiId('signature-verification', all)).toBe('signature-verification');
  });

  it('falls back to the first service when the apiId disappears', () => {
    expect(retainSelectedApiId('gone', all)).toBe('ocr');
    expect(retainSelectedApiId('', [])).toBe('');
  });

  it('resolves detail by apiId first, then filtered rows, then any service', () => {
    expect(resolveSelectedService(all, all, 'qr-extract')?.apiId).toBe('qr-extract');
    expect(resolveSelectedService(all, [signature], 'missing')?.apiId).toBe('signature-verification');
    expect(resolveSelectedService(all, [], 'missing')?.apiId).toBe('ocr');
    expect(resolveSelectedService([], [], 'missing')).toBeNull();
  });
});

describe('search and ledger filters', () => {
  it('matches legacy aliases and registry facts through the selected apiId', () => {
    expect(filterServices(all, 'ocr-gpu').map((service) => service.apiId)).toEqual(['ocr']);
    expect(filterServices(all, 'ghcr').map((service) => service.apiId)).toEqual(['ocr']);
    expect(filterServices(all, 'sign_verify').map((service) => service.apiId)).toEqual(['signature-verification']);
  });

  it('supports the five ledger filters', () => {
    expect(filterServices(all, '', 'all')).toHaveLength(3);
    expect(filterServices(all, '', 'gpu').map((service) => service.apiId)).toEqual(['ocr', 'signature-verification']);
    expect(filterServices(all, '', 'beta').map((service) => service.apiId)).toEqual(['signature-verification']);
    expect(filterServices(all, '', 'attention').map((service) => service.apiId)).toEqual(['signature-verification']);
    expect(filterServices(all, '', 'public').map((service) => service.apiId)).toEqual(['ocr', 'signature-verification', 'qr-extract']);
  });

  it('flags attention from warnings, readiness, and runtime errors', () => {
    expect(needsAttention(ocr)).toBe(false);
    expect(needsAttention(signature)).toBe(true);
    expect(needsAttention(makeService({ apiId: 'warned', warnings: [{ code: 'X', severity: 'warn', message: 'm' }] }))).toBe(true);
    expect(matchesFilter(qr, 'public')).toBe(true);
  });
});

describe('domain tabs', () => {
  it('defaults to Overview', () => {
    expect(DEFAULT_TAB).toBe('overview');
    expect(ALL_TABS[0].id).toBe('overview');
  });

  it('hides Runtime and Recovery when the API has no GPU runtime', () => {
    const tabs = visibleTabs(qr).map((tab) => tab.id);
    expect(tabs).not.toContain('runtime');
    expect(tabs).not.toContain('recovery');
    expect(tabs).toContain('overview');
    expect(hasGpuRuntime(qr)).toBe(false);
  });

  it('shows all eight tabs for GPU-backed APIs', () => {
    expect(visibleTabs(ocr).map((tab) => tab.id)).toEqual([
      'overview', 'public', 'runtime', 'policy', 'access', 'usage', 'feedback', 'recovery',
    ]);
  });

  it('normalizes unknown or hidden tab choices to Overview', () => {
    expect(normalizeTab('policy', qr)).toBe('policy');
    expect(normalizeTab('recovery', qr)).toBe('overview');
    expect(normalizeTab('recovery', ocr)).toBe('recovery');
    expect(normalizeTab('nonsense', ocr)).toBe('overview');
    expect(normalizeTab(null, null)).toBe('overview');
  });
});

describe('human status labels', () => {
  it('maps raw engine codes to operator labels while keeping the raw code', () => {
    expect(humanStatus('idle')).toMatchObject({ label: 'GPU idle', raw: 'idle' });
    expect(humanStatus('public-only').label).toBe('Catalog only');
    expect(humanStatus('provisioning').label).toBe('Starting');
    expect(humanStatus('failed').tone).toBe('bad');
    expect(humanStatus(undefined).label).toBe('Unknown');
  });

  it('translates known warning codes and falls back to the message', () => {
    expect(humanWarning({ code: 'LIMITED_GPU_CONFIG_DISCOVERY', severity: 'warn', message: 'raw' })).toBe('Limited GPU config list');
    expect(humanWarning({ code: 'NEW_CODE', severity: 'warn', message: 'Something specific' })).toBe('Something specific');
  });
});

describe('warnings merge', () => {
  it('keeps service warnings plus unscoped globals without duplicates', () => {
    const own: AISaaSWarning = { code: 'A', severity: 'warn', message: 'own', apiId: 'ocr' };
    const global: AISaaSWarning = { code: 'B', severity: 'warn', message: 'global' };
    const other: AISaaSWarning = { code: 'C', severity: 'warn', message: 'other', apiId: 'qr-extract' };
    const service = makeService({ apiId: 'ocr', warnings: [own] });
    expect(mergeDetailWarnings(service, [global, other]).map((warning) => warning.code)).toEqual(['A', 'B']);
  });
});

describe('mobile single-focus pane', () => {
  it('selecting a service focuses details; back returns to list', () => {
    expect(nextMobilePane('list', 'selectService', true)).toBe('detail');
    expect(nextMobilePane('detail', 'backToList', true)).toBe('list');
    expect(nextMobilePane('list', 'showDetail', false)).toBe('list');
  });
});

describe('GPU command gating', () => {
  it('offers start when cold and blocks it when ready or provisioning', () => {
    expect(commandAvailability(makeRuntime({ state: 'idle' }), false).canStart).toBe(true);
    expect(commandAvailability(makeRuntime({ state: 'ready' }), false).canStart).toBe(false);
    expect(commandAvailability(makeRuntime({ state: 'provisioning' }), false).canStart).toBe(false);
  });

  it('destroy and grace stop require a node', () => {
    const noNode = commandAvailability(makeRuntime({ state: 'ready' }), false);
    expect(noNode.canDestroy).toBe(false);
    expect(noNode.canGraceStop).toBe(false);
    const withNode = commandAvailability(makeRuntime({ state: 'ready', publicIp: '1.2.3.4' }), false);
    expect(withNode.canDestroy).toBe(true);
    expect(withNode.canGraceStop).toBe(true);
  });

  it('retry only after failure; abort only with an active job or provision', () => {
    expect(commandAvailability(makeRuntime({ state: 'failed' }), false).canRetry).toBe(true);
    expect(commandAvailability(makeRuntime({ state: 'idle' }), false).canRetry).toBe(false);
    expect(commandAvailability(makeRuntime({ state: 'provisioning' }), false).canAbort).toBe(true);
    expect(commandAvailability(makeRuntime({ state: 'idle' }), false).canAbort).toBe(false);
  });

  it('blocks everything while busy or without a serviceTag', () => {
    const busy = commandAvailability(makeRuntime({ state: 'failed' }), true);
    expect(busy.canRetry).toBe(false);
    expect(busy.busyReason).toBeTruthy();
    const untagged = commandAvailability(makeRuntime({ serviceTag: undefined, state: 'failed' }), false);
    expect(untagged.canRetry).toBe(false);
  });

  it('keeps the draining runtime on a keep-running path', () => {
    const draining = commandAvailability(makeRuntime({ state: 'draining', publicIp: '1.2.3.4' }), false);
    expect(draining.draining).toBe(true);
    expect(draining.canKeepRunning).toBe(true);
    expect(draining.canExtendGrace).toBe(true);
    expect(draining.canStart).toBe(false);
    expect(nextCommandLabel(makeRuntime({ state: 'draining' }))).toBe('Keep running');
    expect(nextCommandLabel(makeRuntime({ state: 'failed' }))).toBe('Recover runtime');
    expect(nextCommandLabel(null)).toBe('No GPU runtime');
  });
});

describe('read/write capability cue', () => {
  it('writable domains get real inputs; blocked domains get a quiet hint, never a banner', () => {
    expect(capabilityCue(true)).toEqual({ writable: true });
    const blocked = capabilityCue(false, 'Canonical writes not cut over.');
    expect(blocked.writable).toBe(false);
    expect(blocked.hint).toBe('Canonical writes not cut over.');
    expect(capabilityCue(false).hint).toContain('Read-only');
  });
});

describe('display helpers (ported behavior)', () => {
  it('keeps legacy aliases as compatibility metadata groups', () => {
    const groups = legacyAliasGroups(ocr);
    expect(groups.map((group) => group.label)).toContain('GPU tags');
    expect(groups.find((group) => group.label === 'GPU tags')?.values).toEqual(['ocr-gpu']);
  });

  it('renders registry, pricing, limits, and source pill tones as before', () => {
    expect(registryProviderLabel(ocr)).toBe('ghcr:v3');
    expect(sessionPricing(ocr)).toBe('not set');
    expect(sessionPricing(makeService({ apiId: 'p', policy: { hasPolicy: true, configurable: false, startupCredits: 5, creditsPerMinute: 2 } }))).toBe('5 start + 2/min');
    expect(limitsText(makeService({ apiId: 'l', policy: { hasPolicy: true, configurable: false, maxUploadSizeMB: 10, maxPages: 3 } }))).toBe('10MB / 3 pages');
    expect(sourcePillTone('ok')).toBe('ok');
    expect(sourcePillTone('partial')).toBe('degraded');
  });
});
