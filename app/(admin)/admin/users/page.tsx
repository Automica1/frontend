// app/admin/users/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { apiService, UserInfo, UserStatsResponse } from '../../lib/apiService';
import UserStatsCards from './components/UserStatsCards';
import UserTable from './components/UserTable';
import UserFilters from './components/UserFilters';

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
        // Handle invalid dates by treating them as very old
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
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border h-32"></div>
            ))}
          </div>
          <div className="bg-white rounded-lg border h-96"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Users</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor user accounts</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh All
          </button>
          <button
            onClick={handleExport}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && <UserStatsCards stats={stats} />}

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
  );
}