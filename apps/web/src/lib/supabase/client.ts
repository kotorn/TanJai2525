import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../database.types';

let supabaseClientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

export const createClient = () => {
    // Return cached instance if it exists
    if (supabaseClientInstance) {
        return supabaseClientInstance;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('⚠️ Supabase credentials missing. Client cannot be initialized.');
        // Return a dummy client or throw? 
        // For now, let createBrowserClient handle empty strings or throw natural errors, 
        // ensuring we don't break strict null checks unnecessarily.
        // But preventing crash is better.
        // We verified env vars exist, so strict check is safe.
    }

    // Create and cache the singleton instance
    supabaseClientInstance = createBrowserClient<Database>(
        supabaseUrl!,
        supabaseKey!
    );

    return supabaseClientInstance;
};
