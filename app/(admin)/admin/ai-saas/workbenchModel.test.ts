import { describe, expect, it } from 'vitest';
import type { AISaaSServiceRecord, AISaaSWarning } from '../../lib/apiService';
import {
  filterServices,
  legacyAliasGroups,
  limitsText,
  mergeDetailWarnings,
  nextMobilePane,
  registryProviderLabel,
  resolveSelectedService,
  retainSelectedApiId,
  sessionPricing,
  sourcePillTone,
} from './workbenchModel';

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
  runtime: [
    {
      runtimeId: 'ocr-gpu',
      serviceTag: 'ocr-gpu',
      state: 'ready',
      readiness: 'ready',
      refCount: 1,
      activeSessions: 1,
      registry: { source: 'gpu_provision_configs', provider: 'ecr', imageTag: 'v42' },
    },
  ],
});

const signVerify = makeService({
  apiId: 'signature-verification',
  aliases: {
    catalogSlugs: ['signature-verification'],
    usageNames: [],
    betaServiceNames: ['sign_verify_vlm'],
    betaServiceTags: ['sign_verify_vlm_gpu'],
    gpuServiceTags: ['sign_verify_vlm_gpu'],
    pipelineServices: [],
    feedbackServiceNames: [],
  },
});

describe('retainSelectedApiId (apiId selection sync across reloads)', () => {
  it('keeps the current apiId when it still exists in the refreshed response', () => {
    expect(retainSelectedApiId('signature-verification', [ocr, signVerify])).toBe('signature-verification');
  });

  it('falls back to the first service apiId when the current selection disappeared', () => {
    expect(retainSelectedApiId('face-verify', [ocr, signVerify])).toBe('ocr');
  });

  it('selects the first service when nothing was selected yet', () => {
    expect(retainSelectedApiId('', [signVerify, ocr])).toBe('signature-verification');
  });

  it('returns empty identity when the response has no services', () => {
    expect(retainSelectedApiId('ocr', [])).toBe('');
  });
});

describe('resolveSelectedService (detail pane follows apiId)', () => {
  it('resolves the detail record by apiId, not by list position', () => {
    const selected = resolveSelectedService([ocr, signVerify], [ocr, signVerify], 'signature-verification');
    expect(selected?.apiId).toBe('signature-verification');
  });

  it('falls back to the first filtered row when selection is filtered out', () => {
    const selected = resolveSelectedService([ocr, signVerify], [signVerify], 'unknown-api');
    expect(selected?.apiId).toBe('signature-verification');
  });

  it('falls back to the first service when the filter matches nothing', () => {
    const selected = resolveSelectedService([ocr, signVerify], [], 'unknown-api');
    expect(selected?.apiId).toBe('ocr');
  });

  it('returns null when there are no services at all', () => {
    expect(resolveSelectedService([], [], 'ocr')).toBeNull();
  });

  it('never resolves by serviceTag or beta tag as primary identity', () => {
    // 'ocr-gpu' is a GPU serviceTag alias, not an apiId; it must not select OCR directly.
    const selected = resolveSelectedService([signVerify, ocr], [signVerify, ocr], 'ocr-gpu');
    expect(selected?.apiId).toBe('signature-verification');
  });
});

describe('filterServices (search covers apiId and compatibility aliases)', () => {
  it('returns all services for an empty query', () => {
    expect(filterServices([ocr, signVerify], '  ')).toHaveLength(2);
  });

  it('matches by apiId', () => {
    expect(filterServices([ocr, signVerify], 'signature-ver').map((s) => s.apiId)).toEqual(['signature-verification']);
  });

  it('matches by legacy GPU serviceTag alias', () => {
    expect(filterServices([ocr, signVerify], 'sign_verify_vlm_gpu').map((s) => s.apiId)).toEqual(['signature-verification']);
  });

  it('matches by registry image tag', () => {
    expect(filterServices([ocr, signVerify], 'v42').map((s) => s.apiId)).toEqual(['ocr']);
  });

  it('is case-insensitive', () => {
    expect(filterServices([ocr, signVerify], 'OCR-GPU').map((s) => s.apiId)).toEqual(['ocr']);
  });
});

