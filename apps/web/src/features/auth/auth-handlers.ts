import { createClient } from '@supabase/supabase-js';
const createClientComponentClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const getRedirectUrl = () => `${window.location.origin}/auth/callback`;

/**
 * Trigger Line Login
 */
export const signInWithLine = async () => {
    const supabase = createClientComponentClient();
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
    const supabase = createClientComponentClient();
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
    const supabase = createClientComponentClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
            redirectTo: getRedirectUrl(),
        },
    });
    if (error) throw error;
    return data;
};
