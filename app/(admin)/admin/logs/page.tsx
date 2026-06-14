'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Copy,
  ExternalLink,
  Filter,
  LayoutList,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Clock3,
  Activity,
  User,
  Gauge,
  Server,
} from 'lucide-react';
import { apiService, type AdminLogEntry } from '../../lib/apiService';
import { useAdminFeedback } from '../../components/AdminFeedback';

type LogSource = 'backend-access' | 'backend-error' | 'web-access' | 'web-error' | 'audit' | 'usage';
type LogKindFilter = 'all' | 'signal' | 'page-view' | 'api-request' | 'internal-request' | 'asset-request';

const PAGE_SIZE = 25;

const SOURCE_META: Record<LogSource, { label: string; icon: any; accent: string; help: string }> = {
  'backend-access': {
    label: 'Backend Access',
    icon: LayoutList,
    accent: 'from-sky-500/25 to-cyan-500/10 border-sky-400/20 text-sky-200',
    help: 'Request-level logs from the backend runtime.',
  },
  'backend-error': {
    label: 'Backend Errors',
    icon: ShieldAlert,
    accent: 'from-rose-500/25 to-red-500/10 border-rose-400/20 text-rose-200',
    help: 'Runtime errors and failures that need attention.',
  },
  'web-access': {
    label: 'Web Edge',
    icon: Server,
    accent: 'from-cyan-500/25 to-sky-500/10 border-cyan-400/20 text-cyan-200',
    help: 'Edge access logs for the site and API proxy.',
  },
  'web-error': {
    label: 'Web Errors',
    icon: AlertCircle,
    accent: 'from-orange-500/25 to-amber-500/10 border-orange-400/20 text-orange-200',
    help: 'Edge warnings and error lines from the proxy.',
  },
  audit: {
    label: 'Audit',
    icon: ShieldCheck,
    accent: 'from-emerald-500/25 to-teal-500/10 border-emerald-400/20 text-emerald-200',
    help: 'Admin actions recorded in MongoDB.',
  },
  usage: {
    label: 'Usage',
    icon: Activity,
    accent: 'from-purple-500/25 to-pink-500/10 border-purple-400/20 text-purple-200',
    help: 'Service usage and request activity.',
  },
};

function formatDateTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function statusTone(status?: number) {
  if (!status) return 'border-white/10 bg-white/5 text-gray-200';
  if (status >= 500) return 'border-rose-500/20 bg-rose-500/10 text-rose-200';
  if (status >= 400) return 'border-amber-500/20 bg-amber-500/10 text-amber-200';
  return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200';
}

function levelTone(level?: string) {
  const normalized = (level || '').toLowerCase();
  if (normalized === 'error' || normalized === 'fatal') return 'border-rose-500/20 bg-rose-500/10 text-rose-200';
  if (normalized === 'warn' || normalized === 'warning') return 'border-amber-500/20 bg-amber-500/10 text-amber-200';
  return 'border-white/10 bg-white/5 text-gray-200';
}

function kindTone(kind?: string) {
  const normalized = (kind || '').toLowerCase();
  if (normalized === 'page-view') return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200';
  if (normalized === 'api-request') return 'border-sky-500/20 bg-sky-500/10 text-sky-200';
  if (normalized === 'internal-request') return 'border-amber-500/20 bg-amber-500/10 text-amber-200';
  if (normalized === 'asset-request') return 'border-white/10 bg-white/5 text-gray-300';
  if (normalized === 'error') return 'border-rose-500/20 bg-rose-500/10 text-rose-200';
  if (normalized === 'signal') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200';
  return 'border-white/10 bg-white/5 text-gray-200';
}

function isAccessSource(source: LogSource) {
  return source === 'backend-access' || source === 'web-access';
}

function normalizeKind(value: string | null, source: LogSource): LogKindFilter {
  const normalized = (value || '').toLowerCase();
  if (normalized === 'page-view' || normalized === 'api-request' || normalized === 'internal-request' || normalized === 'asset-request' || normalized === 'signal') {
    return normalized;
  }
  return isAccessSource(source) ? 'signal' : 'all';
}

function displayKind(kind?: string) {
  switch ((kind || '').toLowerCase()) {
    case 'page-view':
      return 'Page view';
    case 'api-request':
      return 'API request';
    case 'internal-request':
      return 'Internal';
    case 'asset-request':
      return 'Asset';
    case 'error':
      return 'Error';
    case 'signal':
      return 'Signal';
    default:
      return kind || '—';
  }
}

