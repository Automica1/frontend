'use client';

import { RefreshCw, Save } from 'lucide-react';

export function AdminSection({
  title,
  edited,
  action,
  children,
}: {
  title: string;
  edited?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-black/20">
      <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-3">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-white">{title}</h3>
          {edited ? (
            <span className="rounded border border-sky-400/30 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-100">
              Edited
            </span>
          ) : null}
        </div>
        {action}
      </div>
      <div className="min-h-0 flex-1 p-3">{children}</div>
    </section>
  );
}

export function SectionSaveBar({
  dirty,
  saving,
  savedAt,
  error,
  onSave,
  onReset,
}: {
  dirty: boolean;
  saving?: boolean;
  savedAt?: string | null;
  error?: string | null;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {error ? <span className="text-xs text-red-200">{error}</span> : null}
      {savedAt && !dirty ? (
        <span className="text-xs text-emerald-200">Saved at {new Date(savedAt).toLocaleString()}</span>
      ) : null}
      <button
        type="button"
        onClick={onReset}
        disabled={!dirty || saving}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 text-[11px] font-semibold text-gray-100 hover:bg-white/[0.08] disabled:opacity-40"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Reset
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={!dirty || saving}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-500/15 disabled:opacity-40"
      >
        <Save className="h-3.5 w-3.5" />
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}
