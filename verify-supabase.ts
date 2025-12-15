
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log(`Checking Config:`);
console.log(`URL: ${url ? '✅ Found' : '❌ Missing'}`);
console.log(`KEY: ${key ? '✅ Found' : '❌ Missing'}`);

if (!url || !key) {
    console.error("Missing credentials, aborting test.");
    process.exit(1);
}

const supabase = createClient(url, key);

async function testConnection() {
    try {
        console.log("Testing connection...");
        // Fetch count of tables or just health check
        const { data, error } = await supabase.from('tables').select('count', { count: 'exact', head: true });
        
        if (error) {
            console.error("❌ Connection Failed:", error.message);
            // If table doesn't exist yet (migration pending?), this might fail.
            // Try rpc or just auth check
            console.log("Attempting auth check...");
            const { error: authError } = await supabase.auth.getSession();
            if (authError) {
                 console.error("❌ Auth Check Failed:", authError.message);
                 process.exit(1);
            }
            console.log("✅ Auth Service Reachable");
        } else {
             console.log("✅ Database Reachable (Query success)");
        }
    } catch (err) {
        console.error("❌ Unexpected Error:", err);
        process.exit(1);
    }
}

testConnection();