export default function AdminLogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useAdminFeedback();

  const normalizeSource = (value: string | null): LogSource => {
    switch ((value || '').toLowerCase()) {
      case 'access':
      case 'backend-access':
        return 'backend-access';
      case 'error':
      case 'backend-error':
        return 'backend-error';
      case 'web-access':
      case 'web-error':
      case 'audit':
      case 'usage':
        return value as LogSource;
      default:
        return 'backend-access';
    }
  };

  const [source, setSource] = useState<LogSource>(() => normalizeSource(searchParams.get('source')));
  const [kind, setKind] = useState<LogKindFilter>(() => normalizeKind(searchParams.get('kind'), normalizeSource(searchParams.get('source'))));
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminLogEntry | null>(null);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [route, setRoute] = useState('');
  const [requestId, setRequestId] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const applyKindFilter = (nextKind: LogKindFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('source', source);
    params.set('kind', nextKind);
    router.replace(`/admin/logs?${params.toString()}`);
    setKind(nextKind);
    setPage(1);
  };

  useEffect(() => {
    void loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, kind, page, search, level, email, userId, route, requestId, status, startDate, endDate]);

  const filtersActive = useMemo(() => {
    return [search, level, email, userId, route, requestId, status, startDate, endDate, kind !== 'all' ? kind : ''].filter(Boolean).length;
  }, [search, level, email, userId, route, requestId, status, startDate, endDate, kind]);

  const summary = useMemo(() => {
    const normalizedKind = (value?: string) => (value || '').toLowerCase();
    const isSignal = (value?: string) => !['asset-request', 'internal-request'].includes(normalizedKind(value));
    return {
      signal: logs.filter((log) => isSignal(log.kind)).length,
      pageViews: logs.filter((log) => normalizedKind(log.kind) === 'page-view').length,
      apiRequests: logs.filter((log) => normalizedKind(log.kind) === 'api-request').length,
      internalRequests: logs.filter((log) => normalizedKind(log.kind) === 'internal-request').length,
      assets: logs.filter((log) => normalizedKind(log.kind) === 'asset-request').length,
      error: logs.filter((log) => log.category === 'backend-error' || log.category === 'web-error' || normalizedKind(log.kind) === 'error').length,
      webAccess: logs.filter((log) => log.category === 'web-access').length,
      webError: logs.filter((log) => log.category === 'web-error').length,
      audit: logs.filter((log) => log.category === 'audit').length,
      usage: logs.filter((log) => log.category === 'usage').length,
    };
  }, [logs]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAdminLogs({
        source,
        search: search || undefined,
        level: level || undefined,
        email: email || undefined,
        userId: userId || undefined,
        route: route || undefined,
        requestId: requestId || undefined,
        status: status || undefined,
        kind: isAccessSource(source) && kind !== 'all' ? kind : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        limit: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
      });

      setLogs(response.logs || []);
      setTotal(response.total || 0);
      if (response.logs?.length) {
        setSelected((current) => current && response.logs.some((item) => item.id === current.id) ? current : response.logs[0]);
      } else {
        setSelected(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setLevel('');
    setEmail('');
    setUserId('');
    setRoute('');
    setRequestId('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setKind(isAccessSource(source) ? 'signal' : 'all');
    setPage(1);
  };

  const openUser = () => {
    const target = selected?.email || selected?.userId;
    if (!target) return;
    router.push(`/admin/users?search=${encodeURIComponent(target)}`);
  };

  const openSubscription = () => {
    if (!selected?.userId && !selected?.email) return;
    const params = new URLSearchParams();
    if (selected.userId) params.set('userId', selected.userId);
    if (selected.email) params.set('email', selected.email);
    router.push(`/admin/subscriptions?${params.toString()}`);
  };

  const openService = () => {
    if (!selected?.serviceName) return;
    router.push(`/admin/services?service=${encodeURIComponent(selected.serviceName)}`);
  };

  const copyField = async (value?: string | null, label = 'Value') => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast({
      tone: 'success',
      title: `${label} copied`,
      message: value,
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentMeta = SOURCE_META[source];
  const CurrentIcon = currentMeta.icon;
  const accessSource = isAccessSource(source);
  const isErrorSource = source === 'backend-error' || source === 'web-error';
  const kindOptions: Array<{ value: LogKindFilter; label: string }> = accessSource
    ? [
        { value: 'signal', label: `Signals (${summary.signal})` },
        { value: 'page-view', label: `Page views (${summary.pageViews})` },
        { value: 'api-request', label: `API (${summary.apiRequests})` },
        { value: 'internal-request', label: `Internal (${summary.internalRequests})` },
        { value: 'asset-request', label: `Assets (${summary.assets})` },
        { value: 'all', label: 'All' },
      ]
    : [{ value: 'all', label: 'All' }];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-purple-300">Admin Workspace</p>
            <h1 className="mt-2 text-3xl font-light tracking-tight text-white md:text-4xl">Logs</h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              Centralized logs for requests, failures, admin actions, and usage events. {currentMeta.help}
            </p>
          </div>
          <div className={`inline-flex max-w-fit items-center gap-2 rounded-2xl border bg-gradient-to-r px-3 py-2 text-sm backdrop-blur-xl ${currentMeta.accent}`}>
            <CurrentIcon className="h-4 w-4" />
            {currentMeta.label}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(
          accessSource
            ? [
                { label: 'Total', value: total },
                { label: 'On page', value: logs.length },
                { label: 'Page views', value: summary.pageViews, kind: 'page-view' as const },
                { label: 'Internal calls', value: summary.internalRequests, kind: 'internal-request' as const },
              ]
            : [
                { label: 'Total', value: total },
                { label: 'On page', value: logs.length },
                { label: 'Filtered', value: filtersActive },
                { label: 'Errors', value: summary.error },
              ]
        ).map((item) => {
          const clickable = accessSource && 'kind' in item && item.kind;
          const active = clickable && kind === item.kind;
          const Card = clickable ? 'button' : 'div';
          return (
          <Card
            key={item.label}
            type={clickable ? 'button' : undefined}
            onClick={clickable ? () => applyKindFilter(item.kind) : undefined}
            className={`rounded-[24px] border border-white/10 bg-white/5 p-5 text-left shadow-xl backdrop-blur-2xl transition-colors ${
              clickable
                ? active
                  ? 'cursor-pointer border-cyan-400/40 bg-cyan-500/10'
                  : 'cursor-pointer hover:border-white/15 hover:bg-white/7'
                : ''
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
          </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-black/25 p-4 shadow-xl backdrop-blur-2xl">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex flex-wrap gap-2 lg:flex-1">
                {(['backend-access', 'backend-error', 'web-access', 'web-error', 'audit', 'usage'] as LogSource[]).map((item) => {
                  const active = source === item;
                  const Icon = SOURCE_META[item].icon;
                  return (
                    <button
                      key={item}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('source', item);
                        params.set('kind', item === 'backend-access' || item === 'web-access' ? 'signal' : 'all');
                        router.replace(`/admin/logs?${params.toString()}`);
                        setSource(item);
                        setKind(item === 'backend-access' || item === 'web-access' ? 'signal' : 'all');
                        setPage(1);
                      }}
                      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors ${
                        active
                          ? 'border-white/15 bg-white/10 text-white'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {SOURCE_META[item].label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-1 flex-wrap items-center gap-2 lg:justify-end">
                <button
                  onClick={() => void loadLogs()}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <Filter className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gray-500">
                  <Search className="h-3.5 w-3.5" /> Search
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Message, path, actor, service..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gray-500">
                  <Gauge className="h-3.5 w-3.5" /> Level / Status
                </div>
                <input
                  value={isErrorSource ? level : accessSource ? status : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (isErrorSource) {
                      setLevel(value);
                      setStatus('');
                    } else if (accessSource) {
                      setStatus(value);
                      setLevel('');
                    }
                  }}
                  placeholder="error, warn, 200, 500"
                  disabled={!accessSource && !isErrorSource}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gray-500">
                  <User className="h-3.5 w-3.5" /> Email / User
                </div>
                <input
                  value={email || userId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    setUserId(value);
                  }}
                  placeholder="user email or id"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gray-500">
                  <Clock3 className="h-3.5 w-3.5" /> Date Range
                </div>
                <div className="flex gap-2">
                  <input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" className="w-full bg-transparent text-sm text-white outline-none" />
                  <input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" className="w-full bg-transparent text-sm text-white outline-none" />
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gray-500">
                  <LayoutList className="h-3.5 w-3.5" /> Route / Service
                </div>
                <input
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  placeholder="/go/health or service name"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gray-500">
                  <Gauge className="h-3.5 w-3.5" /> Request ID / Target
                </div>
                <input
                  value={requestId}
                  onChange={(e) => setRequestId(e.target.value)}
                  placeholder="request id or target id"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gray-500">
                  <Server className="h-3.5 w-3.5" /> Status / Outcome
                </div>
                <input
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="200, 500, success, failed"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
              </div>
            </div>

            {accessSource ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {kindOptions.map((option) => {
                  const active = kind === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => applyKindFilter(option.value)}
                      className={`inline-flex items-center rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors ${
                        active
                          ? 'border-white/15 bg-white/10 text-white'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {loading && logs.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center text-gray-300">
              Loading logs...
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-8 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-rose-200" />
              <p className="mt-3 text-lg font-semibold text-white">Failed to load logs</p>
              <p className="mt-2 text-sm text-rose-100/80">{error}</p>
              <button
                onClick={() => void loadLogs()}
                className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/20 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500/30"
              >
                Try again
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 text-center text-gray-300">
              No {currentMeta.label.toLowerCase()} logs matched your filters.
            </div>
          ) : (
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/25 shadow-2xl backdrop-blur-2xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-white/5 text-left text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                    <tr>
                      <th className="px-5 py-4">Time</th>
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Summary</th>
                      <th className="px-5 py-4">Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        onClick={() => setSelected(log)}
                        className={`cursor-pointer transition-colors hover:bg-white/5 ${selected?.id === log.id ? 'bg-white/5' : ''}`}
                      >
                        <td className="px-5 py-4 align-top text-sm text-gray-300">{formatDateTime(log.timestamp)}</td>
                        <td className="px-5 py-4 align-top">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${log.category === 'backend-access' ? 'border-sky-500/20 bg-sky-500/10 text-sky-200' : log.category === 'backend-error' ? 'border-rose-500/20 bg-rose-500/10 text-rose-200' : log.category === 'web-access' ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200' : log.category === 'web-error' ? 'border-orange-500/20 bg-orange-500/10 text-orange-200' : log.category === 'audit' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' : 'border-purple-500/20 bg-purple-500/10 text-purple-200'}`}>
                            {log.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="text-sm font-medium text-white">{log.message || '—'}</div>
                          <div className="mt-1 text-xs text-gray-400">
                            {log.route || log.path || log.action || log.serviceName || log.targetType || '—'}
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-gray-300">
                          {source === 'backend-access' && (
                            <div className="space-y-1">
                              <div>{log.method || '—'} <span className="text-gray-500">{log.path || ''}</span></div>
                              <div className="flex flex-wrap gap-2">
                                {log.kind ? <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${kindTone(log.kind)}`}>{displayKind(log.kind)}</span> : null}
                                {log.status ? <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusTone(log.status)}`}>{log.status}</span> : null}
                                {log.requestId ? <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">{log.requestId}</span> : null}
                                {log.email ? <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">{log.email}</span> : null}
                              </div>
                            </div>
                          )}
                          {source === 'backend-error' && (
                            <div className="space-y-1">
                              <div className="flex flex-wrap gap-2">
                                {log.level ? <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${levelTone(log.level)}`}>{log.level}</span> : null}
                                {log.requestId ? <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">{log.requestId}</span> : null}
                                {log.path ? <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">{log.path}</span> : null}
                              </div>
                            </div>
                          )}
                          {source === 'web-access' && (
                            <div className="space-y-1">
                              <div>{log.method || '—'} <span className="text-gray-500">{log.path || ''}</span></div>
                              <div className="flex flex-wrap gap-2">
                                {log.kind ? <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${kindTone(log.kind)}`}>{displayKind(log.kind)}</span> : null}
                                {log.status ? <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusTone(log.status)}`}>{log.status}</span> : null}
                                {log.clientIp ? <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">{log.clientIp}</span> : null}
                                {log.referer ? <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">referer</span> : null}
                                {log.host ? <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">{log.host}</span> : null}
                              </div>
                            </div>
                          )}
                          {source === 'web-error' && (
                            <div className="space-y-1">
                              <div className="flex flex-wrap gap-2">
                                {log.level ? <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${levelTone(log.level)}`}>{log.level}</span> : null}
                                {log.clientIp ? <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">{log.clientIp}</span> : null}
                                {log.host ? <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">{log.host}</span> : null}
                                {log.referer ? <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">referer</span> : null}
                              </div>
                            </div>
                          )}
                          {source === 'audit' && (
                            <div className="space-y-1">
                              <div>{log.actorEmail || '—'}</div>
                              <div className="text-xs text-gray-500">{log.targetType || '—'} {log.targetId ? `• ${log.targetId}` : ''}</div>
                            </div>
                          )}
                          {source === 'usage' && (
                            <div className="space-y-1">
                              <div>{log.userId || '—'}</div>
                              <div className="text-xs text-gray-500">{log.serviceName || '—'} {log.endpoint ? `• ${log.endpoint}` : ''}</div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 px-5 py-4 text-sm text-gray-300">
                <div>
                  Page {page} of {totalPages} • {total} total
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page >= totalPages}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 xl:sticky xl:top-4 self-start">
          <div className="rounded-[28px] border border-white/10 bg-black/25 p-5 shadow-2xl backdrop-blur-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-purple-300">Details</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Selected entry</h2>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {selected?.requestId ? (
                  <button
                    onClick={() => void copyField(selected.requestId, 'Request ID')}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy ID
                  </button>
                ) : null}
                {selected?.route || selected?.path ? (
                  <button
                    onClick={() => void copyField(selected.route || selected.path, 'Route')}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy route
                  </button>
                ) : null}
                {selected?.email || selected?.actorEmail ? (
                  <button
                    onClick={() => void copyField(selected.email || selected.actorEmail, 'Email')}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy email
                  </button>
                ) : null}
              </div>
            </div>

            {selected ? (
              <div className="flex max-h-[calc(100vh-220px)] flex-col gap-4 overflow-y-auto pr-1">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${selected.category === 'backend-error' || selected.category === 'web-error' ? 'border-rose-500/20 bg-rose-500/10 text-rose-200' : selected.category === 'web-access' ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200' : selected.category === 'backend-access' ? 'border-sky-500/20 bg-sky-500/10 text-sky-200' : selected.category === 'audit' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' : 'border-purple-500/20 bg-purple-500/10 text-purple-200'}`}>
                      {selected.category}
                    </span>
                    {selected.kind ? <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${kindTone(selected.kind)}`}>{displayKind(selected.kind)}</span> : null}
                    {selected.status ? <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${statusTone(selected.status)}`}>{selected.status}</span> : null}
                    {selected.level ? <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${levelTone(selected.level)}`}>{selected.level}</span> : null}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white">{selected.message}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['Time', formatDateTime(selected.timestamp)],
                    ['Request ID', selected.requestId || '—'],
                    ['Email', selected.email || selected.actorEmail || '—'],
                    ['User', selected.userId || selected.actorId || '—'],
                    ['Route', selected.route || selected.path || '—'],
                    ['Service', selected.serviceName || '—'],
                    ['Category', selected.category],
                    ['Kind', displayKind(selected.kind)],
                    ['Status', selected.status ? String(selected.status) : '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-500">{label}</p>
                      <p className="mt-2 break-words text-sm text-white">{value}</p>
                    </div>
                  ))}
                </div>

                <details className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-[0.28em] text-gray-400">
                    More metadata
                  </summary>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      ['Client IP', selected.clientIp || selected.remoteIp || selected.ipAddress || '—'],
                      ['Host', selected.host || '—'],
                      ['Upstream', selected.upstream || '—'],
                      ['Endpoint', selected.endpoint || '—'],
                      ['Outcome', selected.outcome || '—'],
                      ['Reason', selected.reason || '—'],
                      ['Referer', selected.referer || '—'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-500">{label}</p>
                        <p className="mt-2 break-words text-sm text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </details>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={openUser}
                    disabled={!selected.email && !selected.userId}
                    className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-40"
                  >
                    Open user
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={openSubscription}
                    disabled={!selected.email && !selected.userId}
                    className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-40"
                  >
                    Open subscriptions
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    onClick={openService}
                    disabled={!selected.serviceName}
                    className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-40"
                  >
                    Open service
                    <Server className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-gray-300">
                Pick a log row to inspect its fields and jump to related admin pages.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
