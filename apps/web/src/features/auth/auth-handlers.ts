import { createClient } from '@/lib/supabase/client';

const getRedirectUrl = () => `${window.location.origin}/auth/callback`;

/**
 * Trigger Line Login
 */
export const signInWithLine = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'line' as any,
        options: {
            redirectTo: getRedirectUrl(),
            queryParams: { scope: 'profile openid email' }
        },
    });
    if (error) throw error;
    return data;
};

/**
 * Trigger Google Login
 */
export const signInWithGoogle = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: getRedirectUrl(),
            queryParams: {
                access_type: 'offline', // Request refresh token
                prompt: 'consent',
            },
        },
    });
    if (error) throw error;
    return data;
};

/**
 * Trigger Apple Login
 */
export const signInWithApple = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
            redirectTo: getRedirectUrl(),
        },
    });
    if (error) throw error;
    return data;
};

/**
 * Trigger Email Login
 */
export const signInWithEmail = async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

/**
 * Trigger Email Sign Up
 */
export const signUpWithEmail = async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
    });
    if (error) throw error;
    return data;
};


