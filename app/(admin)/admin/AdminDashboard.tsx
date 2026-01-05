'use client';

import { useEffect, useState } from "react";
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
  ExternalLink
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
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [mostUsedService, setMostUsedService] = useState<{ name: string, calls: number }>({ name: '--', calls: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserCount() {
      try {
        setIsLoading(true);
        setError(null);
        const usersData = await apiService.getAllUsers();
        setTotalUsers(usersData.count || usersData.users?.length || 0);
      } catch (error) {
        setError(`Failed to load user count: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          const mostUsed = statsData.stats.reduce((prev, current) => {
            return (prev.total_calls > current.total_calls) ? prev : current;
          });

          const formattedName = mostUsed.service_name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          setMostUsedService({ name: formattedName, calls: mostUsed.total_calls });
        } else {
          setMostUsedService({ name: 'No data', calls: 0 });
        }
      } catch (error) {
        setStatsError(`Failed to load usage stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setMostUsedService({ name: 'Error', calls: 0 });
      } finally {
        setIsStatsLoading(false);
      }
    }

    fetchUserCount();
    fetchGlobalUsageStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="space-y-8 pb-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-admin-text-main">Dashboard Overview</h1>
          <p className="text-admin-text-muted mt-1 font-medium">Welcome back, {initialUser?.given_name || 'Admin'}!</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-admin-border rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Dec 30, 2025
          </button>
          <button className="px-4 py-2 bg-admin-primary text-white rounded-xl text-sm font-bold shadow-md shadow-admin-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={isLoading ? '--' : totalUsers.toString()}
          icon={Users}
          color="blue"
          loading={isLoading}
          error={error !== null}
        />
        <StatCard
          title="Most Used Service"
          value={isStatsLoading ? '--' : mostUsedService.name}
          subValue={isStatsLoading ? '' : `${mostUsedService.calls} total calls`}
          icon={Activity}
          color="indigo"
          loading={isStatsLoading}
          error={statsError !== null}
        />
        <StatCard
          title="System Health"
          value="Healthy"
          icon={Shield}
          color="green"
          subValue="99.9% uptime"
        />
        <StatCard
          title="Pending Alerts"
          value="02"
          icon={AlertCircle}
          color="amber"
          subValue="Requires attention"
          isWarning
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Info Card - Takes 2 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-admin-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-admin-border flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-admin-primary" />
              Administrative Information
            </h3>
            <span className="px-3 py-1 bg-admin-primary/10 text-admin-primary text-xs font-bold rounded-full">
              Full Access
            </span>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InfoItem icon={UserIcon} label="Full Name" value={`${initialUser?.given_name} ${initialUser?.family_name}`} />
              <InfoItem icon={Mail} label="Email Address" value={initialUser?.email} />
              <InfoItem icon={Fingerprint} label="User ID" value={initialUser?.id} isCode />
              <div className="space-y-2">
                <p className="text-xs font-bold text-admin-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Assignments
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {initialRoles?.map((role: any) => (
                    <span key={role.id} className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {role.name}
                    </span>
                  ))}
                  {(!initialRoles || initialRoles.length === 0) && <span className="text-sm text-slate-400">No roles assigned</span>}
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 bg-slate-50 border-t border-admin-border flex justify-end">
            <button className="text-sm font-bold text-admin-primary hover:underline flex items-center gap-1 transition-all">
              Update Profile Settings <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Quick Actions / Recent Activity - Takes 1 column */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-admin-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-admin-border">
            <h3 className="text-lg font-bold">Recent System Logs</h3>
          </div>
          <div className="flex-1 p-6 space-y-6">
            <ActivityItem
              title="New user registered"
              time="2 minutes ago"
              status="success"
              description="User 'john.doe@example.com' joined the platform."
            />
            <ActivityItem
              title="Usage limit reached"
              time="1 hour ago"
              status="warning"
              description="Service 'Image Generation' hit 90% quota."
            />
            <ActivityItem
              title="System backup completed"
              time="3 hours ago"
              status="info"
              description="Automated weekly backup was successful."
            />
          </div>
          <button className="w-full p-4 text-xs font-bold text-admin-text-muted border-t border-admin-border hover:bg-slate-50 transition-all">
            VIEW ALL LOGS
          </button>
        </motion.div>
      </div>

      {/* Error Display */}
      {(error || statsError) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 text-red-800">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold">Data Synchronization Error</h4>
              <p className="text-sm opacity-90">Some statistics couldn't be loaded from the server.</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all"
          >
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
  isWarning
}: any) {
  const colors: any = {
    blue: "bg-blue-500 shadow-blue-500/20",
    indigo: "bg-indigo-500 shadow-indigo-500/20",
    green: "bg-emerald-500 shadow-emerald-500/20",
    amber: "bg-amber-500 shadow-amber-500/20",
    red: "bg-red-500 shadow-red-500/20",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl border border-admin-border shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl text-white ${colors[color] || colors.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
        {isWarning && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>}
      </div>
      <div className="mt-5">
        <p className="text-sm font-bold text-admin-text-muted uppercase tracking-wider">{title}</p>
        <div className="mt-1 flex items-baseline gap-2">
          {loading ? (
            <div className="h-9 w-20 bg-slate-100 animate-pulse rounded-lg mt-2"></div>
          ) : error ? (
            <span className="text-red-500 text-sm font-bold">Error</span>
          ) : (
            <h4 className="text-3xl font-extrabold text-admin-text-main tracking-tight">{value}</h4>
          )}
        </div>
        {subValue && !loading && (
          <p className="mt-2 text-xs font-semibold text-admin-text-muted flex items-center gap-1">
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
      <p className="text-xs font-bold text-admin-text-muted uppercase tracking-wider flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" /> {label}
      </p>
      <p className={`text-base font-semibold text-admin-text-main truncate ${isCode ? 'font-mono text-xs bg-slate-50 px-2 py-1 rounded-md border border-slate-100 w-fit' : ''}`}>
        {value || 'N/A'}
      </p>
    </div>
  );
}

function ActivityItem({ title, time, status, description }: any) {
  const statusColors: any = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    info: "bg-blue-500",
    error: "bg-red-500",
  };

  return (
    <div className="flex gap-4">
      <div className="mt-1 relative">
        <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status]} z-10 relative`}></div>
        <div className="absolute top-2.5 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-slate-100 -mb-10 group-last:hidden"></div>
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-admin-text-main">{title}</p>
          <span className="text-[10px] font-bold text-admin-text-muted">{time}</span>
        </div>
        <p className="text-xs text-admin-text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