describe('mergeDetailWarnings (partial-source and alignment warnings)', () => {
  const serviceWarning: AISaaSWarning = {
    code: 'AMBIGUOUS_ALIAS',
    severity: 'warn',
    message: 'Beta tag maps to two services.',
    apiId: 'ocr',
  };
  const globalWarning: AISaaSWarning = {
    code: 'PARTIAL_SOURCE',
    severity: 'warn',
    message: 'usage source unavailable',
  };
  const otherServiceWarning: AISaaSWarning = {
    code: 'CONFLICTING_ALIAS',
    severity: 'error',
    message: 'conflict on another api',
    apiId: 'signature-verification',
  };

  it('shows service-attached warnings plus un-scoped global warnings', () => {
    const serviceWithWarning = makeService({ apiId: 'ocr', warnings: [serviceWarning] });
    const merged = mergeDetailWarnings(serviceWithWarning, [globalWarning, otherServiceWarning]);
    expect(merged.map((w) => w.code)).toEqual(['AMBIGUOUS_ALIAS', 'PARTIAL_SOURCE']);
  });

  it('does not duplicate warnings already attached to the selected apiId', () => {
    const serviceWithWarning = makeService({ apiId: 'ocr', warnings: [serviceWarning] });
    const merged = mergeDetailWarnings(serviceWithWarning, [serviceWarning, globalWarning]);
    expect(merged.filter((w) => w.code === 'AMBIGUOUS_ALIAS')).toHaveLength(1);
  });

  it('excludes warnings scoped to other apiIds', () => {
    const merged = mergeDetailWarnings(ocr, [otherServiceWarning]);
    expect(merged).toHaveLength(0);
  });

  it('returns empty for a clean service and clean response', () => {
    expect(mergeDetailWarnings(ocr, [])).toEqual([]);
  });
});

describe('sourcePillTone (partial-source rendering)', () => {
  it('renders ok tone only for fully-ok sources', () => {
    expect(sourcePillTone('ok')).toBe('ok');
  });

  it('renders degraded tone for partial, error, and limited sources', () => {
    expect(sourcePillTone('partial')).toBe('degraded');
    expect(sourcePillTone('error')).toBe('degraded');
    expect(sourcePillTone('limited')).toBe('degraded');
  });
});

describe('legacyAliasGroups (aliases labeled as compatibility metadata)', () => {
  it('exposes every alias family under an explicit legacy label', () => {
    const groups = legacyAliasGroups(signVerify);
    expect(groups.map((g) => g.label)).toEqual([
      'Catalog slugs',
      'Usage names',
      'Beta names',
      'Beta tags',
      'GPU tags',
      'Pipelines',
    ]);
  });

  it('keeps serviceTag-style identifiers inside alias groups, never as the identity', () => {
    const groups = legacyAliasGroups(signVerify);
    const gpuTags = groups.find((g) => g.label === 'GPU tags');
    expect(gpuTags?.values).toEqual(['sign_verify_vlm_gpu']);
    expect(signVerify.apiId).not.toBe('sign_verify_vlm_gpu');
  });

  it('returns empty value lists rather than dropping alias groups', () => {
    const bare = makeService({ apiId: 'face-verify' });
    expect(legacyAliasGroups(bare)).toHaveLength(6);
    expect(legacyAliasGroups(bare).every((g) => Array.isArray(g.values))).toBe(true);
  });
});

describe('nextMobilePane (mobile single-focus pane switching)', () => {
  it('focuses Details when a service is selected from the list', () => {
    expect(nextMobilePane('list', 'selectService', true)).toBe('detail');
  });

  it('focuses Details via the explicit pane switch when a service is resolvable', () => {
    expect(nextMobilePane('list', 'showDetail', true)).toBe('detail');
  });

  it('returns to List from Details on back', () => {
    expect(nextMobilePane('detail', 'backToList', true)).toBe('list');
  });

  it('never focuses Details when no service is resolvable', () => {
    expect(nextMobilePane('list', 'showDetail', false)).toBe('list');
    expect(nextMobilePane('list', 'selectService', false)).toBe('list');
  });

  it('back always lands on List even without a selectable service', () => {
    expect(nextMobilePane('detail', 'backToList', false)).toBe('list');
  });

  it('re-selecting while already on Details stays on Details', () => {
    expect(nextMobilePane('detail', 'selectService', true)).toBe('detail');
  });
});

describe('detail formatting helpers', () => {
  it('labels registry provider with image tag when present', () => {
    expect(registryProviderLabel(ocr)).toBe('ecr:v42');
    expect(registryProviderLabel(signVerify)).toBe('');
  });

  it('formats session pricing only when session pricing fields exist', () => {
    expect(sessionPricing(ocr)).toBe('not set');
    const priced = makeService({
      apiId: 'ocr',
      policy: { hasPolicy: true, configurable: false, startupCredits: 5, creditsPerMinute: 2 },
    });
    expect(sessionPricing(priced)).toBe('5 start + 2/min');
  });

  it('formats limits from available policy fields only', () => {
    expect(limitsText(ocr)).toBe('not set');
    const limited = makeService({
      apiId: 'ocr',
      policy: { hasPolicy: true, configurable: false, maxUploadSizeMB: 10, maxPages: 4 },
    });
    expect(limitsText(limited)).toBe('10MB / 4 pages');
  });
});
