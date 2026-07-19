'use client';

import { X } from 'lucide-react';

export type DrawerId = 'logs' | 'support' | null;

/** Right-side overlay for raw log lines / support facts (QA and DevOps depth). */
export default function DetailDrawer({
  drawer,
  title,
  subtitle,
  lines,
  onClose,
}: {
  drawer: DrawerId;
  title: string;
  subtitle: string;
  lines: string[];
  onClose: () => void;
}) {
  if (!drawer) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45">
      <button type="button" aria-label="Close drawer" onClick={onClose} className="min-w-0 flex-1" />
      <div className="flex h-full w-full max-w-[460px] flex-col border-l border-white/10 bg-[#0b0b0d] shadow-2xl">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">{title}</h3>
            <p className="truncate font-mono text-[11px] text-gray-500">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md border border-white/10 p-1.5 text-gray-300 transition hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="grid gap-1.5">
            {(lines.length ? lines : ['No lines loaded yet.']).slice(-120).map((line, index) => (
              <div key={`${drawer}-${index}`} title={line} className="rounded border border-white/10 bg-black/35 px-2 py-1.5 font-mono text-[11px] leading-4 text-gray-300">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
