'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Coins,
  Settings,
  ArrowLeft,
  ChevronRight,
  Database,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Credits',
    href: '/admin/credits',
    icon: Coins,
  },
  {
    name: 'Services',
    href: '/admin/services',
    icon: Database,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-72 flex-col bg-white border-r border-admin-border transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-admin-primary rounded-xl flex items-center justify-center shadow-lg shadow-admin-primary/20">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Automica</h2>
            <p className="text-xs text-admin-text-muted font-medium">Admin Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-4">
        <p className="px-4 text-[10px] font-bold text-admin-text-muted uppercase tracking-wider mb-2">Main Menu</p>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-admin-primary text-white shadow-md shadow-admin-primary/25'
                  : 'text-admin-text-muted hover:bg-slate-50 hover:text-admin-text-main'}
              `}
            >
              <div className="flex items-center">
                <item.icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-admin-text-muted group-hover:text-admin-primary'}`} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-admin-border">
        <Link
          href="/"
          className="flex items-center px-4 py-3 text-sm font-medium text-admin-text-muted rounded-xl hover:bg-slate-50 hover:text-admin-text-main transition-all duration-200"
        >
          <ArrowLeft className="mr-3 h-5 w-5" />
          Back to Site
        </Link>
      </div>
    </aside>
  );
}
