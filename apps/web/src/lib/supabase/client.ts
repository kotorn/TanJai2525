import { createClient as createSupabaseJsClient } from './adapter';
import { createMockClient } from './mock-client';
import { Database } from '../database.types';

export const createClient = () => {
    // For QA without Docker: Force Mock
    return createMockClient();

    /* 
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return createMockClient();

    return createSupabaseJsClient<Database>(
        supabaseUrl,
        supabaseKey
    );
    */
};
