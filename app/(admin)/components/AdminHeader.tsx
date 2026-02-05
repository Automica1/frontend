import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { Bell, Search, User, LogOut } from "lucide-react";

interface AdminHeaderProps {
  user: KindeUser<any>;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-admin-border sticky top-0 z-30">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative group max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-text-muted group-focus-within:text-admin-primary transition-colors" />
            <input
              type="text"
              placeholder="Search something..."
              className="bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-admin-primary/20 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 text-admin-text-muted hover:text-admin-primary hover:bg-slate-50 rounded-xl transition-all relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="h-8 w-px bg-admin-border mx-1"></div>

          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold leading-none">{user.given_name || 'Admin'}</p>
              <p className="text-[10px] text-admin-text-muted font-medium mt-1">{user.email}</p>
            </div>
            <div className="group relative">
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center border border-admin-border overflow-hidden ring-2 ring-transparent group-hover:ring-admin-primary/20 transition-all cursor-pointer">
                {user.picture ? (
                  <img src={user.picture} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-admin-text-muted" />
                )}
              </div>

              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-admin-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 py-1 overflow-hidden">
                <LogoutLink className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <User className="h-4 w-4" />
                  My Profile
                </LogoutLink>
                <div className="h-px bg-admin-border my-1"></div>
                <LogoutLink className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
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