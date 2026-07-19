import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Plan invariant (ai-saas-admin-full-plan.md, "Actions And Safety"):
 * AI SaaS is read-only plus links. No warm-start/recover/retry/abort/
 * destroy/shutdown/revoke controls, no fake editable fields, no writes.
 *
 * These tests statically inspect the page source so the invariant fails loudly
 * if someone adds a mutating control without going through the safety plan.
 */

const pageDir = dirname(fileURLToPath(import.meta.url));
const workbenchSource = readFileSync(join(pageDir, 'AISaaSWorkbench.tsx'), 'utf8');
const routeSource = readFileSync(join(pageDir, 'page.tsx'), 'utf8');
const modelSource = readFileSync(join(pageDir, 'workbenchModel.ts'), 'utf8');
const allSource = [workbenchSource, routeSource, modelSource].join('\n');

describe('AI SaaS admin page read-only invariant', () => {
  it('only calls read-only apiService methods', () => {
    const calls = [...allSource.matchAll(/apiService\.(\w+)/g)].map((match) => match[1]);
    expect(calls.length).toBeGreaterThan(0);
    const allowed = new Set(['listAISaaSServices', 'getDateRangePresets']);
    for (const call of calls) {
      expect(allowed.has(call), `apiService.${call} is not an approved read-only call for AI SaaS`).toBe(true);
    }
  });

  it('does not issue mutating HTTP requests directly', () => {
    expect(allSource).not.toMatch(/method:\s*['"`](POST|PUT|PATCH|DELETE)/i);
    expect(allSource).not.toMatch(/\bfetch\s*\(/);
  });

  it('exposes no destructive runtime controls', () => {
    const forbiddenControls = [
      'warmStart',
      'warm-start',
      'recoverPool',
      'retryProvision',
      'abortProvision',
      'destroyPool',
      'adminShutdownGpuPool',
      'startGpuPool',
      'stopGpuPool',
      'revokeBetaKey',
      'issueBetaKey',
      'deleteService',
    ];
    for (const control of forbiddenControls) {
      expect(allSource.includes(control), `forbidden control reference: ${control}`).toBe(false);
    }
  });

  it('exposes no fake editable fields (no forms, submits, or editable content)', () => {
    expect(allSource).not.toMatch(/<form\b/);
    expect(allSource).not.toMatch(/onSubmit/);
    expect(allSource).not.toMatch(/<textarea\b/);
    expect(allSource).not.toMatch(/<select\b/);
    expect(allSource).not.toMatch(/contentEditable/);
    expect(allSource).not.toMatch(/type="checkbox"/);
  });

  it('limits inputs to the date filters and the alias-aware search box', () => {
    const inputOffsets = [...workbenchSource.matchAll(/<input\b/g)].map((match) => match.index ?? 0);
    expect(inputOffsets).toHaveLength(3);
    for (const offset of inputOffsets) {
      const attributes = workbenchSource.slice(offset, offset + 500);
      const isDateFilter = attributes.includes('type="date"');
      const isSearch = attributes.includes('placeholder="Search');
      expect(isDateFilter || isSearch, `unexpected input control near: ${attributes.slice(0, 120)}`).toBe(true);
    }
  });

  it('limits click handlers to selection, refresh, date presets, and pane focus', () => {
    const handlers = workbenchSource.match(/onClick=\{[^}]*\}?/g) || [];
    expect(handlers.length).toBeGreaterThan(0);
    for (const handler of handlers) {
      const allowed = /onSelect|applyPreset|load\(|goToPane\(/.test(handler);
      expect(allowed, `unexpected onClick handler: ${handler}`).toBe(true);
    }
  });

  it('links statically only to real existing admin/public pages', () => {
    const staticHrefs = [...workbenchSource.matchAll(/href=\{?["'`]([^"'`]+)["'`]/g)].map((match) => match[1]);
    const allowedRoutes = new Set([
      '/admin/beta-keys',
      '/admin/beta-services',
      '/admin/beta-feedback',
      '/admin/services',
      '/api-docs',
    ]);
    expect(staticHrefs.length).toBeGreaterThan(0);
    for (const href of staticHrefs) {
      expect(allowedRoutes.has(href), `link target not in approved existing pages: ${href}`).toBe(true);
    }
  });

  it('uses the deployed /api-docs route for docs fallback, never /docs', () => {
    expect(workbenchSource).toContain("'/api-docs'");
    // /docs is not a deployed Next route; linking to it 404s on prefetch.
    const staleDocsTargets = [...workbenchSource.matchAll(/["'`](\/docs\b[^"'`]*)["'`]/g)].map((match) => match[1]);
    expect(staleDocsTargets, `stale /docs link targets found: ${staleDocsTargets.join(', ')}`).toHaveLength(0);
  });

  it('keeps the write-blocked notices visible on the detail pane', () => {
    expect(workbenchSource).toContain('Public writes blocked');
    expect(workbenchSource).toContain('Access writes blocked');
    expect(workbenchSource).toContain('Policy edits disabled here');
  });
});
