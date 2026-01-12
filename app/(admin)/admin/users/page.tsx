// app/admin/users/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { apiService, UserInfo, UserStatsResponse } from '../../lib/apiService';
import UserStatsCards from './components/UserStatsCards';
import UserTable from './components/UserTable';
import UserFilters from './components/UserFilters';
import { RefreshCw, Download, Users as UsersIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserFilters {
  search: string;
  sortBy: 'newest' | 'oldest' | 'email' | 'credits' | 'userId';
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [stats, setStats] = useState<UserStatsResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    sortBy: 'newest'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersResponse, statsResponse] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getUserStats()
      ]);

      setUsers(usersResponse.users);
      setStats(statsResponse.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'User ID', 'Email', 'Credits', 'Created At'].join(','),
      ...users.map(user => [
        user.id,
        user.userId,
        user.email,
        user.credits,
        user.createdAt && user.createdAt !== "0001-01-01T00:00:00Z"
          ? new Date(user.createdAt).toLocaleDateString()
          : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredUsers = users.filter(user => {
    const userEmail = user.email || '';
    const userId = user.userId || '';

    const matchesSearch = userEmail.toLowerCase().includes(filters.search.toLowerCase()) ||
      userId.toLowerCase().includes(filters.search.toLowerCase());

    return matchesSearch;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        const aDate = a.createdAt && a.createdAt !== "0001-01-01T00:00:00Z" ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt && b.createdAt !== "0001-01-01T00:00:00Z" ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      case 'oldest':
        const aDateOld = a.createdAt && a.createdAt !== "0001-01-01T00:00:00Z" ? new Date(a.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
        const bDateOld = b.createdAt && b.createdAt !== "0001-01-01T00:00:00Z" ? new Date(b.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
        return aDateOld - bDateOld;
      case 'email':
        const aEmail = a.email || '';
        const bEmail = b.email || '';
        return aEmail.localeCompare(bEmail);
      case 'userId':
        const aUserId = a.userId || '';
        const bUserId = b.userId || '';
        return aUserId.localeCompare(bUserId);
      case 'credits':
        return b.credits - a.credits;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-10 bg-slate-200 rounded-xl w-64"></div>
            <div className="h-4 bg-slate-100 rounded-xl w-48"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-slate-200 rounded-xl w-32"></div>
            <div className="h-10 bg-slate-200 rounded-xl w-24"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-admin-border h-32 shadow-sm"></div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-admin-border h-96 shadow-sm"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-50/50 rounded-3xl border border-red-100 p-8">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
          <RefreshCw className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-red-900">Failed to load users</h3>
        <p className="text-red-700 mt-2 text-center max-w-md">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-6 px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all"
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-admin-text-main flex items-center gap-3">
            User Directory
          </h1>
          <p className="text-admin-text-muted mt-1 font-medium">Manage and monitor {users.length} registered accounts</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2.5 bg-white border border-admin-border rounded-xl text-sm font-bold text-admin-text-main hover:bg-slate-50 hover:border-admin-primary/30 active:scale-95 transition-all flex items-center gap-2"
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

      {/* Stats Cards */}
      {stats && <UserStatsCards stats={stats} />}

      <div className="bg-white rounded-3xl border border-admin-border shadow-sm overflow-hidden">
        {/* Filters */}
        <UserFilters
          filters={filters}
          onFiltersChange={setFilters}
          userCount={filteredUsers.length}
        />

        {/* User Table */}
        <UserTable
          users={filteredUsers}
          onRefresh={handleRefresh}
        />
      </div>
    </motion.div>
  );
}
