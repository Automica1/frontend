'use client';

import type { CommandDescriptor } from './CommandStrip';

export interface PendingConfirm {
  command: CommandDescriptor;
  apiId: string;
  serviceTag: string;
  node: string;
  sessions: number;
}

/** Destructive/irreversible GPU commands re-confirm with tag, node, sessions, and DESTROY token for destroy. */
export default function ConfirmModal({
  pending,
  busy,
  destroyToken = '',
  onDestroyToken,
  onCancel,
  onConfirm,
}: {
  pending: PendingConfirm | null;
  busy: boolean;
  destroyToken?: string;
  onDestroyToken?: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!pending) return null;
  const Icon = pending.command.icon;
  const danger = pending.command.tone === 'danger';
  const isDestroy = pending.command.id === 'destroyNow';
  const ready = !isDestroy || destroyToken.trim() === 'DESTROY';

  return (
    <div role="dialog" aria-modal="true" aria-label={pending.command.label} className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-[#0b0b0d] p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className={`rounded-md border p-2 ${danger ? 'border-red-500/40 bg-red-500/10 text-red-100' : 'border-amber-500/40 bg-amber-500/10 text-amber-100'}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-white">{pending.command.label}</h3>
            <p className="mt-1 text-sm text-gray-400">
              This runs against <span className="font-mono text-gray-200">{pending.serviceTag}</span> for API{' '}
              <span className="font-mono text-gray-200">{pending.apiId}</span>.
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Node: <span className="text-gray-200">{pending.node || 'not recorded'}</span> · Active sessions:{' '}
              <span className={pending.sessions > 0 ? 'text-amber-200' : 'text-gray-200'}>{pending.sessions}</span>
            </p>
            {isDestroy ? (
              <p className="mt-2 text-sm text-red-200">
                Admin Destroy tears down the VM. Stop Testing only ends a user session.
              </p>
            ) : null}
            {pending.sessions > 0 && danger ? (
              <p className="mt-1 text-sm text-amber-200">Users are attached — destroy is blocked until sessions stop.</p>
            ) : null}
            {isDestroy ? (
              <label className="mt-3 grid gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Type DESTROY to confirm</span>
                <input
                  value={destroyToken}
                  onChange={(event) => onDestroyToken?.(event.target.value)}
                  className="rounded-md border border-red-400/40 border-l-red-400 bg-black/40 px-2.5 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-red-400/40"
                  autoComplete="off"
                />
              </label>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-9 rounded-md border border-white/10 px-3 text-xs font-semibold text-gray-200 transition hover:bg-white/5 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy || !ready || (isDestroy && pending.sessions > 0)}
            className={`h-9 rounded-md border px-3 text-xs font-semibold transition disabled:opacity-40 ${
              danger
                ? 'border-red-500/40 bg-red-500/15 text-red-100 hover:bg-red-500/25'
                : 'border-amber-500/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25'
            }`}
          >
            {busy ? 'Working…' : pending.command.label}
          </button>
        </div>
      </div>
    </div>
  );
}
