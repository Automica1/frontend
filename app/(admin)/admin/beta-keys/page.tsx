'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { Copy, Check, FlaskConical, Plus, RefreshCw, Trash2 } from 'lucide-react';
import {
  apiService,
  type BetaKeyInfo,
  type BetaServiceInfo,
  type UserInfo,
} from '../../lib/apiService';

export default function BetaKeysPage() {
  const { isAuthenticated, isLoading: authLoading } = useKindeBrowserClient();
  const [keys, setKeys] = useState<BetaKeyInfo[]>([]);
  const [betaServices, setBetaServices] = useState<BetaServiceInfo[]>([]);
  const [services, setServices] = useState<string[]>(['signature-verification']);
  const [selectedService, setSelectedService] = useState('signature-verification');
  const [selectedBetaServiceTag, setSelectedBetaServiceTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [label, setLabel] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<UserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);

  const loadKeys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.listBetaKeys(selectedService);
      setKeys(response.keys || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load beta keys');
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }, [selectedService]);

  const loadBetaServices = useCallback(async () => {
    try {
      const response = await apiService.listBetaServices(selectedService, true);
      const items = response.services || [];
      setBetaServices(items);
      setSelectedBetaServiceTag((current) => {
        if (current && items.some((item) => item.tag === current)) {
          return current;
        }
        return items[0]?.tag || '';
      });
    } catch {
      setBetaServices([]);
      setSelectedBetaServiceTag('');
    }
  }, [selectedService]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    apiService.getSupportedBetaServices()
      .then((res) => {
        if (res.services?.length) {
          setServices(res.services);
        }
      })
      .catch(() => undefined);
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    loadBetaServices();
  }, [authLoading, isAuthenticated, loadBetaServices]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    loadKeys();
  }, [authLoading, isAuthenticated, loadKeys]);

  useEffect(() => {
    if (!showGenerateModal || generatedKey) return;

    const query = userSearch.trim();
    if (query.length < 2) {
      setUserResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingUsers(true);
        const response = await apiService.getUsers({ search: query, limit: 8, skip: 0 });
        setUserResults(response.users || []);
      } catch {
        setUserResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearch, showGenerateModal, generatedKey]);

  const resetGenerateForm = () => {
    setLabel('');
    setExpiresInDays('');
    setUserSearch('');
    setUserResults([]);
    setSelectedUser(null);
    setGeneratedKey(null);
    setKeyCopied(false);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !selectedUser?.email || !selectedBetaServiceTag) return;

    try {
      setIsGenerating(true);
      setError(null);
      const response = await apiService.generateBetaKey({
        serviceName: selectedService,
        betaServiceTag: selectedBetaServiceTag,
        label: label.trim(),
        assignedUserEmail: selectedUser.email,
        expiresInDays: expiresInDays === '' ? undefined : Number(expiresInDays),
      });
      setLabel('');
      setExpiresInDays('');
      setUserSearch('');
      setUserResults([]);
      setSelectedUser(null);
      setGeneratedKey(response.betaKey);
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate beta key');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!confirm('Revoke this beta key? Users will no longer be able to use it.')) return;
    try {
      setError(null);
      await apiService.revokeBetaKey(keyId);
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke beta key');
    }
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  if (authLoading) {
    return <div className="p-8 text-gray-400">Loading...</div>;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-purple-300" />
            Beta Keys
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Generate beta keys tied to a specific user. Only that user can use each key.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadKeys}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-white/5"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => {
              resetGenerateForm();
              setShowGenerateModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Generate key
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-gray-400">Service</label>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        >
          {services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-left text-gray-400">
            <tr>
              <th className="px-4 py-3">Prefix</th>
              <th className="px-4 py-3">Beta service</th>
              <th className="px-4 py-3">Assigned user</th>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">Loading beta keys...</td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">No beta keys yet for this service.</td>
              </tr>
            ) : (
              keys.map((key) => {
                const isExpired = key.expiresAt ? new Date(key.expiresAt) < new Date() : false;
                const status = !key.isActive ? 'Revoked' : isExpired ? 'Expired' : 'Active';
                return (
                  <tr key={key.id} className="border-t border-white/5 text-gray-200">
                    <td className="px-4 py-3 font-mono text-xs">{key.keyPrefix}...</td>
                    <td className="px-4 py-3 text-xs">{key.betaServiceTag || '—'}</td>
                    <td className="px-4 py-3 text-xs">{key.assignedUserEmail || '—'}</td>
                    <td className="px-4 py-3">{key.label}</td>
                    <td className="px-4 py-3">{status}</td>
                    <td className="px-4 py-3">{key.usageCount}</td>
                    <td className="px-4 py-3">{formatDate(key.createdAt)}</td>
                    <td className="px-4 py-3">{formatDate(key.expiresAt)}</td>
                    <td className="px-4 py-3">
                      {key.isActive && !isExpired && (
                        <button
                          onClick={() => handleRevoke(key.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-200 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#0d0d10] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Generate beta key</h3>

            {generatedKey ? (
              <div className="space-y-4">
                <p className="text-sm text-amber-200">
                  Copy this key now. It will not be shown again.
                </p>
                <div className="relative rounded-xl border border-white/10 bg-black/40 p-3 pr-12 font-mono text-xs break-all text-green-300">
                  {generatedKey}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedKey)}
                    aria-label={keyCopied ? 'Copied' : 'Copy beta key'}
                    className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-gray-200 hover:bg-white/10"
                  >
                    {keyCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedKey)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5"
                  >
                    {keyCopied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy key
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      resetGenerateForm();
                      setShowGenerateModal(false);
                    }}
                    className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Service</label>
                  <input
                    value={selectedService}
                    disabled
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Beta service</label>
                  <select
                    value={selectedBetaServiceTag}
                    onChange={(e) => setSelectedBetaServiceTag(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    required
                  >
                    {betaServices.length === 0 ? (
                      <option value="">No active beta services — register one first</option>
                    ) : (
                      betaServices.map((service) => (
                        <option key={service.tag} value={service.tag}>
                          {service.label} ({service.tag})
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Assigned user</label>
                  {selectedUser ? (
                    <div className="flex items-center justify-between rounded-2xl border border-purple-500/30 bg-purple-500/10 px-3 py-2">
                      <div>
                        <p className="text-sm text-white">{selectedUser.email}</p>
                        <p className="text-xs text-gray-400">{selectedUser.userId}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(null);
                          setUserSearch('');
                          setUserResults([]);
                        }}
                        className="text-xs text-gray-300 hover:text-white"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by email (min 2 chars)"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                      />
                      {isSearchingUsers && (
                        <p className="text-xs text-gray-400">Searching users...</p>
                      )}
                      {userResults.length > 0 && (
                        <div className="max-h-40 overflow-y-auto rounded-2xl border border-white/10 bg-black/40">
                          {userResults.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {
                                setSelectedUser(user);
                                setUserSearch('');
                                setUserResults([]);
                              }}
                              className="block w-full border-b border-white/5 px-3 py-2 text-left hover:bg-white/5 last:border-b-0"
                            >
                              <p className="text-sm text-white">{user.email}</p>
                              <p className="text-xs text-gray-400">{user.userId}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Label</label>
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Acme Corp pilot"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                    required
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Expires in days (optional)</label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetGenerateForm();
                      setShowGenerateModal(false);
                    }}
                    className="flex-1 rounded-2xl border border-white/10 px-4 py-2 text-gray-200"
                    disabled={isGenerating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-white disabled:opacity-50"
                    disabled={isGenerating || !selectedUser}
                  >
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
