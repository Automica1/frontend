'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { Copy, KeyRound, Plus, RefreshCw, Trash2, Pencil } from 'lucide-react';
import {
  apiService,
  type GuestPassInfo,
} from '../../lib/apiService';

function formatServices(services: string[]) {
  if (!services || services.length === 0) return 'All services';
  return services.join(', ');
}

function buildTryApiLink(serviceSlug: string, accessKey: string) {
  if (typeof window === 'undefined') {
    return `/services/${serviceSlug}?tab=try-api&access=${encodeURIComponent(accessKey)}`;
  }
  return `${window.location.origin}/services/${serviceSlug}?tab=try-api&access=${encodeURIComponent(accessKey)}`;
}

function exampleServiceSlug(allowedServices: string[]) {
  if (allowedServices.length > 0) return allowedServices[0];
  return 'signature-verification';
}

export default function GuestPassesPage() {
  const { isAuthenticated, isLoading: authLoading } = useKindeBrowserClient();
  const [passes, setPasses] = useState<GuestPassInfo[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState<GuestPassInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [credits, setCredits] = useState(10);
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [topUpCredits, setTopUpCredits] = useState(0);
  const [editLabel, setEditLabel] = useState('');
  const [editServices, setEditServices] = useState<string[]>([]);

  const loadPasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.listGuestPasses();
      setPasses(response.passes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load guest passes');
      setPasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    apiService.getSupportedGuestPassServices()
      .then((res) => setServices(res.services || []))
      .catch(() => undefined);
    loadPasses();
  }, [authLoading, isAuthenticated, loadPasses]);

  const resetCreateForm = () => {
    setLabel('');
    setDescription('');
    setCredits(10);
    setExpiresInDays('');
    setSelectedServices([]);
    setGeneratedKey(null);
  };

  const toggleService = (slug: string, current: string[], setter: (v: string[]) => void) => {
    if (current.includes(slug)) {
      setter(current.filter((s) => s !== slug));
    } else {
      setter([...current, slug]);
    }
  };

  const handleCreate = async () => {
    if (!label.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await apiService.createGuestPass({
        label: label.trim(),
        description: description.trim() || undefined,
        credits,
        allowedServices: selectedServices.length > 0 ? selectedServices : undefined,
        expiresInDays: expiresInDays === '' ? undefined : Number(expiresInDays),
      });
      setGeneratedKey(response.guestPassKey);
      await loadPasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create guest pass');
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (pass: GuestPassInfo) => {
    setSelectedPass(pass);
    setEditLabel(pass.label);
    setEditServices(pass.allowedServices || []);
    setTopUpCredits(0);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedPass) return;
    setIsSaving(true);
    setError(null);
    try {
      await apiService.updateGuestPass(selectedPass.id, {
        label: editLabel.trim(),
        allowedServices: editServices,
        topUpCredits: topUpCredits > 0 ? topUpCredits : undefined,
      });
      setShowEditModal(false);
      setSelectedPass(null);
      await loadPasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update guest pass');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevoke = async (passId: string) => {
    if (!confirm('Revoke this guest pass? It will stop working immediately.')) return;
    try {
      await apiService.revokeGuestPass(passId);
      await loadPasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke guest pass');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  if (authLoading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-emerald-400" />
            Guest Passes
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Create access links for Try API without sign-in. Share the link only — guests do not enter codes manually.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadPasses()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => {
              resetCreateForm();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            Create pass
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-400">Loading guest passes...</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Pass</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Credits</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Services</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Usage</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {passes.map((pass) => (
                <tr key={pass.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-white">{pass.label}</div>
                    <div className="text-xs text-gray-500 font-mono">{pass.keyPrefix}</div>
                    <div className="text-xs text-gray-500">by {pass.createdBy}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300">
                    {pass.remainingCredits} / {pass.initialCredits}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400 max-w-xs">
                    {formatServices(pass.allowedServices)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      pass.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
                    }`}>
                      {pass.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-400">{pass.usageCount}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => openEdit(pass)}
                        disabled={!pass.isActive}
                        className="rounded-lg border border-white/10 p-2 text-gray-300 hover:bg-white/5 disabled:opacity-40"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRevoke(pass.id)}
                        disabled={!pass.isActive}
                        className="rounded-lg border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10 disabled:opacity-40"
                        title="Revoke"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {passes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                    No guest passes yet. Create one to share Try API access without sign-in.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111114] p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Create guest pass</h2>

            {generatedKey ? (
              <div className="space-y-4">
                <p className="text-sm text-amber-300">
                  Share the Try API link below. The access key is embedded — it will not be shown again separately.
                </p>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm text-gray-300">
                  <p className="font-medium text-white">Example link for {exampleServiceSlug(selectedServices)}:</p>
                  <code className="block text-xs break-all text-emerald-300/90 bg-black/40 rounded-lg p-2">
                    {buildTryApiLink(exampleServiceSlug(selectedServices), generatedKey)}
                  </code>
                </div>
                <button
                  onClick={() => void copyToClipboard(buildTryApiLink(exampleServiceSlug(selectedServices), generatedKey))}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                >
                  <Copy className="h-4 w-4" />
                  Copy Try API link
                </button>
                <button
                  onClick={() => copyToClipboard(generatedKey)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-white/5 ml-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy code only
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="w-full rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-white/5"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Label</label>
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    placeholder="Demo for Acme Corp"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Description</label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    placeholder="Optional notes"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Credits</label>
                    <input
                      type="number"
                      min={1}
                      value={credits}
                      onChange={(e) => setCredits(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Expires (days)</label>
                    <input
                      type="number"
                      min={1}
                      value={expiresInDays}
                      onChange={(e) => setExpiresInDays(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Allowed services (empty = all)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {services.map((slug) => (
                      <label key={slug} className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(slug)}
                          onChange={() => toggleService(slug, selectedServices, setSelectedServices)}
                        />
                        {slug}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetCreateForm();
                    }}
                    className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={isSaving || !label.trim()}
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {isSaving ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showEditModal && selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111114] p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Edit guest pass</h2>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Label</label>
              <input
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Top up credits</label>
              <input
                type="number"
                min={0}
                value={topUpCredits}
                onChange={(e) => setTopUpCredits(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Allowed services</label>
              <div className="grid grid-cols-2 gap-2">
                {services.map((slug) => (
                  <label key={slug} className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={editServices.includes(slug)}
                      onChange={() => toggleService(slug, editServices, setEditServices)}
                    />
                    {slug}
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500">Uncheck all to allow every service.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPass(null);
                }}
                className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isSaving}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
