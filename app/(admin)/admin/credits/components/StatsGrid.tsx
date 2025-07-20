import React from 'react';
import { CreditCard, CheckCircle, Clock, Users, XCircle, Calendar } from 'lucide-react';
import StatsCard from './StatsCard';

interface TokenStats {
  total: number;
  used: number;
  unused: number;
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
}

interface StatsGridProps {
  stats: TokenStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
      <StatsCard
        title="Total Tokens"
        value={stats.total}
        icon={<CreditCard className="w-8 h-8" />}
        color="blue"
      />
      
      <StatsCard
        title="Used Tokens"
        value={stats.used}
        icon={<CheckCircle className="w-8 h-8" />}
        color="green"
      />
      
      <StatsCard
        title="Unused Tokens"
        value={stats.unused}
        icon={<Clock className="w-8 h-8" />}
        color="orange"
      />
      
      <StatsCard
        title="Total Credits"
        value={stats.totalCredits}
        icon={<Users className="w-8 h-8" />}
        color="purple"
      />
      
      <StatsCard
        title="Used Credits"
        value={stats.usedCredits}
        icon={<XCircle className="w-8 h-8" />}
        color="red"
      />
      
      <StatsCard
        title="Available Credits"
        value={stats.availableCredits}
        icon={<Calendar className="w-8 h-8" />}
        color="green"
      />
    </div>
  );
}