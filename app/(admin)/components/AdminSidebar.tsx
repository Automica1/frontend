'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Coins } from "lucide-react"; // Import Lucide icons

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: <Users className="mr-3 h-5 w-5" />,
  },
  {
    name: 'Credits',
    href: '/admin/credits',
    icon: <Coins className="mr-3 h-5 w-5" />,
  },
  {
    name: 'Services',
    href: '/admin/services',
    icon: <Coins className="mr-3 h-5 w-5" />,
  },
  // {
  //   name: 'Pages',
  //   href: '/admin/credits',
  //   icon: <Coins className="mr-3 h-5 w-5" />,
  // },
];

export default function AdminSidebarClient() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen">
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {navigationItems.map((item) => (
            <NavItem 
              key={item.name} 
              {...item} 
              isActive={pathname === item.href}
            />
          ))}
          
          <Link 
            href="/"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Site
          </Link>
        </div>
      </nav>
    </aside>
  );
}

interface NavItemProps {
  name: string;
  href: string;
  icon: React.ReactNode;
  isActive: boolean;
}

function NavItem({ name, href, icon, isActive }: NavItemProps) {
  return (
    <Link 
      href={href}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'text-blue-700 bg-blue-100 hover:bg-blue-200'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      {name}
    </Link>
  );
}