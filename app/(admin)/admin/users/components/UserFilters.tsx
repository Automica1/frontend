// app/admin/users/components/UserFilters.tsx
"use client";

import React from 'react';
import { Search, SortAsc, Filter } from 'lucide-react';

interface UserFilters {
  search: string;
  sortBy: 'newest' | 'oldest' | 'email' | 'credits' | 'userId';
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
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-300 transition-colors" />
            <input
              type="text"
              placeholder="Search by email or unique identifier..."
              className="w-full rounded-2xl border border-white/10 bg-black/20 py-2.5 pl-11 pr-4 text-sm font-medium text-white outline-none transition-all placeholder:text-gray-500 focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/10"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <select
              className="cursor-pointer appearance-none rounded-2xl border border-white/10 bg-black/20 py-2.5 pl-9 pr-8 text-sm font-bold text-white outline-none transition-all focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/10"
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              aria-label="Sort users by"
            >
              <option value="newest">Recent Joining</option>
              <option value="oldest">Early Users</option>
              <option value="email">By Email A-Z</option>
              <option value="userId">By Identifier</option>
              <option value="credits">Highest Credits</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
          </div>

          <div className="h-8 w-px bg-white/10 mx-1"></div>

          {/* Results Count */}
          <div className="whitespace-nowrap rounded-lg border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-purple-200">
            {userCount} MATCHES
          </div>
        </div>
      </div>
    </div>
  );
}
