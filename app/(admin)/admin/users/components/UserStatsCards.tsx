// app/admin/users/components/UserStatsCards.tsx
"use client";

import React from 'react';
import { UserStatsResponse } from '../../../lib/apiService';
import { Users, UserCheck, Database, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserStatsCardsProps {
  stats: UserStatsResponse['stats'];
}

export default function UserStatsCards({ stats }: UserStatsCardsProps) {
  const cards = [
    {
      title: 'Total Registry',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'blue',
      subtext: 'Growth +12% this month'
    },
    {
      title: 'Active Accounts',
      value: stats.activeUsers.toLocaleString(),
      icon: UserCheck,
      color: 'emerald',
      subtext: 'Verified by system'
    },
    {
      title: 'Economy Supply',
      value: stats.totalCredits.toLocaleString(),
      icon: Database,
      color: 'indigo',
      subtext: 'Total credits in circulation'
    },
    {
      title: 'Avg. Liquidity',
      value: Math.round(stats.averageCreditsPerUser || 0).toLocaleString(),
      icon: TrendingUp,
      color: 'amber',
      subtext: 'Credits per active user'
    }
  ];

  const colors: any = {
    blue: "bg-blue-500 shadow-blue-500/20",
    emerald: "bg-emerald-500 shadow-emerald-500/20",
    indigo: "bg-indigo-500 shadow-indigo-500/20",
    amber: "bg-amber-500 shadow-amber-500/20",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-2xl border border-admin-border shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${colors[card.color]}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest">{card.title}</p>
              <h3 className="text-2xl font-extrabold text-admin-text-main mt-0.5 tracking-tight">{card.value}</h3>
            </div>
          </div>
          <p className="mt-4 text-[10px] font-bold text-admin-text-muted flex items-center gap-1 opacity-70">
            {card.subtext}
          </p>
        </motion.div>
      ))}
    </div>
  );
}