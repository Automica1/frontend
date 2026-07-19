'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { apiService, type AISaaSServiceRecord, type BetaKeyInfo } from '../../../../lib/apiService';
import { capabilityCue, legacyAliasGroups } from '../../workbenchModel';
import {
  AdminField,
  AdminSection,
  AliasChips,
  CapabilityHint,
  DataRow,
  INPUT_CLASS,
  MiniStat,
} from '../primitives';

/** Access model, aliases, and service-scoped beta key issue/revoke via the facade. */
export default function AccessTab({
  service,
  onSaved,
}: {
  service: AISaaSServiceRecord;
  onSaved?: () => void | Promise<void>;
}) {
  const writable = service.access.configurable && service.access.betaSupported;
  const cue = capabilityCue(writable, service.access.blockedBy);
  const [keys, setKeys] = useState<BetaKeyInfo[]>([]);
  const [email, setEmail] = useState('');
  const [label, setLabel] = useState('');
  const [issuedKey, setIssuedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadKeys = async () => {
    const tag = service.aliases.betaServiceTags?.[0] || service.access.betaServiceTags?.[0];
    if (!tag) {
      setKeys([]);
      return;
    }
    try {
      const response = await apiService.listBetaKeys(tag);
      setKeys(response.keys || []);
    } catch {
      setKeys([]);
    }
  };

  useEffect(() => {
    void loadKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service.apiId]);

  const issue = async () => {
    if (!writable || !email.trim()) return;
    setBusy(true);
    setError(null);
    setIssuedKey(null);
    try {
      const response = await apiService.issueAIServiceBetaKey(service.apiId, {
        assignedUserEmail: email.trim(),
        label: label.trim() || `${service.displayName} key`,
      });
      setIssuedKey(response.betaKey);
      setEmail('');
      await onSaved?.();
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to issue key');
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (keyId: string) => {
    setBusy(true);
    setError(null);
    try {
      await apiService.revokeAIServiceBetaKey(service.apiId, keyId);
      await onSaved?.();
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke key');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid h-full min-h-0 gap-3 xl:grid-cols-2">
      <AdminSection title="Access model">
        <div className="grid gap-1">
          <DataRow label="Model" value={service.access.model} />
          <DataRow
            label="Beta support"
            value={service.access.betaSupported ? 'supported' : 'not supported'}
            tone={service.access.betaSupported ? 'good' : 'normal'}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <MiniStat label="Active keys" value={String(service.access.activeBetaKeys)} tone={service.access.activeBetaKeys > 0 ? 'good' : 'normal'} />
          <MiniStat label="Total keys" value={String(service.access.totalBetaKeys)} />
          <MiniStat label="Revoked" value={String(service.access.revokedBetaKeys)} />
          <MiniStat label="Expired" value={String(service.access.expiredBetaKeys)} />
        </div>
        <CapabilityHint hint={cue.hint} />
      </AdminSection>

      <AdminSection title="Aliases">
        {legacyAliasGroups(service).map((group) => (
          <AliasChips key={group.label} label={group.label} values={group.values} />
        ))}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/admin/guest-passes"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-white/12 bg-white/[0.04] px-3 text-xs font-semibold text-gray-100 transition hover:bg-white/[0.08]"
          >
            <ExternalLink className="h-4 w-4" />
            Guest passes
          </Link>
        </div>
      </AdminSection>

      {writable ? (
        <div className="xl:col-span-2">
          <AdminSection title="Issue beta key">
            <div className="grid gap-3 md:grid-cols-2">
              <AdminField label="User email">
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="user@company.com"
                  className={INPUT_CLASS}
                />
              </AdminField>
              <AdminField label="Label">
                <input
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="Optional label"
                  className={INPUT_CLASS}
                />
              </AdminField>
            </div>
            {error ? <p className="mt-2 text-xs text-red-200">{error}</p> : null}
            {issuedKey ? (
              <p className="mt-2 break-all text-xs text-emerald-200">Issued (copy now): {issuedKey}</p>
            ) : null}
            <button
              type="button"
              disabled={busy || !email.trim()}
              onClick={() => void issue()}
              className="mt-3 inline-flex h-8 items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 text-[11px] font-semibold text-emerald-100 disabled:opacity-40"
            >
              {busy ? 'Working…' : 'Issue key'}
            </button>
            <div className="mt-4 space-y-2">
              {keys.slice(0, 12).map((key) => (
                <div
                  key={key.id || key.keyPrefix}
                  className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="truncate font-mono text-gray-100">{key.keyPrefix}…</div>
                    <div className="truncate text-gray-500">{key.assignedUserEmail || key.label || '—'}</div>
                  </div>
                  {key.isActive && !key.revokedAt ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void revoke(key.id)}
                      className="shrink-0 rounded border border-red-500/30 px-2 py-1 text-[11px] font-semibold text-red-200"
                    >
                      Revoke
                    </button>
                  ) : (
                    <span className="text-gray-500">Revoked</span>
                  )}
                </div>
              ))}
            </div>
          </AdminSection>
        </div>
      ) : null}
    </div>
  );
}
