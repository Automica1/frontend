'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
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
  KeyRound,
  MessageSquareText,
  Cpu,
  LucideIcon,
  X,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navigationItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Credits', href: '/admin/credits', icon: Coins },
  { name: 'AI Services', href: '/admin/ai-services', icon: Cpu },
  { name: 'AI Services Preview', href: '/admin/ai-services-preview', icon: Database },
  { name: 'Usage Analytics', href: '/admin/services', icon: Database },
  { name: 'Beta Access', href: '/admin/beta-services', icon: Database },
  { name: 'GPU Runtime', href: '/admin/gpu-pools', icon: Cpu },
  { name: 'Beta Keys', href: '/admin/beta-keys', icon: FlaskConical },
  { name: 'Guest Passes', href: '/admin/guest-passes', icon: KeyRound },
  { name: 'Beta Feedback', href: '/admin/beta-feedback', icon: MessageSquareText },
  { name: 'Plans', href: '/admin/plans', icon: Package },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: ReceiptText },
  { name: 'Logs', href: '/admin/logs', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: UserCircle2 },
];

export default function AdminSidebar() {
  const pathname = usePathname() ?? '/';
  const compact = pathname.startsWith('/admin/ai-saas') || pathname.startsWith('/admin/ai-services-preview') || pathname.startsWith('/admin/ai-services');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const open = () => setMobileOpen(true);
    const close = () => setMobileOpen(false);
    window.addEventListener('automica-admin-nav-open', open as EventListener);
    window.addEventListener('automica-admin-nav-close', close as EventListener);
    return () => {
      window.removeEventListener('automica-admin-nav-open', open as EventListener);
      window.removeEventListener('automica-admin-nav-close', close as EventListener);
    };
  }, []);

  const handleClose = () => {
    setMobileOpen(false);
    window.dispatchEvent(new Event('automica-admin-nav-close'));
  };

  const renderNav = (closeOnClick?: boolean) => (
    <>
      <div className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-3">
            <div className={`${compact ? 'h-8 w-8 rounded-lg' : 'h-9 w-9 rounded-xl'} flex items-center justify-center border border-white/10 bg-gradient-to-br from-purple-500/80 to-pink-500/80 shadow-lg shadow-purple-500/20`}>
              <Settings className={compact ? 'h-4 w-4 text-white' : 'h-5 w-5 text-white'} />
            </div>
            <div className="min-w-0">
              <h2 className={`${compact ? 'text-base' : 'text-lg'} truncate font-semibold tracking-tight text-white`}>Automica</h2>
              <p className="truncate text-xs font-medium text-gray-400">Admin Workspace</p>
            </div>
          </div>
          {closeOnClick && (
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
              aria-label="Close admin navigation"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <nav className={`min-h-0 flex-1 space-y-1 overflow-y-auto ${compact ? 'px-2 pt-1' : 'px-3 pt-2'}`}>
        <p className={`${compact ? 'px-3' : 'px-4'} mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500`}>Main Menu</p>
        {navigationItems.map((item) => {
          const isActive =
            item.href === '/admin/ai-services'
              ? pathname === '/admin/ai-services' || pathname.startsWith('/admin/ai-services/')
              : pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center justify-between border text-sm font-medium transition-all duration-200
                ${compact ? 'rounded-lg px-3 py-2' : 'rounded-xl px-4 py-2.5'}
                ${isActive
                  ? 'border-white/10 bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-white shadow-lg shadow-purple-500/10'
                  : 'border-transparent text-gray-300 hover:bg-white/5 hover:border-white/10 hover:text-white'}
              `}
              onClick={closeOnClick ? handleClose : undefined}
            >
              <div className="flex min-w-0 items-center">
                <item.icon className={`${compact ? 'mr-2 h-4 w-4' : 'mr-3 h-5 w-5'} shrink-0 transition-colors ${isActive ? 'text-purple-300' : 'text-gray-400 group-hover:text-purple-300'}`} />
                <span className="truncate">{item.name}</span>
              </div>
              {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      <div className={`mt-auto border-t border-white/10 ${compact ? 'p-2' : 'p-3'}`}>
        <Link
          href="/"
          className={`flex items-center border border-transparent text-sm font-medium text-gray-300 transition-all duration-200 hover:border-white/10 hover:bg-white/5 hover:text-white ${compact ? 'rounded-lg px-3 py-2' : 'rounded-xl px-4 py-2.5'}`}
          onClick={closeOnClick ? handleClose : undefined}
        >
          <ArrowLeft className={`${compact ? 'mr-2 h-4 w-4' : 'mr-3 h-5 w-5'}`} />
          Back to Site
        </Link>
      </div>
    </>
  );

  return (
    <>
      <aside className={`hidden min-h-0 flex-col border-r border-white/10 bg-black/30 backdrop-blur-2xl transition-all duration-300 lg:flex ${compact ? 'w-60' : 'w-72'}`}>
        {renderNav(false)}
      </aside>

      <div className={`fixed inset-0 z-40 lg:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={handleClose}
          className={`absolute inset-0 bg-black/55 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside className={`relative flex h-full w-[86vw] max-w-[320px] flex-col border-r border-white/10 bg-black/95 backdrop-blur-2xl transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {renderNav(true)}
        </aside>
      </div>
    </>
  );
}
