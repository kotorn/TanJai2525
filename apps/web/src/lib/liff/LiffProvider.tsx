'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import liff from '@line/liff';

// Type definition for the Context
interface LiffContextValue {
    liff: typeof liff | null;
    isLoggedIn: boolean;
    isReady: boolean;
    profile: {
        userId: string;
        displayName: string;
        pictureUrl?: string;
    } | null;
    error: string | null;
    login: () => void;
    logout: () => void;
}

const LiffContext = createContext<LiffContextValue>({
    liff: null,
    isLoggedIn: false,
    isReady: false,
    profile: null,
    error: null,
    login: () => {},
    logout: () => {},
});

export const useLiff = () => useContext(LiffContext);

export const LiffProvider = ({ children }: { children: ReactNode }) => {
    const [isReady, setIsReady] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [profile, setProfile] = useState<LiffContextValue['profile']>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize LIFF
        const initLiff = async () => {
            try {
                const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
                if (!liffId) {
                    console.warn('LIFF ID is missing. LIFF features will be disabled.');
                    setIsReady(true);
                    return;
                }

                await liff.init({ liffId });
                
                // Check Auth State
                if (liff.isLoggedIn()) {
                    setIsLoggedIn(true);
                    const userProfile = await liff.getProfile();
                    setProfile({
                        userId: userProfile.userId,
                        displayName: userProfile.displayName,
                        pictureUrl: userProfile.pictureUrl,
                    });
                } else {
                    // Optional: Auto-login if accessed externally
                    // liff.login(); 
                }
                
                setIsReady(true);
            } catch (err: any) {
                console.error('LIFF Init Error:', err);
                setError(err.message || 'Failed to init LIFF');
                setIsReady(true); // Still ready, just errored
            }
        };

        if (typeof window !== 'undefined') {
            initLiff();
        }
    }, []);

    const login = () => {
        if (!liff.isLoggedIn()) {
            liff.login();
        }
    };

    const logout = () => {
        if (liff.isLoggedIn()) {
            liff.logout();
            setIsLoggedIn(false);
            setProfile(null);
            window.location.reload();
        }
    };

    return (
        <LiffContext.Provider value={{ liff: isReady ? liff : null, isLoggedIn, isReady, profile, error, login, logout }}>
            {children}
        </LiffContext.Provider>
    );
};
