import { createClient as createSupabaseJsClient } from './adapter';

export const createClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn('ERP: Supabase keys missing, returning dummy client');
        return {
             from: () => ({ select: () => ({ data: [], error: null }) }),
             auth: { getUser: async () => ({ data: { user: null }, error: null }) }
        } as any;
    }

    return createSupabaseJsClient(
        supabaseUrl,
        supabaseKey,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            }
        }
    );
};
