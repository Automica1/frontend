import React from 'react';
import { Plus, Download } from 'lucide-react';
import SearchAndFilters from './SearchAndFilters';

interface ActionsBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: 'all' | 'used' | 'unused' | 'my-tokens';
  setFilterStatus: (status: 'all' | 'used' | 'unused' | 'my-tokens') => void;
  sortBy: 'createdAt' | 'credits' | 'expiresAt';
  setSortBy: (field: 'createdAt' | 'credits' | 'expiresAt') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  onExport: () => void;
  onGenerateToken: () => void;
}

export default function ActionsBar({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onExport,
  onGenerateToken
}: ActionsBarProps) {
  return (
    <div className="border-b border-white/10 bg-black/20 p-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <SearchAndFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
        
        <div className="flex gap-3">
          <button
            onClick={onExport}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-gray-200 transition-colors hover:bg-white/10"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <button
            onClick={onGenerateToken}
            className="flex items-center gap-2 rounded-2xl border border-purple-400/20 bg-gradient-to-r from-purple-500/90 to-pink-500/90 px-4 py-2 text-white transition-colors hover:opacity-95"
          >
            <Plus className="w-4 h-4" />
            Generate Token
          </button>
        </div>
      </div>
    </div>
  );
}
