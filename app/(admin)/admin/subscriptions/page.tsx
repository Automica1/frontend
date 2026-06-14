'use client';

import type { ComponentType } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  ReceiptText,
  Search,
  ShieldCheck,
  RotateCcw,
  User,
  Package,
} from 'lucide-react';
import { apiService, AdminSubscription } from '../../lib/apiService';
import { useAdminFeedback } from '../../components/AdminFeedback';

const PAGE_SIZE = 12;

type SubscriptionFilters = {
  search: string;
  status: string;
};

const statusTone: Record<string, string> = {
  active: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
  cancelled: 'border-rose-500/20 bg-rose-500/10 text-rose-200',
  past_due: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
  created: 'border-sky-500/20 bg-sky-500/10 text-sky-200',
  expired: 'border-zinc-500/20 bg-zinc-500/10 text-zinc-200',
};

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatStatus(value: string) {
  return value.replace(/_/g, ' ');
}

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirm, toast } = useAdminFeedback();
  const [filters, setFilters] = useState<SubscriptionFilters>({
    search: searchParams.get('search') || searchParams.get('userId') || searchParams.get('email') || searchParams.get('subscriptionId') || '',
    status: searchParams.get('status') || '',
  });
  const [page, setPage] = useState(1);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminSubscription | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const subscriptionIdParam = searchParams.get('subscriptionId');

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, page]);

  useEffect(() => {
    if (subscriptionIdParam) {
      void openDetail(subscriptionIdParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionIdParam]);

  const filteredSummary = useMemo(() => {
    const active = subscriptions.filter((sub) => sub.status === 'active').length;
    const scheduled = subscriptions.filter((sub) => sub.cancelAtCycleEnd).length;
    return { active, scheduled };
  }, [subscriptions]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [list, active] = await Promise.all([
        apiService.getSubscriptions({
          search: filters.search || undefined,
          status: filters.status || undefined,
          limit: PAGE_SIZE,
          skip: (page - 1) * PAGE_SIZE,
        }),
        apiService.getActiveSubscriptionCount(),
      ]);

      setSubscriptions(list.subscriptions || []);
      setTotal(list.total || 0);
      setActiveCount(active.count || 0);
      if (selected) {
        const refreshed = list.subscriptions.find((sub) => sub.subscriptionId === selected.subscriptionId);
        if (refreshed) {
          setSelected(refreshed);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (subscriptionId: string) => {
    try {
      setSelectedLoading(true);
      const response = await apiService.getSubscription(subscriptionId);
      setSelected(response.subscription);
    } catch (err) {
      toast({
        tone: 'error',
        title: 'Failed to load subscription',
        message: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setSelectedLoading(false);
    }
  };

  const handleReconcile = async () => {
    if (!selected) return;

    const ok = await confirm({
      title: 'Refresh from Razorpay',
      message: 'This will pull the latest provider state and overwrite the local subscription snapshot.',
      confirmLabel: 'Refresh',
      tone: 'default',
    });
    if (!ok) return;

    try {
      setReconciling(true);
      const response = await apiService.reconcileSubscription(selected.subscriptionId);
      setSelected(response.subscription);
      toast({
        tone: 'success',
        title: 'Subscription refreshed',
        message: 'Local state now matches the provider snapshot.',
      });
      await loadData();
    } catch (err) {
      toast({
        tone: 'error',
        title: 'Refresh failed',
        message: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setReconciling(false);
    }
  };

  const statusCards = [
    { label: 'Total found', value: total.toString(), hint: 'Filtered records' },
    { label: 'Active on page', value: filteredSummary.active.toString(), hint: 'Current page' },
    { label: 'Scheduled cancel', value: filteredSummary.scheduled.toString(), hint: 'Cycle-end cancels' },
    { label: 'Active overall', value: activeCount.toString(), hint: 'Backend count' },
  ];

  if (loading && subscriptions.length === 0) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-10 w-64 rounded-2xl bg-white/10 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-28 rounded-[24px] border border-white/10 bg-white/5 animate-pulse" />
          ))}
        </div>
        <div className="h-[560px] rounded-[28px] border border-white/10 bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/20 bg-black/20">
          <RefreshCw className="h-8 w-8 text-rose-300" />
        </div>
        <h3 className="text-xl font-bold text-white">Failed to load subscriptions</h3>
        <p className="mt-2 max-w-md text-rose-100/80">{error}</p>
        <button
          onClick={() => void loadData()}
          className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/15 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500/25"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-purple-300">Admin Workspace</p>
          <h1 className="mt-2 text-3xl font-light tracking-tight text-white md:text-4xl">Subscriptions</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-300">
            Inspect billing records, compare local state with Razorpay, and jump straight into the related user or plan.
          </p>
        </div>
        <button
          onClick={() => void loadData()}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh list
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statusCards.map((card) => (
          <div key={card.label} className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{card.value}</p>
            <p className="mt-2 text-sm text-gray-400">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
        <div className="border-b border-white/10 p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                value={filters.search}
                onChange={(event) => {
                  setPage(1);
                  setFilters((current) => ({ ...current, search: event.target.value }));
                }}
                placeholder="Search by user, email, plan, subscription ID..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/10"
              />
            </div>
            <select
              value={filters.status}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, status: event.target.value }));
              }}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/10"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="past_due">Past due</option>
              <option value="created">Created</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr className="text-left text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
                <th className="px-5 py-4">Subscription</th>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Plan</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Period</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16">
                    <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-black/15 py-10 text-center">
                      <ReceiptText className="h-10 w-10 text-gray-500" />
                      <p className="mt-4 text-sm font-semibold text-white">No subscriptions matched your filters</p>
                      <p className="mt-1 text-sm text-gray-400">Try broadening the search or clearing the status filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                subscriptions.map((subscription) => (
                  <tr
                    key={subscription.subscriptionId}
                    className="cursor-pointer transition-colors hover:bg-white/5"
                    onClick={() => void openDetail(subscription.subscriptionId)}
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{subscription.subscriptionId}</p>
                      <p className="mt-1 text-xs text-gray-400">{formatDate(subscription.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-white">{subscription.email}</p>
                      <p className="mt-1 text-xs text-gray-400">{subscription.userId}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-white">{subscription.planName || subscription.planId}</p>
                      <p className="mt-1 text-xs text-gray-400">{subscription.planRazorpayId || 'No Razorpay plan ID'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusTone[subscription.status] || 'border-white/10 bg-white/5 text-gray-200'}`}>
                        {formatStatus(subscription.status)}
                      </span>
                      {subscription.cancelAtCycleEnd && (
                        <p className="mt-2 text-xs text-amber-200">Cancel scheduled</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-300">
                      <p>{formatDate(subscription.currentPeriodStart)}</p>
                      <p className="mt-1 text-xs text-gray-500">to {formatDate(subscription.currentPeriodEnd)}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          void openDetail(subscription.subscriptionId);
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                      >
                        Open
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 text-sm text-gray-300 md:flex-row md:items-center md:justify-between">
          <p>
            Showing {subscriptions.length} of {total} subscriptions
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <span className="min-w-20 text-center text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
              Page {page}
            </span>
            <button
              onClick={() => setPage((current) => current + 1)}
              disabled={page * PAGE_SIZE >= total}
              className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/65 p-4 backdrop-blur-sm md:items-stretch">
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              className="flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-black/95 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Subscription detail</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{selected.subscriptionId}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => void handleReconcile()}
                    disabled={reconciling}
                    className="inline-flex items-center gap-2 rounded-2xl border border-purple-400/20 bg-purple-500/15 px-4 py-2.5 text-sm font-semibold text-purple-100 transition-colors hover:bg-purple-500/25 disabled:opacity-50"
                  >
                    {reconciling ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    Refresh
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoTile label="User" value={selected.email} subvalue={selected.userId} icon={User} />
                  <InfoTile label="Plan" value={selected.planName || selected.planId} subvalue={selected.planRazorpayId || 'No Razorpay plan ID'} icon={Package} />
                  <InfoTile label="Status" value={formatStatus(selected.status)} subvalue={selected.cancelAtCycleEnd ? 'Cancellation scheduled' : 'Active billing state'} icon={ReceiptText} />
                  <InfoTile label="Billing period" value={formatDate(selected.currentPeriodStart)} subvalue={`to ${formatDate(selected.currentPeriodEnd)}`} icon={RotateCcw} />
                  <InfoTile label="Razorpay subscription" value={selected.subscriptionId} subvalue={selected.cancelScheduledAt ? `Scheduled at ${formatDate(selected.cancelScheduledAt)}` : 'No pending cancel'} icon={ShieldCheck} />
                  <InfoTile label="Timeline" value={formatDate(selected.createdAt)} subvalue={`Updated ${formatDate(selected.updatedAt)}`} icon={RefreshCw} />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <button
                    onClick={() => router.push(`/admin/users?search=${encodeURIComponent(selected.email)}`)}
                    className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-left text-white transition-colors hover:bg-white/10"
                  >
                    <div>
                      <p className="text-sm font-semibold">Open user view</p>
                      <p className="mt-1 text-xs text-gray-400">Jump to the user record tied to this subscription.</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-300" />
                  </button>
                  <button
                    onClick={() => router.push(`/admin/plans?search=${encodeURIComponent(selected.planId)}`)}
                    className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-left text-white transition-colors hover:bg-white/10"
                  >
                    <div>
                      <p className="text-sm font-semibold">Open plan view</p>
                      <p className="mt-1 text-xs text-gray-400">Inspect the billing tier that powers this record.</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-300" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedLoading && !selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm">
          <div className="rounded-[24px] border border-white/10 bg-black/95 px-6 py-5 text-gray-200 shadow-2xl">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-purple-300" />
              <span className="text-sm font-medium">Loading subscription details...</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function InfoTile({
  label,
  value,
  subvalue,
  icon: Icon,
}: {
  label: string;
  value: string;
  subvalue: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">{label}</p>
          <p className="mt-3 break-words text-base font-semibold text-white">{value}</p>
          <p className="mt-1 text-sm text-gray-400">{subvalue}</p>
        </div>
        <Icon className="h-5 w-5 text-purple-300" />
      </div>
    </div>
  );
}
