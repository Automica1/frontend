import Link from "next/link";
import type { ComponentType } from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowLeft, Mail, Settings, Shield, Sparkles, UserCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminSettingsPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <div className="space-y-8 pb-12">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-purple-300">Account Settings</p>
        <h1 className="text-4xl font-light tracking-tight text-white">Profile Settings</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-300">
          Review the signed-in admin identity, jump back to the operational views, or sign out when you’re done.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <UserCircle2 className="h-6 w-6 text-purple-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Signed-in profile</h2>
              <p className="text-sm text-gray-400">Identity provided by Kinde</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoCard label="Name" value={`${user?.given_name || ''} ${user?.family_name || ''}`.trim() || 'Admin'} />
            <InfoCard label="Email" value={user?.email || 'Unavailable'} />
            <InfoCard label="User ID" value={user?.id || 'Unavailable'} mono />
            <InfoCard label="Status" value="Administrator" />
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl">
          <h2 className="text-lg font-semibold text-white">Shortcuts</h2>
          <div className="mt-4 space-y-3">
            <ShortcutLink href="/admin/users" icon={Shield} title="Open users" description="Review accounts and suspension state." />
            <ShortcutLink href="/admin/services" icon={Sparkles} title="Open services" description="Inspect usage and history." />
            <ShortcutLink href="/" icon={ArrowLeft} title="Back to site" description="Return to the public app." />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-6 py-4 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-3 text-gray-300">
          <Settings className="h-5 w-5 text-purple-300" />
          <span className="text-sm">Use the header menu to sign out when finished.</span>
        </div>
        <Link
          href="/api/auth/logout?post_logout_redirect_url=/"
          className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 transition-colors hover:bg-rose-500/20"
        >
          Sign Out
        </Link>
      </div>
    </div>
  );
}

function InfoCard({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">{label}</p>
      <p className={`mt-2 break-all text-sm text-white ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function ShortcutLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition-colors hover:border-purple-400/30 hover:bg-white/5">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-purple-300" />
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </Link>
  );
}
