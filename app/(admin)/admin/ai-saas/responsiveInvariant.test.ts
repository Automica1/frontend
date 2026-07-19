import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Mobile QA invariant (390x844 dev2 blocker): the workbench must stay inside
 * the fixed admin viewport with a usable work area. These checks statically
 * pin the layout classes that prevent the flex-1 work section from collapsing
 * to 0px and that give mobile an explicit List/Details single-focus switch,
 * while leaving the lg+ split-pane untouched.
 */

const pageDir = dirname(fileURLToPath(import.meta.url));
const workbenchSource = readFileSync(join(pageDir, 'AISaaSWorkbench.tsx'), 'utf8');

describe('AI SaaS workbench responsive invariants', () => {
  it('keeps the no-outer-scroll shell: root is a full-height clipped flex column', () => {
    expect(workbenchSource).toMatch(/className="flex h-full min-h-0 flex-col overflow-hidden/);
  });

  it('keeps the work area as the only flexible section', () => {
    expect(workbenchSource).toContain('min-h-0 flex-1 overflow-hidden');
  });

  it('gives the work-area grid an explicit full-height row so panes cannot collapse', () => {
    expect(workbenchSource).toMatch(/grid h-full min-h-0 grid-cols-1 grid-rows-\[minmax\(0,1fr\)\]/);
  });

  it('hides secondary header chrome on mobile but keeps the title', () => {
    // Control-plane pill and description are md+ only.
    expect(workbenchSource).toMatch(/hidden[^"]*md:inline-flex/);
    expect(workbenchSource).toMatch(/mt-1 hidden max-w-4xl[^"]*md:block/);
    // Title has no responsive hiding.
    expect(workbenchSource).toMatch(/<h1 className="truncate text-2xl[^"]*">AI SaaS<\/h1>/);
  });

  it('keeps refresh and date filters reachable on mobile (2-col compact grid)', () => {
    expect(workbenchSource).toMatch(/grid grid-cols-2 gap-2 sm:grid-cols-\[1fr_1fr_auto_auto\]/);
  });

  it('renders KPI cards as a horizontal scroll strip on mobile instead of a tall stack', () => {
    expect(workbenchSource).toMatch(/flex gap-2 overflow-x-auto[^"]*md:grid md:grid-cols-3/);
    expect(workbenchSource).toMatch(/min-w-\[132px\] shrink-0[^"]*md:min-w-0/);
  });

  it('exposes an accessible mobile-only List/Details pane switch', () => {
    expect(workbenchSource).toMatch(/aria-label="Workbench pane"[^>]*lg:hidden/);
    const pressed = workbenchSource.match(/aria-pressed=\{mobilePane === '(list|detail)'\}/g) || [];
    expect(pressed).toHaveLength(2);
    expect(workbenchSource).toContain('Back to list');
  });

  it('shows exactly one pane at a time on mobile while lg+ always shows both', () => {
    expect(workbenchSource).toMatch(/\$\{mobilePane === 'list' \? 'flex' : 'hidden'\} lg:flex/);
    expect(workbenchSource).toMatch(/lg:block[^`]*\$\{mobilePane === 'detail' \? 'block' : 'hidden'\}/);
  });

  it('preserves the lg+ split-pane column template unchanged', () => {
    expect(workbenchSource).toContain('lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]');
  });

  it('keeps apiId identity, source warnings, and lock notices in the detail pane', () => {
    expect(workbenchSource).toContain('apiId: {service.apiId}');
    expect(workbenchSource).toContain('Source and alignment warnings');
    expect(workbenchSource).toContain('Public writes blocked');
  });
});
