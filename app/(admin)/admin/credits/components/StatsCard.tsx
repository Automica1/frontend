import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

export default function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500', 
    orange: 'text-orange-500',
    purple: 'text-purple-500',
    red: 'text-red-500'
  };

  const valueColorClasses = {
    blue: 'text-gray-900',
    green: 'text-green-600',
    orange: 'text-orange-600', 
    purple: 'text-purple-600',
    red: 'text-red-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${valueColorClasses[color]}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={colorClasses[color]}>
          {icon}
        </div>
      </div>
    </div>
  );
}