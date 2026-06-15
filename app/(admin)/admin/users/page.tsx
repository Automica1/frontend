"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiService, UserInfo, UserStatsResponse } from '../../lib/apiService';
import UserStatsCards from './components/UserStatsCards';
import UserTable from './components/UserTable';
import UserFilters from './components/UserFilters';
import { RefreshCw, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserFiltersState {
  search: string;
  sortBy: 'newest' | 'oldest' | 'email' | 'credits' | 'userId';
}

const PAGE_SIZE = 12;

export default function UsersPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [stats, setStats] = useState<UserStatsResponse['stats'] | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<UserFiltersState>({
    search: searchParams?.get('search') || '',
    sortBy: 'newest'
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, page]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersResponse, statsResponse] = await Promise.all([
        apiService.getUsers({
          search: filters.search,
          limit: PAGE_SIZE,
          skip: (page - 1) * PAGE_SIZE,
        }),
        apiService.getUserStats()
      ]);

      setUsers(usersResponse.users);
      setStats(statsResponse.stats);
      setTotalUsers(usersResponse.count || usersResponse.users.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleExport = async () => {
    const { blob, filename } = await apiService.exportUsersCsv({
      search: filters.search || undefined,
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sortedUsers = [...users].sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'oldest':
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      case 'email':
        return (a.email || '').localeCompare(b.email || '');
      case 'userId':
        return (a.userId || '').localeCompare(b.userId || '');
      case 'credits':
        return (b.credits || 0) - (a.credits || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-10 w-64 rounded-xl bg-white/10"></div>
            <div className="h-4 w-48 rounded-xl bg-white/10"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 rounded-xl bg-white/10"></div>
            <div className="h-10 w-24 rounded-xl bg-white/10"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 h-32 shadow-2xl backdrop-blur-2xl"></div>
          ))}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 h-96 shadow-2xl backdrop-blur-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-8">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/20 bg-black/20">
          <RefreshCw className="h-8 w-8 text-rose-300" />
        </div>
        <h3 className="text-xl font-bold text-white">Failed to load users</h3>
        <p className="mt-2 max-w-md text-center text-rose-100/80">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-6 rounded-xl border border-rose-500/20 bg-rose-500/15 px-6 py-2.5 font-bold text-white transition-all hover:bg-rose-500/25"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-admin-text-main flex items-center gap-3">
            User Directory
          </h1>
          <p className="text-admin-text-muted mt-1 font-medium">
            Manage and monitor {totalUsers} registered accounts
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition-all hover:border-white/20 hover:bg-white/10 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Data
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-admin-primary text-white rounded-xl text-sm font-bold shadow-md shadow-admin-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {stats && <UserStatsCards stats={stats} />}

      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
        <UserFilters
          filters={filters}
          onFiltersChange={(next) => {
            setPage(1);
            setFilters(next);
          }}
          userCount={totalUsers}
        />

        <UserTable
          users={sortedUsers}
          onRefresh={handleRefresh}
        />
      </div>

      <div className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-sm text-gray-300">
        <p>
          Showing {users.length} of {totalUsers} users
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
            disabled={page * PAGE_SIZE >= totalUsers}
            className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
