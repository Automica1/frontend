'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Wallet, Brain, ChevronDown, User, LogOut, Coins, Menu, X, Settings } from 'lucide-react';
import { RegisterLink, LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useCredits } from '../../hooks/useCredits';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({isAdmin}: {isAdmin?: boolean}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Get current pathname for active link highlighting
  const pathname = usePathname();
  
  // Get user authentication state
  const { user, isAuthenticated, isLoading } = useKindeBrowserClient();
  
  // Use the new Zustand-based credits hook
  const { credits, loading: creditsLoading, error: creditsError, refreshCredits } = useCredits();

  // Navigation links configuration
  const navLinks = [
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/about', label: 'About Us' },
    { href: '/pricing', label: 'Pricing' }
  ];

  // Function to check if a link is active
  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Function to get link classes based on active state
  const getLinkClasses = (href: string, isMobile: boolean = false) => {
    const isActive = isActiveLink(href);
    
    if (isMobile) {
      return `block text-xl font-medium transition-all duration-300 py-2 border-b border-gray-800/50 ${
        isActive 
          ? 'text-purple-400 bg-purple-500/10 px-3 rounded-lg border-purple-500/30' 
          : 'text-white hover:text-purple-400'
      }`;
    }
    
    return `relative transition-all duration-300 hover:scale-105 ${
      isActive 
        ? 'text-purple-400 font-semibold' 
        : 'text-gray-300 hover:text-purple-400'
    }`;
  };

  // Helper function to determine if user picture should use default avatar
  const shouldUseDefaultAvatar = (userPicture: string | string[]) => {
    if (!userPicture) return true;
    
    // Check if the picture URL contains gravatar with 'd=blank' parameter
    if (userPicture.includes('gravatar.com') && userPicture.includes('d=blank')) {
      return true;
    }
    
    return false;
  };

  // Function to get the appropriate avatar URL
  const getAvatarUrl = (userPicture: string | string[]) => {
    if (shouldUseDefaultAvatar(userPicture)) {
      const fullName = `${user?.given_name || ''} ${user?.family_name || ''}`.trim();
      return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=4c1d95&fontSize=38`;
    }
    // If userPicture is an array, use the first element; otherwise, return as is
    return Array.isArray(userPicture) ? userPicture[0] : userPicture;
  };

  useEffect(() => {
    const handleScroll = () => {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / documentHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      if (showUserDropdown && !target.closest('.user-dropdown')) {
        setShowUserDropdown(false);
      }
      
      if (showMobileMenu && !target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserDropdown, showMobileMenu]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl border-b border-white/10"></div>
      
      {/* Scroll progress bar */}
      <div 
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      ></div>
      
      <div className="relative flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center animate-[slideInLeft_0.8s_ease-out] z-50">
          <Link href="/">
            <span className={`flex items-center space-x-2 ${
              isActiveLink('/') 
                ? 'text-purple-400 scale-105' 
                : 'text-white hover:text-purple-400'
            } transition-all duration-300 hover:scale-105`}>
              <Image
                src="/logo.svg"
                alt="Automica.ai Logo"
                className='rounded-md'
                width={32}
                height={32}
                priority
              />
              <span className="text-xl font-semibold transition-all duration-300">Automica.ai</span>
            </span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8 animate-[slideInDown_0.8s_ease-out_0.2s_both]">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={getLinkClasses(link.href)}
            >
              <span className="relative">
                {link.label}
                {/* Active indicator dot */}
                
              </span>
            </Link>
          ))}
        </div>
        
        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4 animate-[slideInRight_0.8s_ease-out_0.4s_both]">
          {/* Only show credits if user is authenticated */}
          {!isLoading && isAuthenticated && (
            <button 
              onClick={refreshCredits}
              className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-all duration-300 hover:scale-105 cursor-pointer"
              title="Click to refresh credits"
            >
              <Coins className="w-4 h-4 text-yellow-500" />
              <span>
                {creditsLoading ? (
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                ) : creditsError ? (
                  'Error'
                ) : (
                  credits !== null ? credits.toLocaleString() : '—'
                )}
              </span>
            </button>
          )}
          
          {/* Show loading state */}
          {isLoading && (
            <div className="px-4 py-2 text-gray-300">Loading...</div>
          )}
          
          {/* Show auth buttons when not authenticated */}
          {!isLoading && !isAuthenticated && (
            <>
              <LoginLink postLoginRedirectURL="/" className="px-4 py-2 border border-gray-600/50 backdrop-blur-sm rounded-lg text-gray-300 hover:text-white hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                SIGN IN
              </LoginLink>
              <RegisterLink postLoginRedirectURL="/" className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg font-medium hover:from-purple-600 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                GET STARTED
              </RegisterLink>
            </>
          )}
          
          {/* Show user info when authenticated */}
          {!isLoading && isAuthenticated && user && (
            <div className="relative user-dropdown">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-3 px-3 py-2 bg-gradient-to-r from-purple-500/20 to-purple-700/20 backdrop-blur-sm border border-purple-500/30 rounded-lg text-white hover:from-purple-500/30 hover:to-purple-700/30 transition-all duration-300 hover:scale-105"
              >
                {user.picture ? (
                  <Image
                    src={getAvatarUrl(user.picture)}
                    alt={user.given_name || user.email || "User"}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full border border-purple-500/50"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                )}
                <span className="text-sm font-medium">
                  {user.given_name || user.email?.split('@')[0] || 'User'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Desktop User Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl py-2 animate-[fadeIn_0.2s_ease-out]">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                      {user.picture ? (
                        <Image
                          src={getAvatarUrl(user.picture)}
                          alt={user.given_name || user.email || "User"}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full border border-purple-500/50"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">
                          {user.given_name && user.family_name 
                            ? `${user.given_name} ${user.family_name}` 
                            : user.given_name || 'User'}
                        </div>
                        <div className="text-gray-400 text-sm truncate">{user.email}</div>
                        {isAdmin && (
                          <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 mt-1">
                            Admin
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Credits Section */}
                  <div className="px-4 py-3 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-300 text-sm">Credits</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {creditsLoading ? (
                          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : creditsError ? (
                          <button 
                            onClick={refreshCredits}
                            className="text-red-400 hover:text-red-300 text-xs transition-colors"
                          >
                            Retry
                          </button>
                        ) : (
                          <span className="text-white font-semibold">
                            {credits !== null ? credits.toLocaleString() : '—'}
                          </span>
                        )}
                      </div>
                    </div>
                    {creditsError && (
                      <div className="text-red-400 text-xs mt-1">{creditsError}</div>
                    )}
                  </div>
                  
                  {/* Admin Dashboard Link */}
                  {isAdmin && (
                    <div className="py-1">
                      <Link 
                        href="/admin" 
                        className={`flex items-center px-4 py-2 transition-colors duration-200 ${
                          isActiveLink('/admin')
                            ? 'text-purple-400 bg-purple-500/20 font-semibold'
                            : 'text-gray-300 hover:text-white hover:bg-purple-500/20'
                        }`}
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Admin Dashboard
                        {isActiveLink('/admin') && (
                          <span className="ml-auto w-2 h-2 bg-purple-400 rounded-full"></span>
                        )}
                      </Link>
                    </div>
                  )}
                  
                  <div className={`${isAdmin ? 'border-t border-white/10 pt-1' : ''}`}>
                    <LogoutLink postLogoutRedirectURL="/" className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-red-500/20 transition-colors duration-200">
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </LogoutLink>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Mobile Credits Display (only when authenticated) */}
          {!isLoading && isAuthenticated && (
            <button 
              onClick={refreshCredits}
              className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-500/20 to-purple-700/20 backdrop-blur-sm border border-purple-500/30 rounded-md transition-all duration-300 hover:scale-105"
              title="Click to refresh credits"
            >
              <Coins className="w-3 h-3 text-yellow-500" />
              <span className="text-white text-xs font-medium">
                {creditsLoading ? (
                  <div className="w-3 h-3 border border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                ) : creditsError ? (
                  'Error'
                ) : (
                  credits !== null ? credits.toLocaleString() : '—'
                )}
              </span>
            </button>
          )}
          
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="mobile-menu-button p-2 text-white hover:text-purple-400 transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="mobile-menu md:hidden fixed inset-0 top-[72px] bg-black/80 backdrop-blur-2xl z-40 animate-[fadeIn_0.3s_ease-out] overflow-y-auto" style={{ backdropFilter: 'blur(48px) saturate(180%)' }}>
          <div className="min-h-full flex flex-col">
            {/* Navigation Links */}
            <div className="flex-1 px-4 py-4 space-y-3 bg-black/60 backdrop-blur-md mx-3 mt-3 rounded-2xl border border-white/10" style={{ backdropFilter: 'blur(16px)' }}>
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  onClick={closeMobileMenu}
                  className={getLinkClasses(link.href, true)}
                >
                  <span className="flex items-center justify-between">
                    {link.label}
                    {isActiveLink(link.href) && (
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                    )}
                  </span>
                </Link>
              ))}

              {/* Admin Dashboard Link for Mobile */}
              {!isLoading && isAuthenticated && isAdmin && (
                <Link 
                  href="/admin" 
                  onClick={closeMobileMenu}
                  className={`block text-xl font-medium transition-all duration-300 py-2 border-b border-gray-800/50 ${
                    isActiveLink('/admin')
                      ? 'text-purple-400 bg-purple-500/10 px-3 rounded-lg border-purple-500/30'
                      : 'text-purple-300 hover:text-purple-400'
                  }`}
                >
                  <span className="flex items-center justify-between">
                    Admin Dashboard
                    {isActiveLink('/admin') && (
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                    )}
                  </span>
                </Link>
              )}

              {/* Mobile User Section (when authenticated) */}
              {!isLoading && isAuthenticated && user && (
                <div className="border-t border-white/20 pt-4 mt-4">
                  <div className="flex items-center space-x-3 mb-3 p-3 bg-black/70 backdrop-blur-sm rounded-xl border border-purple-500/40" style={{ backdropFilter: 'blur(12px)' }}>
                    {user.picture ? (
                      <Image
                        src={getAvatarUrl(user.picture)}
                        alt={user.given_name || user.email || "User"}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full border-2 border-purple-500/50"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-base truncate">
                        {user.given_name && user.family_name 
                          ? `${user.given_name} ${user.family_name}` 
                          : user.given_name || 'User'}
                      </div>
                      <div className="text-gray-300 text-sm truncate">{user.email}</div>
                      {isAdmin && (
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 mt-1">
                          Admin
                        </div>
                      )}
                      {/* Mobile Credits in User Section */}
                      <div className="flex items-center space-x-2 mt-1">
                        <Coins className="w-3 h-3 text-yellow-500" />
                        <span className="text-white text-sm font-medium">
                          {creditsLoading ? (
                            <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : creditsError ? (
                            <button 
                              onClick={refreshCredits}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              Retry
                            </button>
                          ) : (
                            credits !== null ? credits.toLocaleString() : '—'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Auth Section - Always visible */}
            <div className="px-4 py-3 bg-black/60 backdrop-blur-md border-t border-white/20 space-y-3 mx-3 mb-3 rounded-2xl flex-shrink-0" style={{ backdropFilter: 'blur(16px)' }}>
              {!isLoading && !isAuthenticated && (
                <>
                  <LoginLink 
                    postLoginRedirectURL="/" 
                    onClick={closeMobileMenu}
                    className="block w-full px-4 py-3 border-2 border-white/30 backdrop-blur-sm rounded-xl text-center text-white font-medium hover:text-purple-400 hover:border-purple-500 transition-all duration-300" style={{ backdropFilter: 'blur(8px)' }}
                  >
                    SIGN IN
                  </LoginLink>
                  <RegisterLink 
                    postLoginRedirectURL="/" 
                    onClick={closeMobileMenu}
                    className="block w-full px-4 py-3 bg-gradient-to-r from-purple-500/90 to-purple-700/90 backdrop-blur-sm text-white rounded-xl font-semibold text-center hover:from-purple-600 hover:to-purple-800 transition-all duration-300 shadow-lg border border-purple-400/50" style={{ backdropFilter: 'blur(8px)' }}
                  >
                    GET STARTED
                  </RegisterLink>
                </>
              )}
              
              {!isLoading && isAuthenticated && (
                <LogoutLink 
                  postLogoutRedirectURL="/"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-white font-medium hover:text-red-400 hover:bg-red-500/20 backdrop-blur-sm transition-colors duration-200 rounded-xl border-2 border-red-500/50" style={{ backdropFilter: 'blur(8px)' }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-base">Sign Out</span>
                </LogoutLink>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};