'use client';

import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Gauge,
  MoreHorizontal,
  Power,
  RefreshCw,
  ShieldCheck,
  Square,
  Timer,
  Trash2,
  Wrench,
  Zap,
} from 'lucide-react';
import type { AISaaSRuntimeProfile } from '../../../lib/apiService';
import { commandAvailability, nextCommandLabel } from '../workbenchModel';
import type { RuntimeCommandId } from '../lib/dataService';

/**
 * Command strip: GPU runtime operations only. Config saves live inside the
 * tab sections, never here. Secondary/destructive commands live in an
 * overflow menu so the strip never clips on narrow widths.
 */

export interface CommandDescriptor {
  id: RuntimeCommandId;
  label: string;
  icon: LucideIcon;
  tone: 'primary' | 'neutral' | 'warn' | 'danger';
  enabled: boolean;
  reason?: string;
  confirm: boolean;
}

export function buildCommands(runtime: AISaaSRuntimeProfile | null, busy: boolean): CommandDescriptor[] {
  const can = commandAvailability(runtime, busy);
  const blocked = can.busyReason || (!runtime?.serviceTag ? 'No GPU service tag resolved' : undefined);
  return [
    { id: 'start', label: 'Start runtime', icon: Zap, tone: 'primary', enabled: can.canStart, reason: blocked || 'Runtime is already warm, draining, or starting', confirm: false },
    { id: 'recover', label: 'Recover', icon: RefreshCw, tone: 'neutral', enabled: can.canRecover, reason: blocked || 'No reusable node or failure to recover', confirm: false },
    { id: 'diagnostics', label: 'Diagnostics', icon: Gauge, tone: 'neutral', enabled: can.canDiagnostics, reason: blocked || 'No node or failure to inspect', confirm: false },
    { id: 'retry', label: 'Retry provision', icon: Wrench, tone: 'warn', enabled: can.canRetry, reason: blocked || 'Retry applies after a failed provision', confirm: true },
    { id: 'abort', label: 'Abort job', icon: Square, tone: 'warn', enabled: can.canAbort, reason: blocked || 'No active provision job', confirm: true },
    ...(can.draining
      ? [
          { id: 'keepRunning' as const, label: 'Keep running', icon: ShieldCheck, tone: 'primary' as const, enabled: can.canKeepRunning, reason: blocked, confirm: false },
          { id: 'extendGrace5' as const, label: 'Extend +5m', icon: Clock3, tone: 'neutral' as const, enabled: can.canExtendGrace, reason: blocked || 'No draining node to extend', confirm: false },
          { id: 'extendGrace15' as const, label: 'Extend +15m', icon: Timer, tone: 'neutral' as const, enabled: can.canExtendGrace, reason: blocked || 'No draining node to extend', confirm: false },
        ]
      : [{ id: 'graceStop' as const, label: 'Grace stop', icon: Power, tone: 'danger' as const, enabled: can.canGraceStop, reason: blocked || 'Runtime is not serving from a node', confirm: true }]),
    { id: 'destroyNow', label: 'Destroy now', icon: Trash2, tone: 'danger', enabled: can.canDestroy, reason: blocked || 'No node to destroy', confirm: true },
  ];
}

function pickPrimary(commands: CommandDescriptor[], draining: boolean): CommandDescriptor {
  if (draining) {
    const keep = commands.find((command) => command.id === 'keepRunning' && command.enabled);
    if (keep) return keep;
  }
  const preferred = commands.find((command) =>
    command.enabled && ['keepRunning', 'recover', 'start', 'abort'].includes(command.id),
  );
  return preferred ?? commands[0];
}

function toneClass(tone: CommandDescriptor['tone']): string {
  switch (tone) {
    case 'primary':
      return 'border-emerald-500/40 bg-emerald-500/12 text-emerald-100 hover:bg-emerald-500/18';
    case 'warn':
      return 'border-amber-500/40 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15';
    case 'danger':
      return 'border-red-500/40 bg-red-500/10 text-red-100 hover:bg-red-500/15';
    default:
      return 'border-white/12 bg-white/[0.04] text-gray-100 hover:bg-white/[0.08]';
  }
}

export default function CommandStrip({
  runtime,
  busy,
  summary,
  onCommand,
}: {
  runtime: AISaaSRuntimeProfile | null;
  busy: boolean;
  summary: string;
  onCommand: (command: CommandDescriptor) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  if (!runtime) return null;

  const commands = buildCommands(runtime, busy);
  const draining = (runtime.state || '').toLowerCase() === 'draining';
  const primary = pickPrimary(commands, draining);
  const visibleIds = draining
    ? ['extendGrace5', 'extendGrace15', 'diagnostics']
    : ['recover', 'diagnostics'];
  const visible = commands.filter((command) => command.id !== primary.id && visibleIds.includes(command.id)).slice(0, 3);
  const overflow = commands.filter((command) => command.id !== primary.id && !visible.some((item) => item.id === command.id));
  const healthy = (runtime.state || '').toLowerCase() === 'ready';

  return (
    <div className="flex min-h-[48px] shrink-0 items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/25 px-3 py-2">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          {healthy
            ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
            : <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300" />}
          <span className="truncate text-sm font-semibold text-white">{nextCommandLabel(runtime)}</span>
        </div>
        <p className="mt-0.5 truncate text-[11px] text-gray-400" title={summary}>{summary}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => onCommand(primary)}
          disabled={!primary.enabled}
          title={primary.enabled ? primary.label : `${primary.label}: ${primary.reason || 'Unavailable'}`}
          className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.025] disabled:text-gray-600 ${toneClass(primary.tone)}`}
        >
          <primary.icon className="h-4 w-4 shrink-0" />
          <span className="hidden truncate sm:inline">{primary.label}</span>
        </button>
        {visible.map((command) => (
          <button
            key={command.id}
            type="button"
            onClick={() => onCommand(command)}
            disabled={!command.enabled}
            title={command.enabled ? command.label : `${command.label}: ${command.reason || 'Unavailable'}`}
            className={`hidden h-9 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.025] disabled:text-gray-600 md:inline-flex ${toneClass(command.tone)}`}
          >
            <command.icon className="h-4 w-4 shrink-0" />
            {(command.id === 'extendGrace5' || command.id === 'extendGrace15') && (
              <span className="hidden lg:inline">{command.label}</span>
            )}
          </button>
        ))}

        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label="More runtime commands"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-9 items-center justify-center rounded-md border border-white/12 bg-white/[0.04] px-3 text-gray-100 transition hover:bg-white/[0.08]"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 z-30 w-52 overflow-hidden rounded-lg border border-white/10 bg-[#0b0b0d] p-1 shadow-2xl">
              {overflow.map((command) => (
                <button
                  key={command.id}
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onCommand(command);
                  }}
                  disabled={!command.enabled}
                  title={command.enabled ? command.label : command.reason || 'Unavailable'}
                  className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-semibold transition disabled:cursor-not-allowed disabled:text-gray-600 ${
                    command.tone === 'danger' ? 'text-red-200 hover:bg-red-500/10' : command.tone === 'warn' ? 'text-amber-100 hover:bg-amber-500/10' : 'text-gray-100 hover:bg-white/[0.07]'
                  }`}
                >
                  <command.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{command.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
