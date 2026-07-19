'use client';

import { usePathname } from 'next/navigation';

export default function AdminMainFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const viewportFit = pathname.startsWith('/admin/ai-saas') || pathname.startsWith('/admin/ai-services-preview') || pathname.startsWith('/admin/ai-services');

  if (viewportFit) {
    return (
      <main className="min-h-0 flex-1 overflow-hidden px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4">
        <div className="h-full max-h-full min-h-0">{children}</div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-3 py-4 md:px-8 md:py-8">
      <div className="mx-auto h-full max-w-7xl">{children}</div>
    </main>
  );
}
