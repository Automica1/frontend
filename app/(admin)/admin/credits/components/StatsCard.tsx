import React from 'react';
import Link from 'next/link';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
}

export default function StatsCard({ title, value, icon, href }: StatsCardProps) {
  const content = (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl transition-all hover:border-purple-400/30 hover:bg-white/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-light tracking-tight text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
          {icon}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return (
    content
  );
}
