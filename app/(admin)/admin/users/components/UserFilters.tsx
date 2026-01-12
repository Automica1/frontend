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
    <div className="p-4 border-b border-admin-border bg-slate-50/30">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-admin-text-muted group-focus-within:text-admin-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by email or unique identifier..."
              className="pl-11 pr-4 py-2.5 bg-white border border-admin-border rounded-xl focus:ring-2 focus:ring-admin-primary/10 focus:border-admin-primary/50 outline-none w-full text-sm font-medium transition-all"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-muted pointer-events-none" />
            <select
              className="pl-9 pr-8 py-2.5 bg-white border border-admin-border rounded-xl focus:ring-2 focus:ring-admin-primary/10 focus:border-admin-primary/50 outline-none text-sm font-bold text-admin-text-main appearance-none cursor-pointer transition-all"
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
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-admin-text-muted pointer-events-none" />
          </div>

          <div className="h-8 w-px bg-admin-border mx-1"></div>

          {/* Results Count */}
          <div className="px-3 py-1 bg-admin-primary/5 rounded-lg text-[10px] font-extrabold text-admin-primary uppercase tracking-widest whitespace-nowrap">
            {userCount} MATCHES
          </div>
        </div>
      </div>
    </div>
  );
}
