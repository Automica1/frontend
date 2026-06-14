// app/admin/users/components/UserStatsCards.tsx
"use client";

import React from 'react';
import Link from 'next/link';
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

  const colors: Record<string, string> = {
    blue: "bg-blue-500/20 text-blue-200 border-blue-400/20",
    emerald: "bg-emerald-500/20 text-emerald-200 border-emerald-400/20",
    indigo: "bg-indigo-500/20 text-indigo-200 border-indigo-400/20",
    amber: "bg-amber-500/20 text-amber-200 border-amber-400/20",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -4 }}
          className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-purple-400/30 hover:bg-white/8"
        >
          <Link href={card.title === 'Economy Supply' ? '/admin/credits' : '/admin/users'} className="block focus:outline-none">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colors[card.color]}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{card.title}</p>
                <h3 className="mt-0.5 text-2xl font-extrabold tracking-tight text-white">{card.value}</h3>
              </div>
            </div>
          </Link>
          <p className="mt-4 flex items-center gap-1 text-[10px] font-bold text-gray-500">
            {card.subtext}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
