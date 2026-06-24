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
  Package,
  ReceiptText,
  FileText,
  UserCircle2,
  FlaskConical,
  LucideIcon,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
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
  {
    name: 'Beta Keys',
    href: '/admin/beta-keys',
    icon: FlaskConical,
  },
  {
    name: 'Plans',
    href: '/admin/plans',
    icon: Package,
  },
  {
    name: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: ReceiptText,
  },
  {
    name: 'Logs',
    href: '/admin/logs',
    icon: FileText,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: UserCircle2,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname() ?? '/';

  return (
    <aside className="hidden lg:flex w-72 flex-col border-r border-white/10 bg-black/30 backdrop-blur-2xl transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-gradient-to-br from-purple-500/80 to-pink-500/80 shadow-lg shadow-purple-500/20">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-white">Automica</h2>
            <p className="text-xs text-gray-400 font-medium">Admin Workspace</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-4">
        <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Main Menu</p>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 border
                ${isActive
                  ? 'border-white/10 bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-white shadow-lg shadow-purple-500/10'
                  : 'border-transparent text-gray-300 hover:bg-white/5 hover:border-white/10 hover:text-white'}
              `}
            >
              <div className="flex items-center">
                <item.icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-purple-300' : 'text-gray-400 group-hover:text-purple-300'}`} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/10">
        <Link
          href="/"
          className="flex items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-2xl hover:bg-white/5 hover:text-white transition-all duration-200 border border-transparent hover:border-white/10"
        >
          <ArrowLeft className="mr-3 h-5 w-5" />
          Back to Site
        </Link>
      </div>
    </aside>
  );
}
