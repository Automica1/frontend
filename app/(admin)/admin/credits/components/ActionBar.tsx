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
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
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
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <button
            onClick={onGenerateToken}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generate Token
          </button>
        </div>
      </div>
    </div>
  );
}