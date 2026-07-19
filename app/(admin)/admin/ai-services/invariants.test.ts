import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname);

function read(rel: string) {
  return readFileSync(join(root, rel), 'utf8');
}

describe('ai-services invariants', () => {
  it('does not import Preview backup source', () => {
    const workbench = read('AIServicesWorkbench.tsx');
    expect(workbench).not.toMatch(/ai-services-preview/);
    expect(workbench).not.toMatch(/AIServiceAdminPreview/);
  });

  it('defaults to Overview tab and uses tab strip model', () => {
    const model = read('workbenchModel.ts');
    expect(model).toMatch(/DEFAULT_TAB:\s*WorkbenchTabId\s*=\s*'overview'/);
    expect(model).toMatch(/id: 'overview'/);
    // The tab strip renders inside the ServiceWorkspace composition child.
    const workspace = read('components/ServiceWorkspace.tsx');
    expect(workspace).toMatch(/TabBar/);
    const workbench = read('AIServicesWorkbench.tsx');
    expect(`${workbench}${workspace}`).not.toMatch(/LockNotice|WRITES BLOCKED/);
  });

  it('ai-saas page redirects to ai-services', () => {
    const page = readFileSync(join(root, '../ai-saas/page.tsx'), 'utf8');
    expect(page).toMatch(/redirect\('\/admin\/ai-services'\)/);
  });

  it('Preview backup page still mounts frozen component', () => {
    const previewPage = readFileSync(join(root, '../ai-services-preview/page.tsx'), 'utf8');
    expect(previewPage).toMatch(/AIServiceAdminPreview/);
  });
});
