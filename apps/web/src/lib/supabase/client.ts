// @ts-ignore
const { createClient: createSupabaseJsClient } = require('@supabase/supabase-js');
import { createMockClient } from './mock-client';
import { Database } from '../database.types';


// Singleton cache to prevent multiple GoTrueClient instances
let supabaseClientInstance: any = null;

export const createClient = () => {
    // Return cached instance if it exists
    if (supabaseClientInstance) {
        return supabaseClientInstance;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Fallback to Mock if Env Vars are missing (e.g. Local QA, or Vercel preview without keys)
    if (!supabaseUrl || !supabaseKey) {
        if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_IS_MOCK_ALLOWED) {
            console.warn('⚠️ Supabase credentials missing. Falling back to Mock Client.');
        }
        const mockClient = createMockClient();
        supabaseClientInstance = mockClient;
        return mockClient;
    }

    // Create and cache the singleton instance
    supabaseClientInstance = createSupabaseJsClient<Database>(
        supabaseUrl,
        supabaseKey
    );

    return supabaseClientInstance;
};
