'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { Database, Pencil, Plus, RefreshCw } from 'lucide-react';
import {
  apiService,
  type BetaServiceInfo,
} from '../../lib/apiService';

export default function BetaServicesPage() {
  const { isAuthenticated, isLoading: authLoading } = useKindeBrowserClient();
  const [services, setServices] = useState<BetaServiceInfo[]>([]);
  const [supportedServices, setSupportedServices] = useState<string[]>(['signature-verification']);
  const [selectedService, setSelectedService] = useState('signature-verification');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingService, setEditingService] = useState<BetaServiceInfo | null>(null);

  const [tag, setTag] = useState('');
  const [label, setLabel] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [editLabel, setEditLabel] = useState('');
  const [editApiUrl, setEditApiUrl] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.listBetaServices(selectedService);
      setServices(response.services || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load beta services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [selectedService]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    apiService.getSupportedBetaServices()
      .then((res) => {
        if (res.services?.length) {
          setSupportedServices(res.services);
        }
      })
      .catch(() => undefined);
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    loadServices();
  }, [authLoading, isAuthenticated, loadServices]);

  const resetCreateForm = () => {
    setTag('');
    setLabel('');
    setApiUrl('');
    setIsActive(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag.trim() || !label.trim() || !apiUrl.trim()) return;

    try {
      setIsSaving(true);
      setError(null);
      await apiService.createBetaService({
        tag: tag.trim(),
        serviceName: selectedService,
        label: label.trim(),
        apiUrl: apiUrl.trim(),
        isActive,
      });
      setShowCreateModal(false);
      resetCreateForm();
      await loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create beta service');
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (service: BetaServiceInfo) => {
    setEditingService(service);
    setEditLabel(service.label);
    setEditApiUrl(service.apiUrl);
    setEditIsActive(service.isActive);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      setIsSaving(true);
      setError(null);
      await apiService.updateBetaService(editingService.tag, {
        label: editLabel.trim(),
        apiUrl: editApiUrl.trim(),
        isActive: editIsActive,
      });
      setShowEditModal(false);
      setEditingService(null);
      await loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update beta service');
    } finally {
      setIsSaving(false);
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
            <Database className="h-6 w-6 text-cyan-300" />
            Beta Services
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Register internal ML endpoints and assign them to beta keys. Users never see tags or URLs.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadServices}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-white/5"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => {
              resetCreateForm();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
          >
            <Plus className="h-4 w-4" />
            Register service
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-gray-400">Product service</label>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        >
          {supportedServices.map((service) => (
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
              <th className="px-4 py-3">Tag</th>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">API URL</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading beta services...</td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No beta services registered yet.</td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.tag} className="border-t border-white/5 text-gray-200">
                  <td className="px-4 py-3 font-mono text-xs">{service.tag}</td>
                  <td className="px-4 py-3">{service.label}</td>
                  <td className="px-4 py-3 font-mono text-xs break-all">{service.apiUrl}</td>
                  <td className="px-4 py-3">{service.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-3">{formatDate(service.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(service)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-gray-200 hover:bg-white/5"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#0d0d10] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Register beta service</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Tag</label>
                <input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="cpu-v1"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Label</label>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="CPU v1"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Internal API URL</label>
                <input
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.automica.ai/v1/beta_cpu/sign_verify"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  required
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#0d0d10] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-1">Edit beta service</h3>
            <p className="text-xs text-gray-400 mb-4 font-mono">{editingService.tag}</p>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Label</label>
                <input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Internal API URL</label>
                <input
                  value={editApiUrl}
                  onChange={(e) => setEditApiUrl(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  required
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                />
                Active
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingService(null);
                  }}
                  className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
