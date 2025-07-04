'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Wallet, Brain, ChevronDown, User, LogOut, Coins, Menu, X } from 'lucide-react';
import { RegisterLink, LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useCredits } from '../../hooks/useCredits';
import Link from 'next/link';

export default function Navbar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Get user authentication state
  const { user, isAuthenticated, isLoading } = useKindeBrowserClient();
  
  // Use the credits hook
  const { credits, loading: creditsLoading, error: creditsError, refreshCredits } = useCredits();

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
            <span className="flex items-center space-x-2">
              <Image
                src="/logo.svg"
                alt="Automica.ai Logo"
                width={32}
                height={32}
                priority
              />
              <span className="text-xl font-semibold text-white  hover:text-purple-400 transition-all duration-300 hover:scale-105">Automica.ai</span>
            </span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8 animate-[slideInDown_0.8s_ease-out_0.2s_both]">
          <Link href="/services" className="text-gray-300 hover:text-purple-400 transition-all duration-300 hover:scale-105">Services</Link>
          <Link href="/contact" className="text-gray-300 hover:text-purple-400 transition-all duration-300 hover:scale-105">Contact Us</Link>
              
              <Link href="/about" className="text-gray-300 hover:text-purple-400 transition-all duration-300 hover:scale-105">About Us</Link>

          <Link href="/pricing" className="text-gray-300 hover:text-purple-400 transition-all duration-300 hover:scale-105">Pricing</Link>
        </div>
        
        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4 animate-[slideInRight_0.8s_ease-out_0.4s_both]">
          {/* Only show credits if user is authenticated */}
          {!isLoading && isAuthenticated && (
            <button className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-all duration-300 hover:scale-105">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span>{creditsLoading ? '...' : credits !== null ? credits.toLocaleString() : ''}</span>
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
                    src={user.picture}
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
                          src={user.picture}
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
                      <div>
                        <div className="text-white font-medium">
                          {user.given_name && user.family_name 
                            ? `${user.given_name} ${user.family_name}` 
                            : user.given_name || 'User'}
                        </div>
                        <div className="text-gray-400 text-sm">{user.email}</div>
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
                            className="text-red-400 hover:text-red-300 text-xs"
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
                  
                  <div className="py-1">
                    <a href="/dashboard" className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-purple-500/20 transition-colors duration-200">
                      <Brain className="w-4 h-4 mr-3" />
                      Dashboard
                    </a>
                    <a href="/profile" className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-purple-500/20 transition-colors duration-200">
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </a>
                  </div>
                  
                  <div className="border-t border-white/10 pt-1">
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
            <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-500/20 to-purple-700/20 backdrop-blur-sm border border-purple-500/30 rounded-md">
              <Coins className="w-3 h-3 text-yellow-500" />
              <span className="text-white text-xs font-medium">
                {creditsLoading ? '...' : credits !== null ? credits.toLocaleString() : ''}
              </span>
            </div>
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
        <div className="mobile-menu md:hidden fixed inset-0 top-[72px] bg-black/80 backdrop-blur-2xl z-40 animate-[fadeIn_0.3s_ease-out]" style={{ backdropFilter: 'blur(48px) saturate(180%)' }}>
          <div className="flex flex-col h-full">
            {/* Navigation Links */}
            <div className="flex-1 px-6 py-8 space-y-6 bg-black/60 backdrop-blur-md mx-4 mt-4 rounded-2xl border border-white/10" style={{ backdropFilter: 'blur(16px)' }}>
              <Link 
                href="/services" 
                onClick={closeMobileMenu}
                className="block text-2xl font-medium text-white hover:text-purple-400 transition-colors duration-200 py-3 border-b border-gray-800/50"
              >
                Services
              </Link>
              
              <Link 
                href="/contact" 
                onClick={closeMobileMenu}
                className="block text-2xl font-medium text-white hover:text-purple-400 transition-colors duration-200 py-3 border-b border-gray-800/50"
              >
                Contact Us
              </Link>
              
              <Link 
                href="/about" 
                onClick={closeMobileMenu}
                className="block text-2xl font-medium text-white hover:text-purple-400 transition-colors duration-200 py-3 border-b border-gray-800/50"
              >
                About Us
              </Link>
              
              <Link 
                href="/pricing" 
                onClick={closeMobileMenu}
                className="block text-2xl font-medium text-white hover:text-purple-400 transition-colors duration-200 py-3 border-b border-gray-800/50"
              >
                Pricing
              </Link>

              {/* Mobile User Section (when authenticated) */}
              {!isLoading && isAuthenticated && user && (
                <div className="border-t border-white/20 pt-6 mt-8">
                  <div className="flex items-center space-x-3 mb-6 p-4 bg-black/70 backdrop-blur-sm rounded-xl border border-purple-500/40" style={{ backdropFilter: 'blur(12px)' }}>
                    {user.picture ? (
                      <Image
                        src={user.picture}
                        alt={user.given_name || user.email || "User"}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full border-2 border-purple-500/50"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <div className="text-white font-semibold text-lg">
                        {user.given_name && user.family_name 
                          ? `${user.given_name} ${user.family_name}` 
                          : user.given_name || 'User'}
                      </div>
                      <div className="text-gray-300 text-sm">{user.email}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <a 
                      href="/dashboard" 
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-3 text-white hover:text-purple-400 hover:bg-purple-500/20 backdrop-blur-sm transition-all duration-200 py-3 px-4 rounded-xl border border-white/10" style={{ backdropFilter: 'blur(8px)' }}
                    >
                      <Brain className="w-5 h-5" />
                      <span className="text-lg font-medium">Dashboard</span>
                    </a>
                    
                    <a 
                      href="/profile" 
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-3 text-white hover:text-purple-400 hover:bg-purple-500/20 backdrop-blur-sm transition-all duration-200 py-3 px-4 rounded-xl border border-white/10" style={{ backdropFilter: 'blur(8px)' }}
                    >
                      <User className="w-5 h-5" />
                      <span className="text-lg font-medium">Profile</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Auth Section */}
            <div className="px-6 py-6 bg-black/60 backdrop-blur-md border-t border-white/20 space-y-4 mx-4 mb-4 rounded-2xl" style={{ backdropFilter: 'blur(16px)' }}>
              {!isLoading && !isAuthenticated && (
                <>
                  <LoginLink 
                    postLoginRedirectURL="/" 
                    onClick={closeMobileMenu}
                    className="block w-full px-6 py-4 border-2 border-white/30 backdrop-blur-sm rounded-xl text-center text-white font-medium hover:text-purple-400 hover:border-purple-500 transition-all duration-300" style={{ backdropFilter: 'blur(8px)' }}
                  >
                    SIGN IN
                  </LoginLink>
                  <RegisterLink 
                    postLoginRedirectURL="/" 
                    onClick={closeMobileMenu}
                    className="block w-full px-6 py-4 bg-gradient-to-r from-purple-500/90 to-purple-700/90 backdrop-blur-sm text-white rounded-xl font-semibold text-center hover:from-purple-600 hover:to-purple-800 transition-all duration-300 shadow-lg border border-purple-400/50" style={{ backdropFilter: 'blur(8px)' }}
                  >
                    GET STARTED
                  </RegisterLink>
                </>
              )}
              
              {!isLoading && isAuthenticated && (
                <LogoutLink 
                  postLogoutRedirectURL="/"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center space-x-3 w-full px-6 py-4 text-white font-medium hover:text-red-400 hover:bg-red-500/20 backdrop-blur-sm transition-colors duration-200 rounded-xl border-2 border-red-500/50" style={{ backdropFilter: 'blur(8px)' }}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-lg">Sign Out</span>
                </LogoutLink>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};