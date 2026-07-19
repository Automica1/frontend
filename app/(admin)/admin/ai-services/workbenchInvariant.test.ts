import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Structural invariants for /admin/ai-services:
 *
 * - Preview (/admin/ai-services-preview) is a frozen backup: the new page may
 *   copy its look but must never import from it.
 * - /admin/ai-saas redirects here; path deep links resolve to ?apiId=.
 * - Overview is the default tab; the shell stays viewport-fit with no nested
 *   main landmark; read/write is cued by inputs vs rows, never LockNotice
 *   banners.
 */

const pageDir = dirname(fileURLToPath(import.meta.url));

function collectSources(dir: string): { path: string; source: string }[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return collectSources(full);
    if (!/\.(ts|tsx)$/.test(entry.name) || entry.name.endsWith('.test.ts')) return [];
    return [{ path: relative(pageDir, full), source: readFileSync(full, 'utf8') }];
  });
}

const sources = collectSources(pageDir);
const allSource = sources.map((file) => file.source).join('\n');
const workbenchSource = readFileSync(join(pageDir, 'AIServicesWorkbench.tsx'), 'utf8');
const routeSource = readFileSync(join(pageDir, 'page.tsx'), 'utf8');
const apiIdRouteSource = readFileSync(join(pageDir, '[apiId]', 'page.tsx'), 'utf8');
const aiSaasRouteSource = readFileSync(join(pageDir, '..', 'ai-saas', 'page.tsx'), 'utf8');

describe('preview freeze', () => {
  it('never imports from the frozen ai-services-preview backup', () => {
    for (const file of sources) {
      expect(file.source.includes('ai-services-preview'), `${file.path} references ai-services-preview`).toBe(false);
    }
    expect(sources.length).toBeGreaterThan(10);
  });
});

describe('routing', () => {
  it('keeps /admin/ai-saas as a redirect to /admin/ai-services', () => {
    expect(aiSaasRouteSource).toContain("redirect('/admin/ai-services')");
    expect(aiSaasRouteSource).toMatch(/from 'next\/navigation'/);
  });

  it('resolves /admin/ai-services/[apiId] to canonical ?apiId= selection', () => {
    expect(apiIdRouteSource).toContain('redirect(`/admin/ai-services?apiId=${encodeURIComponent(apiId)}`)');
  });

  it('mounts the workbench force-dynamic with query-driven selection', () => {
    expect(routeSource).toContain("export const dynamic = 'force-dynamic'");
    expect(routeSource).toContain('initialApiId');
    expect(routeSource).toContain('initialTab');
  });
});

describe('selection and tabs', () => {
  it('selects by apiId only — never slug/serviceTag/betaServiceTag state', () => {
    expect(workbenchSource).toContain('selectedApiId');
    expect(workbenchSource).not.toMatch(/setSelected(Slug|ServiceTag|BetaTag)/);
    expect(workbenchSource).not.toMatch(/selectedSlug/);
  });

  it('defaults to the Overview tab and resets to it on service switch', () => {
    expect(workbenchSource).toContain("useState<string>(initialTab || DEFAULT_TAB)");
    expect(workbenchSource).toContain('setTabChoice(DEFAULT_TAB)');
  });
});

describe('viewport and landmarks', () => {
  it('keeps the no-page-scroll shell: clipped full-height flex column', () => {
    expect(workbenchSource).toMatch(/className="flex h-full min-h-0 flex-col overflow-hidden"/);
    expect(workbenchSource).toContain('min-h-0 flex-1');
  });

  it('never renders a nested main landmark (the admin shell owns <main>)', () => {
    expect(allSource).not.toMatch(/<main\b/);
  });

  it('keeps a mobile List/Details single-focus switch', () => {
    expect(workbenchSource).toMatch(/aria-label="Workbench pane"[^>]*lg:hidden/);
    const pressed = workbenchSource.match(/aria-pressed=\{mobilePane === '(list|detail)'\}/g) || [];
    expect(pressed).toHaveLength(2);
  });
});

describe('read/write cues', () => {
  it('uses no LockNotice banners anywhere on the new page', () => {
    expect(allSource).not.toContain('LockNotice');
    expect(allSource).not.toContain('writes blocked');
    expect(allSource).not.toContain('WRITES BLOCKED');
  });

  it('signals writable fields with the sky accent + focus ring input style', () => {
    const primitives = readFileSync(join(pageDir, 'components', 'primitives.tsx'), 'utf8');
    expect(primitives).toContain('border-l-sky-400/50');
    expect(primitives).toContain('focus:ring-2');
  });

  it('keeps blocked domains on quiet hints through capabilityCue', () => {
    const policyTab = readFileSync(join(pageDir, 'components', 'tabs', 'PolicyTab.tsx'), 'utf8');
    expect(policyTab).toContain('capabilityCue');
    expect(policyTab).toContain('CapabilityHint');
    expect(policyTab).toContain('cue.writable');
  });
});

describe('command strip scope', () => {
  it('keeps the command strip GPU-ops only, with confirmation for destructive commands', () => {
    const commandStrip = readFileSync(join(pageDir, 'components', 'CommandStrip.tsx'), 'utf8');
    expect(commandStrip).not.toContain('savePolicy');
    expect(commandStrip).not.toContain('updateBetaService');
    for (const dangerous of ["id: 'retry'", "id: 'abort'", "id: 'destroyNow'"]) {
      const index = commandStrip.indexOf(dangerous);
      expect(index, `${dangerous} missing from command strip`).toBeGreaterThan(-1);
      expect(commandStrip.slice(index, index + 260)).toContain('confirm: true');
    }
  });

  it('routes mutations through the data service, not raw fetch', () => {
    expect(allSource).not.toMatch(/\bfetch\s*\(\s*['"`]/);
    const dataService = readFileSync(join(pageDir, 'lib', 'dataService.ts'), 'utf8');
    expect(dataService).toContain('listAISaaSServices');
    expect(dataService).toContain('listAIServices');
  });
});
