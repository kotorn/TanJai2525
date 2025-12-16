'use server';

// Stubbed
// import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// const supabase = createClient(supabaseUrl, supabaseKey);

export async function addMenuItem(tenantSlug: string, name: string, price: number, category: string) {
    const { db } = await import('@/lib/mock-db');
    
    // In mock, we don't care about tenant ID resolution for menu items really, 
    // just store it. Or look up tenant if we want to be fancy.
    
    db.createMenuItem({
        tenant_id: tenantSlug, // Storing slug as ID for simplicity in mock
        name,
        price,
        category,
        is_available: true
    });

    revalidatePath(`/${tenantSlug}`);
    return { success: true };
}
