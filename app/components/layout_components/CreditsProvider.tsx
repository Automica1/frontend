// src/components/CreditsProvider.tsx
'use client';
import React, { useEffect } from 'react';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useCredits } from '../../hooks/useCredits';

interface CreditsProviderProps {
  children: React.ReactNode;
}

const CreditsProvider: React.FC<CreditsProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useKindeBrowserClient();
  const { refreshCredits } = useCredits();

  useEffect(() => {
    // Initialize credits when user is authenticated
    if (isAuthenticated && !isLoading) {
      refreshCredits();
    }
  }, [isAuthenticated, isLoading, refreshCredits]);

  return <>{children}</>;
};

export default CreditsProvider;