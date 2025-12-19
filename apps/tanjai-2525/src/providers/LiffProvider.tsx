'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { LiffState, LiffProfile, LiffContext } from '@/types/liff';

// LIFF Context
const LiffContext = createContext<LiffState | undefined>(undefined);

interface LiffProviderProps {
  children: ReactNode;
}

/**
 * LIFF Provider Component
 * 
 * Initializes LINE Front-end Framework (LIFF) in client-side
 * Provides LIFF state (profile, login status, etc.) to entire app
 * 
 * Usage:
 * 1. Wrap your app with <LiffProvider>
 * 2. Access LIFF state via useLiff() hook
 * 
 * @see https://developers.line.biz/en/reference/liff/
 */
export function LiffProvider({ children }: LiffProviderProps) {
  const [state, setState] = useState<LiffState>({
    isInClient: false,
    isLoggedIn: false,
    profile: null,
    context: null,
    error: null,
    isInitializing: true,
  });

  useEffect(() => {
    // Dynamically import LIFF SDK (client-side only)
    import('@line/liff')
      .then((liff) => {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

        if (!liffId) {
          setState((prev) => ({
            ...prev,
            error: 'LIFF ID not configured. Set NEXT_PUBLIC_LIFF_ID in .env.local',
            isInitializing: false,
          }));
          return;
        }

        // Initialize LIFF
        liff.default
          .init({ liffId })
          .then(() => {
            const isInClient = liff.default.isInClient();
            const isLoggedIn = liff.default.isLoggedIn();

            // Fetch user profile if logged in
            if (isLoggedIn) {
              liff.default.getProfile().then((profile) => {
                setState({
                  isInClient,
                  isLoggedIn: true,
                  profile: profile as LiffProfile,
                  context: liff.default.getContext() as LiffContext | null,
                  error: null,
                  isInitializing: false,
                });
              });
            } else {
              setState({
                isInClient,
                isLoggedIn: false,
                profile: null,
                context: liff.default.getContext() as LiffContext | null,
                error: null,
                isInitializing: false,
              });
            }
          })
          .catch((error: Error) => {
            setState((prev) => ({
              ...prev,
              error: error.message,
              isInitializing: false,
            }));
          });
      })
      .catch((error: Error) => {
        setState((prev) => ({
          ...prev,
          error: `Failed to load LIFF SDK: ${error.message}`,
          isInitializing: false,
        }));
      });
  }, []);

  return <LiffContext.Provider value={state}>{children}</LiffContext.Provider>;
}

/**
 * Hook to access LIFF state
 * 
 * @example
 * const { isLoggedIn, profile, login } = useLiff();
 * 
 * if (isLoggedIn) {
 *   console.log('Welcome', profile?.displayName);
 * }
 */
export function useLiff() {
  const context = useContext(LiffContext);
  
  if (context === undefined) {
    throw new Error('useLiff must be used within LiffProvider');
  }

  // Helper function to trigger LINE Login
  const login = async () => {
    const liff = (await import('@line/liff')).default;
    if (!liff.isLoggedIn()) {
      liff.login();
    }
  };

  // Helper function to logout
  const logout = async () => {
    const liff = (await import('@line/liff')).default;
    if (liff.isLoggedIn()) {
      liff.logout();
      window.location.reload();
    }
  };

  return {
    ...context,
    login,
    logout,
  };
}
