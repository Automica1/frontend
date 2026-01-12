import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-admin-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-3xl border border-admin-border shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 sm:p-10 text-center">
            {/* Error Icon */}
            <div className="mx-auto w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100 shadow-inner">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-3xl font-extrabold text-admin-text-main tracking-tight mb-3">
              Restricted Access
            </h1>

            <p className="text-admin-text-muted font-medium mb-8 leading-relaxed">
              Your account lacks the necessary administrative privileges to view this section.
            </p>

            <div className="space-y-4">
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-admin-primary hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-admin-primary/20"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Site
              </Link>

              <Link
                href="/api/auth/logout"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-admin-text-muted bg-slate-50 border border-admin-border hover:bg-slate-100 hover:text-admin-text-main transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out / Switch Account
              </Link>
            </div>
          </div>
          <div className="px-8 py-4 bg-slate-50 border-t border-admin-border">
            <p className="text-[10px] text-admin-text-muted font-bold uppercase tracking-widest">
              Security Protocol Level 4
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
