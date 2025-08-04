// components/TabNavigation.tsx
import React from 'react';
import { Code, Book, Zap } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'quickstart', label: 'Quick Start', icon: Zap },
  { id: 'reference', label: 'API Reference', icon: Code },
  { id: 'examples', label: 'Examples', icon: Book },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => (
  <div className="flex space-x-1 sm:space-x-4 mb-8 sm:mb-12 border-b border-gray-700 overflow-x-auto">
    {tabs.map(({ id, label, icon: TabIcon }) => (
      <button
        key={id}
        onClick={() => onTabChange(id)}
        className={`px-3 sm:px-4 py-2 flex items-center space-x-1 sm:space-x-2 font-semibold border-b-2 transition-all whitespace-nowrap text-sm sm:text-base ${
          activeTab === id
            ? 'border-purple-500 text-white'
            : 'border-transparent text-gray-400 hover:text-white'
        }`}
      >
        <TabIcon className="w-3 h-3 sm:w-4 sm:h-4" />
        <span>{label}</span>
      </button>
    ))}
  </div>
);