import { createClient } from "@supabase/supabase-js";

// Note: When using @supabase/ssr (HTTP), connection pooling is managed by the API.
// However, if we need a direct PostgreSQL client (e.g. for Drizzle/Prisma in the future),
// we should use the Transaction Mode pooler port (6543).

// For now, this is a placeholder or an extended client helper.
export const supabasePoolerConfig = {
    // Port 6543 is for Transaction Mode (Supavisor)
    port: 6543,
};
