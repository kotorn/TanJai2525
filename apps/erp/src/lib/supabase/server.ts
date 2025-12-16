```typescript
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js/dist/main/index.js';

// ERP likely needs its own types or shared types. For now, use 'any' or shared if available.
// Checking imports... usually it imports Database from shared or local.
// Let's assume generic for safely or 'any' to avoid type errors if I don't know the path.
// Actually, erp might verify types.
// I'll use <any> for now to be safe, or just check the file content first?
// No, previously I replaced it.
// Let's use generic createSupabaseJsClient(url, key) without explicit generic for now.

export const createClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return createSupabaseJsClient(
        supabaseUrl || '',
        supabaseKey || '',
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            }
        }
    );
};
```
