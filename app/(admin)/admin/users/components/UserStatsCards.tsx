// app/admin/users/components/UserStatsCards.tsx
"use client";

import React from 'react';
import { UserStatsResponse } from '../../../lib/apiService';

interface UserStatsCardsProps {
  stats: UserStatsResponse['stats'];
}

export default function UserStatsCards({ stats }: UserStatsCardsProps) {
  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: '👥',
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: '✅',
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Total Credits',
      value: stats.totalCredits.toLocaleString(),
      icon: '💰',
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'New This Month',
      value: stats.newUsersThisMonth.toLocaleString(),
      icon: '📈',
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Admin Users',
      value: stats.adminUsers.toLocaleString(),
      icon: '👑',
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      title: 'Avg Credits/User',
      value: Math.round(stats.averageCreditsPerUser).toLocaleString(),
      icon: '📊',
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
      {cards.map((card, index) => (
        <div key={index} className={`${card.bgColor} p-6 rounded-lg border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
            <div className={`text-2xl ${card.iconColor}`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}