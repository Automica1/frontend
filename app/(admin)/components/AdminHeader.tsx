'use client';

import type { ComponentType } from 'react';
import { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { Bell, Search, User, LogOut, Sparkles, Loader2, Users, Coins, Package, Activity, ReceiptText, Menu } from "lucide-react";
import { apiService } from "../lib/apiService";

interface AdminHeaderProps {
  user: KindeUser<Record<string, unknown>>;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname() ?? '';
  const compact = pathname.startsWith('/admin/ai-saas') || pathname.startsWith('/admin/ai-services-preview') || pathname.startsWith('/admin/ai-services');
  const compactSubtitle = 'AI Services workbench';
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Awaited<ReturnType<typeof apiService.searchAdmin>> | null>(null);
  const [open, setOpen] = useState(false);

  const runSearch = async () => {
    const nextQuery = query.trim();
    if (!nextQuery) {
      setResults(null);
      setOpen(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.searchAdmin(nextQuery);
      setResults(response);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <header className="z-30 border-b border-white/10 bg-black/35 backdrop-blur-2xl">
        <div className="flex h-11 items-center justify-between gap-3 px-3 md:px-4">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('automica-admin-nav-open'))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 lg:hidden"
            title="Open admin navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">Automica Admin</p>
            <p className="truncate text-[10px] font-medium text-gray-500">{compactSubtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button className="relative rounded-lg border border-white/10 bg-white/5 p-1.5 text-gray-300 transition-all hover:border-sky-400/30 hover:bg-white/10 hover:text-white">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border border-black/40 bg-sky-400"></span>
            </button>
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-xs font-semibold leading-none text-white">{user.given_name || 'Admin'}</p>
              <p className="mt-0.5 max-w-[220px] truncate text-[10px] font-medium text-gray-500">{user.email}</p>
            </div>
            <div className="group relative">
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 ring-2 ring-transparent transition-all group-hover:ring-sky-400/25">
                {user.picture ? (
                  <img src={user.picture} alt="profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4 text-gray-300" />
                )}
              </div>
              <div className="invisible absolute right-0 top-full mt-2 w-52 origin-top-right scale-95 overflow-hidden rounded-xl border border-white/10 bg-black/90 py-1 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                <Link href="/admin/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-200 transition-colors hover:bg-white/5">
                  <User className="h-4 w-4" />
                  My Profile
                </Link>
                <div className="my-1 h-px bg-white/10"></div>
                <LogoutLink postLogoutRedirectURL="/" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </LogoutLink>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/35 backdrop-blur-2xl">
      <div className="px-4 h-16 flex items-center justify-between gap-4">
        <div className="relative hidden w-full max-w-xl md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 transition-colors" />
          <input
            type="text"
            placeholder="Search users, tokens, plans, usage..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => results && setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void runSearch();
              }
            }}
            className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-24 py-2 text-sm text-white placeholder:text-gray-500 outline-none transition-all focus:border-purple-400/40 focus:bg-white/8 focus:ring-2 focus:ring-purple-500/10"
          />
          <button
            onClick={() => void runSearch()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </button>

          {open && results && (
            <div className="absolute left-0 top-full z-40 mt-3 w-full rounded-[24px] border border-white/10 bg-black/95 p-4 shadow-2xl">
              <SearchResults results={results} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <button className="relative rounded-2xl border border-white/10 bg-white/5 p-2 text-gray-300 transition-all hover:border-purple-400/30 hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-black/40 bg-pink-500"></span>
          </button>

          <div className="h-8 w-px bg-white/10 mx-1"></div>

          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-purple-200 mb-1">
                <Sparkles className="h-3 w-3" />
                Admin
              </div>
              <p className="text-sm font-semibold leading-none text-white">{user.given_name || 'Admin'}</p>
              <p className="mt-1 text-[10px] font-medium text-gray-400">{user.email}</p>
            </div>
            <div className="group relative">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 overflow-hidden ring-2 ring-transparent group-hover:ring-purple-400/20 transition-all cursor-pointer">
                {user.picture ? (
                  <img src={user.picture} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-gray-300" />
                )}
              </div>

              <div className="absolute top-full right-0 mt-3 w-52 overflow-hidden rounded-2xl border border-white/10 bg-black/90 py-1 shadow-2xl opacity-0 invisible scale-95 origin-top-right transition-all duration-200 group-hover:visible group-hover:opacity-100 group-hover:scale-100">
                <Link href="/admin/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition-colors">
                  <User className="h-4 w-4" />
                  My Profile
                </Link>
                <div className="h-px bg-white/10 my-1"></div>
                <LogoutLink postLogoutRedirectURL="/" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </LogoutLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function SearchResults({ results }: { results: Awaited<ReturnType<typeof apiService.searchAdmin>> }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">Search results</p>
          <p className="mt-1 text-sm text-gray-300">{results.query}</p>
        </div>
        <p className="text-xs font-semibold text-gray-500">Live admin data</p>
      </div>

      <ResultGroup
        title="Users"
        count={results.users.length}
        icon={Users}
        href="/admin/users"
        items={results.users.slice(0, 4).map((user) => user.email || user.userId)}
      />
      <ResultGroup
        title="Tokens"
        count={results.tokens.length}
        icon={Coins}
        href="/admin/credits"
        items={results.tokens.slice(0, 4).map((token) => token.description || token.token)}
      />
      <ResultGroup
        title="Plans"
        count={results.plans.length}
        icon={Package}
        href="/admin/plans"
        items={results.plans.slice(0, 4).map((plan) => plan.name)}
      />
      <ResultGroup
        title="Usage"
        count={results.usage.length}
        icon={Activity}
        href="/admin/services"
        items={results.usage.slice(0, 4).map((usage) => usage.service_name)}
      />
      <ResultGroup
        title="Subscriptions"
        count={results.subscriptions.length}
        icon={ReceiptText}
        href="/admin/subscriptions"
        items={results.subscriptions.slice(0, 4).map((sub) => `${sub.email} • ${sub.planName || sub.planId}`)}
      />
    </div>
  );
}

function ResultGroup({
  title,
  count,
  icon: Icon,
  href,
  items,
}: {
  title: string;
  count: number;
  icon: ComponentType<{ className?: string }>;
  href: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-purple-300" />
          <p className="text-sm font-semibold text-white">{title}</p>
        </div>
        <Link href={href} className="text-xs font-semibold uppercase tracking-[0.22em] text-purple-200 hover:text-white">
          Open {count}
        </Link>
      </div>
      <div className="mt-3 space-y-2">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={`${title}-${index}`} className="truncate rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-sm text-gray-300">
              {item}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-sm text-gray-500">
            No matches
          </div>
        )}
      </div>
    </div>
  );
}
