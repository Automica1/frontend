// app/admin/users/components/UserFilters.tsx
"use client";

import React from 'react';

interface UserFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
  role: 'all' | 'admin' | 'user';
  sortBy: 'newest' | 'oldest' | 'name' | 'credits';
}

interface UserFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  userCount: number;
}

export default function UserFilters({ filters, onFiltersChange, userCount }: UserFiltersProps) {
  const updateFilter = (key: keyof UserFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg border mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
        </div>

        {/* Status Filter */}
        <select
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Role Filter */}
        <select
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.role}
          onChange={(e) => updateFilter('role', e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        {/* Sort */}
        <select
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A-Z</option>
          <option value="credits">Credits High-Low</option>
        </select>

        {/* Results Count */}
        <div className="text-sm text-gray-600 whitespace-nowrap">
          {userCount} users found
        </div>
      </div>
    </div>
  );
}