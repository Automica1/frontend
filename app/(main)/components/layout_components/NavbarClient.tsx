'use client';
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import of Navbar with no SSR to prevent hydration mismatches
const Navbar = dynamic(() => import('./Navbar'), {
  ssr: false,
  loading: () => (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Loading skeleton that matches your navbar structure */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl border-b border-white/10"></div>
      <div className="relative flex items-center justify-between px-4 sm:px-6 py-5 max-w-7xl mx-auto">
        {/* Logo skeleton */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-700 rounded-md animate-pulse"></div>
          <div className="w-24 h-6 bg-gray-700 rounded animate-pulse"></div>
        </div>
        
        {/* Desktop nav skeleton */}
        <div className="hidden md:flex items-center space-x-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
        
        {/* Auth section skeleton */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
          <div className="w-24 h-8 bg-gray-700 rounded animate-pulse"></div>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    </nav>
  ),
});

interface NavbarClientProps {
  isAdmin?: boolean;
}

export default function NavbarClient({ isAdmin }: NavbarClientProps) {
  return <Navbar isAdmin={isAdmin} />;
}