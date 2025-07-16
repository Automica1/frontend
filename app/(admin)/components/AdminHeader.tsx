import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";

interface AdminHeaderProps {
  user: KindeUser<any>;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Welcome, {user.given_name || user.email}
            </span>
            <LogoutLink className="text-sm text-red-600 hover:text-red-800">
              Logout
            </LogoutLink>
          </div>
        </div>
      </div>
    </header>
  );
}