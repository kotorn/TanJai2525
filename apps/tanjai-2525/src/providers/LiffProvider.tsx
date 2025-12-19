'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { LiffState, LiffProfile, LiffContext } from '@/types/liff';
import { createClient } from '@/lib/supabase';

// Extended State for Supabase
interface LiffStateWithSupabase extends LiffState {
  supabaseUser: any | null;
  supabaseSession: any | null;
}

// LIFF Context
const LiffContext = createContext<(LiffStateWithSupabase & { login: () => Promise<void>; logout: () => Promise<void> }) | undefined>(undefined);

interface LiffProviderProps {
  children: ReactNode;
}

export function LiffProvider({ children }: LiffProviderProps) {
  const [state, setState] = useState<LiffStateWithSupabase>({
    isInClient: false,
    isLoggedIn: false,
    profile: null,
    context: null,
    error: null,
    isInitializing: true,
    supabaseUser: null,
    supabaseSession: null,
  });

  const supabase = createClient();

  useEffect(() => {
    // 1. Listen for Supabase Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({
        ...prev,
        supabaseSession: session,
        supabaseUser: session?.user ?? null,
      }));
    });

    // 2. Initialize LIFF
    import('@line/liff')
      .then((liff) => {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

        if (!liffId) {
          setState((prev) => ({
            ...prev,
            error: 'LIFF ID not configured',
            isInitializing: false,
          }));
          return;
        }

        liff.default
          .init({ liffId })
          .then(async () => {
            const isInClient = liff.default.isInClient();
            const isLoggedIn = liff.default.isLoggedIn();

            if (isLoggedIn) {
              const profile = await liff.default.getProfile();
              
              // 3. Sync with Supabase if needed
              // If we have a LIFF session but no Supabase session, 
              // we can trigger the OAuth flow or rely on the user clicking login.
              // For a smooth experience, we just check the current Supabase session.
              const { data: { session } } = await supabase.auth.getSession();

              setState({
                isInClient,
                isLoggedIn: true,
                profile: profile as LiffProfile,
                context: liff.default.getContext() as LiffContext | null,
                error: null,
                isInitializing: false,
                supabaseSession: session,
                supabaseUser: session?.user ?? null,
              });
            } else {
              setState({
                isInClient,
                isLoggedIn: false,
                profile: null,
                context: liff.default.getContext() as LiffContext | null,
                error: null,
                isInitializing: false,
                supabaseSession: null,
                supabaseUser: null,
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper functions
  const login = async () => {
    const liff = (await import('@line/liff')).default;
    if (!liff.isLoggedIn()) {
      liff.login();
    } else {
      // If already LIFF logged in, trigger Supabase Bridge
      await supabase.auth.signInWithOAuth({
        provider: 'line' as any,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
    }
  };

  const logout = async () => {
    const liff = (await import('@line/liff')).default;
    await supabase.auth.signOut();
    if (liff.isLoggedIn()) {
      liff.logout();
    }
    window.location.reload();
  };

  return (
    <LiffContext.Provider value={{ ...state, login, logout }}>
      {children}
    </LiffContext.Provider>
  );
}

export function useLiff() {
  const context = useContext(LiffContext);
  if (context === undefined) {
    throw new Error('useLiff must be used within LiffProvider');
  }
  return context;
}

