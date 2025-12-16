import { createClient } from '@supabase/supabase-js';

export const signInWithLine = async () => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Trigger OAuth Flow
    // We use the 'line' provider. 
    // Redirect URL must be whitelisted in Supabase Dashboard.
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'line',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
                // Line specific scopes if needed (default is usually profile, openid, email)
                scope: 'profile openid email',
            }
        },
    });

    if (error) {
        console.error('Line Login Error:', error);
        throw error;
    }

    return data;
};
