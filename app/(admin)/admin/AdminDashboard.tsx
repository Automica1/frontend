'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "../lib/apiService";
import {
  Users,
  Activity,
  Settings,
  AlertCircle,
  ChevronRight,
  User as UserIcon,
  Mail,
  Fingerprint,
  Shield,
  TrendingUp,
  Clock,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

interface ServiceUsageStat {
  service_name: string;
  total_calls: number;
  success_calls: number;
  failed_calls: number;
  total_credits: number;
}

interface GlobalUsageStatsResponse {
  date_range: {
    start_date: string | null;
    end_date: string | null;
  };
  stats: ServiceUsageStat[];
  total_services: number;
}

interface AdminDashboardProps {
  initialUser: any;
  initialRoles: any;
}

export default function AdminDashboard({ initialUser, initialRoles }: AdminDashboardProps) {
  const router = useRouter();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState<number>(0);
  const [mostUsedService, setMostUsedService] = useState<{ name: string; calls: number }>({ name: "--", calls: 0 });
  const [healthStatus, setHealthStatus] = useState<{ status: string; message: string }>({ status: 'loading', message: 'Checking health...' });
  const [recentLogs, setRecentLogs] = useState<Array<{ action: string; targetType: string; targetId?: string; outcome: string; actorEmail: string; timestamp: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubsLoading, setIsSubsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isLogsLoading, setIsLogsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserCount() {
      try {
        setIsLoading(true);
        setError(null);
        const usersData = await apiService.getUsers({ limit: 1, skip: 0 });
        setTotalUsers(usersData.count || usersData.users?.length || 0);
      } catch (err) {
        setError(`Failed to load user count: ${err instanceof Error ? err.message : "Unknown error"}`);
        setTotalUsers(0);
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchGlobalUsageStats() {
      try {
        setIsStatsLoading(true);
        setStatsError(null);
        const statsData: GlobalUsageStatsResponse = await apiService.getGlobalUsageStats();

        if (statsData.stats && statsData.stats.length > 0) {
          const mostUsed = statsData.stats.reduce((prev, current) => (prev.total_calls > current.total_calls ? prev : current));
          const formattedName = mostUsed.service_name
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          setMostUsedService({ name: formattedName, calls: mostUsed.total_calls });
        } else {
          setMostUsedService({ name: "No data", calls: 0 });
        }
      } catch (err) {
        setStatsError(`Failed to load usage stats: ${err instanceof Error ? err.message : "Unknown error"}`);
        setMostUsedService({ name: "Error", calls: 0 });
      } finally {
        setIsStatsLoading(false);
      }
    }

    async function fetchActiveSubscriptions() {
      try {
        setIsSubsLoading(true);
        const data = await apiService.getActiveSubscriptionCount();
        setActiveSubscriptions(data.count);
      } catch (err) {
        console.error("Failed to load active subscriptions", err);
      } finally {
        setIsSubsLoading(false);
      }
    }

    async function fetchRecentLogs() {
      try {
        setIsLogsLoading(true);
        const response = await apiService.getRecentAuditLogs(6);
        setRecentLogs(response.logs.map((log) => ({
          action: log.action.replace(/_/g, ' '),
          targetType: log.targetType,
          targetId: log.targetId,
          outcome: log.outcome,
          actorEmail: log.actorEmail,
          timestamp: log.timestamp,
        })));
      } catch (err) {
        console.error("Failed to load recent admin logs", err);
      } finally {
        setIsLogsLoading(false);
      }
    }

    async function fetchHealth() {
      try {
        const health = await apiService.getHealthStatus();
        setHealthStatus(health);
      } catch (err) {
        console.error("Failed to load backend health", err);
        setHealthStatus({ status: 'degraded', message: 'Backend health check failed' });
      }
    }

    fetchUserCount();
    fetchGlobalUsageStats();
    fetchActiveSubscriptions();
    fetchRecentLogs();
    fetchHealth();
  }, []);

  const handleGenerateReport = () => {
    void (async () => {
      try {
        const { blob, filename } = await apiService.exportAdminSummaryCsv();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `admin-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to export admin summary', error);
      }
    })();
  };

  const openAdminRoute = (href: string) => {
    router.push(href);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <motion.div className="space-y-8 pb-12" initial="hidden" animate="visible" variants={containerVariants}>
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.16),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.10),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-purple-300">Admin Workspace</p>
            <h1 className="text-4xl font-light leading-none tracking-tighter text-white md:text-5xl">
              Dashboard Overview
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-300 md:text-base">
              Welcome back, {initialUser?.given_name || "Admin"}. Track the platform, the subscriptions, and the service usage that keeps Automica moving.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-gray-200 backdrop-blur-xl">
              <Clock className="h-4 w-4 text-purple-300" />
              {todayLabel}
            </div>
            <button
              onClick={handleGenerateReport}
              className="inline-flex items-center gap-2 rounded-2xl border border-purple-400/20 bg-gradient-to-r from-purple-500/90 to-pink-500/90 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <TrendingUp className="h-4 w-4" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={isLoading ? "--" : totalUsers.toString()}
          icon={Users}
          color="blue"
          loading={isLoading}
          error={error !== null}
          onClick={() => openAdminRoute('/admin/users')}
        />
        <StatCard
          title="Most Used Service"
          value={isStatsLoading ? "--" : mostUsedService.name}
          subValue={isStatsLoading ? "" : `${mostUsedService.calls} total calls`}
          icon={Activity}
          color="indigo"
          loading={isStatsLoading}
          error={statsError !== null}
          onClick={() => openAdminRoute('/admin/services')}
        />
        <StatCard
          title="Active Subscriptions"
          value={isSubsLoading ? "--" : activeSubscriptions.toString()}
          icon={TrendingUp}
          color="green"
          loading={isSubsLoading}
          subValue="Paid monthly plans"
          onClick={() => openAdminRoute('/admin/subscriptions')}
        />
        <StatCard
          title="System Health"
          value={healthStatus.status === 'healthy' ? 'Healthy' : healthStatus.status === 'degraded' ? 'Degraded' : 'Checking'}
          icon={Shield}
          color="yellow"
          subValue={healthStatus.message}
          loading={healthStatus.status === 'loading'}
          error={healthStatus.status === 'degraded'}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-2 overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Settings className="h-5 w-5 text-purple-300" />
              Administrative Information
            </h3>
            <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-200">
              Full Access
            </span>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <InfoItem icon={UserIcon} label="Full Name" value={`${initialUser?.given_name || ""} ${initialUser?.family_name || ""}`.trim()} />
              <InfoItem icon={Mail} label="Email Address" value={initialUser?.email} />
              <InfoItem icon={Fingerprint} label="User ID" value={initialUser?.id} isCode />

              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <Shield className="h-3.5 w-3.5" />
                  Assignments
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {initialRoles?.map((role: any) => (
                    <span key={role.id} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-200">
                      {role.name}
                    </span>
                  ))}
                  {(!initialRoles || initialRoles.length === 0) && <span className="text-sm text-gray-500">No roles assigned</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-white/10 bg-black/20 p-6">
            <button
              onClick={() => openAdminRoute('/admin/settings')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-purple-300 transition-colors hover:text-purple-200"
            >
              Update Profile Settings <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
          <div className="border-b border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white">Recent Admin Activity</h3>
          </div>

          <div className="flex-1 space-y-6 p-6">
            {isLogsLoading ? (
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-gray-400">Loading live admin activity...</div>
            ) : recentLogs.length > 0 ? (
              recentLogs.map((log, index) => (
                <ActivityItem
                  key={`${log.action}-${index}`}
                  title={log.action}
                  time={new Date(log.timestamp).toLocaleString()}
                  status={log.outcome === 'success' ? 'success' : 'error'}
                  description={`${log.actorEmail} updated ${log.targetType}${log.targetId ? ` ${log.targetId}` : ''}`}
                />
              ))
            ) : (
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-gray-400">
                No recent admin actions yet.
              </div>
            )}
          </div>

          <button
            onClick={() => openAdminRoute('/admin/logs')}
            className="w-full border-t border-white/10 p-4 text-xs font-bold uppercase tracking-[0.25em] text-gray-400 transition-all hover:bg-white/5 hover:text-white"
          >
            View all logs
          </button>
        </motion.div>
      </div>

      {(error || statsError) && (
        <motion.div
          variants={itemVariants}
          className="flex items-start gap-3 rounded-[24px] border border-red-500/20 bg-red-500/10 p-5 text-red-100 backdrop-blur-2xl"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
          <div className="flex-1">
            <p className="mb-1 font-semibold">Some data failed to load</p>
            <p className="text-sm text-red-100/80">
              {error || statsError}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Sync
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  color,
  loading,
  error,
  onClick,
}: any) {
  const colors: any = {
    blue: "from-purple-500/70 to-indigo-500/70",
    indigo: "from-fuchsia-500/70 to-purple-600/70",
    green: "from-emerald-500/70 to-teal-500/70",
    yellow: "from-amber-500/70 to-orange-500/70",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-purple-400/30 hover:bg-white/8' : ''}`}
      onClick={onClick}
    >
      <div className={`absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br ${colors[color] || colors.blue} opacity-15 blur-3xl`} />
      <div className="relative">
        <div className="mb-3 flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${colors[color] || colors.blue} text-white shadow-lg shadow-black/20`}>
            {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Icon className="h-5 w-5" />}
          </div>
          {error && <AlertCircle className="h-5 w-5 text-red-300" />}
        </div>

        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400">{title}</p>
        <h4 className="text-3xl font-light tracking-tighter text-white">{value}</h4>
        {subValue && !loading && (
          <p className="mt-2 text-xs font-medium text-gray-400">
            {subValue}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function InfoItem({ icon: Icon, label, value, isCode }: any) {
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className={`w-fit truncate rounded-2xl border border-white/10 px-3 py-2 text-base font-medium text-white ${isCode ? "font-mono text-xs" : ""} bg-white/5`}>
        {value || "N/A"}
      </p>
    </div>
  );
}

function ActivityItem({ title, time, status, description }: any) {
  const statusColors: any = {
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    info: "bg-sky-400",
    error: "bg-rose-400",
  };

  return (
    <div className="flex gap-4">
      <div className="mt-1 relative">
        <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status]} z-10 relative`} />
        <div className="absolute top-2.5 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/10 -mb-10 group-last:hidden" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white">{title}</p>
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">{time}</span>
        </div>
        <p className="text-xs leading-relaxed text-gray-400">{description}</p>
      </div>
    </div>
  );
}
