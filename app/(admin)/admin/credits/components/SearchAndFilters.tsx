import React from 'react';
import { Search } from 'lucide-react';

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: 'all' | 'used' | 'unused' | 'my-tokens';
  setFilterStatus: (status: 'all' | 'used' | 'unused' | 'my-tokens') => void;
  sortBy: 'createdAt' | 'credits' | 'expiresAt';
  setSortBy: (field: 'createdAt' | 'credits' | 'expiresAt') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

export default function SearchAndFilters({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}: SearchAndFiltersProps) {
  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-');
    setSortBy(field as 'createdAt' | 'credits' | 'expiresAt');
    setSortOrder(order as 'asc' | 'desc');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 flex-1">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
        />
      </div>
      
      {/* Filter */}
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value as 'all' | 'used' | 'unused' | 'my-tokens')}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">All Tokens</option>
        <option value="my-tokens">My Tokens</option>
        <option value="used">Used Only</option>
        <option value="unused">Unused Only</option>
      </select>
      
      {/* Sort */}
      <select
        value={`${sortBy}-${sortOrder}`}
        onChange={(e) => handleSortChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="createdAt-desc">Newest First</option>
        <option value="createdAt-asc">Oldest First</option>
        <option value="credits-desc">Highest Credits</option>
        <option value="credits-asc">Lowest Credits</option>
        <option value="expiresAt-asc">Expiring Soon</option>
        <option value="expiresAt-desc">Expiring Later</option>
      </select>
    </div>
  );
}