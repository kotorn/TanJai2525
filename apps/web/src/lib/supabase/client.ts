import { createClient as createSupabaseJsClient } from './adapter';
import { createMockClient } from './mock-client';
import { Database } from '../database.types';

export const createClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Fallback to Mock if Env Vars are missing (e.g. Local QA, or Vercel preview without keys)
    if (!supabaseUrl || !supabaseKey) { 
        if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_IS_MOCK_ALLOWED) {
             console.warn('⚠️ Supabase credentials missing. Falling back to Mock Client.');
        }
        return createMockClient();
    }

    return createSupabaseJsClient<Database>(
        supabaseUrl,
        supabaseKey
    );
};
