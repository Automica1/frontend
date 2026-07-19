'use client';

import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const writableClass =
  'w-full rounded-md border border-white/10 border-l-sky-400/70 bg-black/30 px-2.5 py-1.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-sky-300/50 focus:ring-1 focus:ring-sky-400/30';

const readClass = 'text-sm text-gray-100';

export function DataRow({
  label,
  value,
  tone = 'normal',
  copyValue,
}: {
  label: string;
  value: string;
  tone?: 'normal' | 'good' | 'warn';
  copyValue?: string;
}) {
  const toneClass = tone === 'good' ? 'text-emerald-100' : tone === 'warn' ? 'text-amber-100' : 'text-gray-100';
  return (
    <div className="grid min-h-[34px] grid-cols-[120px_minmax(0,1fr)] items-center gap-3 border-b border-white/[0.06] py-1.5 last:border-0">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">{label}</div>
      <div className="flex min-w-0 items-center gap-2">
        <div title={value || '-'} className={`min-w-0 break-all ${readClass} ${toneClass}`}>
          {value || '-'}
        </div>
        {copyValue ? (
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(copyValue)}
            className="shrink-0 rounded border border-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-gray-300 hover:bg-white/5"
          >
            Copy
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function AdminField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">{label}</span>
      {children}
      {hint ? <span className="text-[11px] text-gray-500">{hint}</span> : null}
    </label>
  );
}

export function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${writableClass} ${props.className || ''}`} />;
}

export function AdminSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${writableClass} ${props.className || ''}`} />;
}

export function AdminTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${writableClass} ${props.className || ''}`} />;
}

export function CapabilityHint({ reason, href }: { reason: string; href?: string }) {
  return (
    <div className="rounded-md border border-dashed border-white/15 bg-white/[0.02] px-3 py-2 text-xs text-gray-400">
      {reason}
      {href ? (
        <a href={href} className="ml-2 text-sky-300 underline-offset-2 hover:underline">
          Open
        </a>
      ) : null}
    </div>
  );
}
