'use client';

import { useState } from 'react';
import { Check, Copy, Loader2, Save } from 'lucide-react';
import { humanStatus, type StatusTone } from '../workbenchModel';

/**
 * Design primitives for the AI Services workbench.
 *
 * Theme follows the Preview look (dark, sky/emerald accents, rounded-lg panes)
 * with the agreed fixes: higher label contrast, copyable identity values, and
 * a subtle writable-vs-read-only language — sky left accent + focus ring on
 * real inputs, plain rows for read-only facts, quiet one-line capability hints
 * instead of banners.
 */

const LABEL_CLASS = 'text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400';

export function statusToneClass(tone: StatusTone): string {
  switch (tone) {
    case 'ok':
      return 'border-emerald-400/35 bg-emerald-500/10 text-emerald-100';
    case 'busy':
      return 'border-sky-400/35 bg-sky-500/10 text-sky-100';
    case 'warn':
      return 'border-amber-400/35 bg-amber-500/10 text-amber-100';
    case 'bad':
      return 'border-red-400/35 bg-red-500/10 text-red-100';
    default:
      return 'border-white/10 bg-white/5 text-gray-300';
  }
}

/** Human label first; raw engine code as secondary monospace metadata. */
export function StatusPill({ value, showRaw = false }: { value: string; showRaw?: boolean }) {
  const status = humanStatus(value);
  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${statusToneClass(status.tone)}`}>
      <span className="truncate">{status.label}</span>
      {showRaw && status.raw !== status.label.toLowerCase() && (
        <span className="truncate font-mono text-[9px] font-normal opacity-60">{status.raw}</span>
      )}
    </span>
  );
}

/** Section pane: rounded-lg, own scroll area, actions (e.g. dirty Save) in chrome. */
export function AdminSection({
  title,
  children,
  action,
  scroll = true,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  scroll?: boolean;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-black/20">
      <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-3">
        <h3 className="truncate text-sm font-semibold text-white">{title}</h3>
        {action}
      </div>
      <div className={`min-h-0 flex-1 p-3 ${scroll ? 'overflow-y-auto' : 'overflow-hidden'}`}>{children}</div>
    </section>
  );
}

/** Dirty-aware Save button for AdminSection chrome. */
export function SectionSaveButton({
  dirty,
  saving,
  onSave,
  label = 'Save',
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSave}
      disabled={!dirty || saving}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-semibold transition ${
        dirty
          ? 'border-emerald-500/40 bg-emerald-500/12 text-emerald-100 hover:bg-emerald-500/18'
          : 'border-white/10 bg-white/[0.03] text-gray-500'
      } disabled:cursor-not-allowed`}
    >
      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
      {saving ? 'Saving...' : dirty ? label : 'Saved'}
    </button>
  );
}

/** Read-only fact row. */
export function DataRow({
  label,
  value,
  tone = 'normal',
  title,
}: {
  label: string;
  value: React.ReactNode;
  tone?: 'normal' | 'good' | 'warn';
  title?: string;
}) {
  const toneClass = tone === 'good' ? 'text-emerald-100' : tone === 'warn' ? 'text-amber-100' : 'text-gray-100';
  return (
    <div className="grid min-h-[34px] grid-cols-[136px_minmax(0,1fr)] items-center gap-3 border-b border-white/[0.06] py-1.5 last:border-0">
      <div className={`truncate ${LABEL_CLASS}`}>{label}</div>
      <div title={title ?? (typeof value === 'string' ? value : undefined)} className={`truncate text-sm ${toneClass}`}>
        {value || '-'}
      </div>
    </div>
  );
}

/** Writable field: sky left accent + focus ring signal editability. */
export function AdminField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid min-w-0 gap-1">
      <span className={LABEL_CLASS}>{label}</span>
      {children}
      {hint && <span className="text-[11px] text-gray-500">{hint}</span>}
    </label>
  );
}

export const INPUT_CLASS =
  'w-full min-w-0 rounded-md border border-white/10 border-l-2 border-l-sky-400/50 bg-black/30 px-2.5 py-1.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-sky-400/40 focus:border-l-sky-300 focus:ring-2 focus:ring-sky-400/25';

/** Quiet one-line capability hint. Never a banner. */
export function CapabilityHint({ hint }: { hint?: string }) {
  if (!hint) return null;
  return <p className="mt-2 truncate text-[11px] text-gray-500" title={hint}>{hint}</p>;
}

/** Identity/endpoint values with copy-to-clipboard. */
export function CopyValue({ value, mono = true }: { value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
      <span title={value} className={`truncate text-sm text-gray-100 ${mono ? 'font-mono text-[13px]' : ''}`}>{value || '-'}</span>
      {value && (
        <button
          type="button"
          aria-label={`Copy ${value}`}
          title="Copy"
          onClick={() => {
            void navigator.clipboard?.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          }}
          className="shrink-0 rounded border border-white/10 p-1 text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
        </button>
      )}
    </span>
  );
}

export function MiniStat({ label, value, tone = 'normal' }: { label: string; value: string; tone?: 'normal' | 'good' | 'warn' }) {
  const toneClass = tone === 'good' ? 'text-emerald-100' : tone === 'warn' ? 'text-amber-100' : 'text-gray-100';
  return (
    <div className="min-w-0 rounded-md border border-white/10 bg-white/[0.035] px-2.5 py-2">
      <div className={`truncate ${LABEL_CLASS}`}>{label}</div>
      <div title={value || '-'} className={`mt-1 truncate text-sm font-semibold ${toneClass}`}>{value || '-'}</div>
    </div>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'sky' | 'red' }) {
  const toneClass = tone === 'sky'
    ? 'border-sky-400/30 bg-sky-500/10 text-sky-100'
    : tone === 'red'
      ? 'border-red-400/30 bg-red-500/10 text-red-100'
      : 'border-white/10 bg-white/[0.06] text-gray-300';
  return <span className={`inline-flex max-w-full items-center truncate rounded-md border px-2 py-0.5 text-[11px] font-medium ${toneClass}`}>{children}</span>;
}

export function EmptyState({ message }: { message: string }) {
  return <div className="rounded-md border border-dashed border-white/10 p-4 text-sm text-gray-500">{message}</div>;
}

export function AliasChips({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="mt-3 first:mt-0">
      <p className={`mb-1 ${LABEL_CLASS}`}>{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {values?.length ? values.map((value) => <Badge key={value}>{value}</Badge>) : <span className="text-xs text-gray-600">none</span>}
      </div>
    </div>
  );
}
