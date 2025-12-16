// Stubbed to unblock build
const createClientComponentClient = () => ({
    auth: { 
        signInWithOAuth: async () => ({ data: null, error: null }),
        getSession: async () => ({ data: { session: null }, error: null })
    }
} as any);

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
