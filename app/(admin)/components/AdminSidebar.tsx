'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: (
      <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      </svg>
    ),
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: (
      <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: (
      <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
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