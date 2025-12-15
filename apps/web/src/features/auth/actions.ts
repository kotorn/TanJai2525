'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Service Role is REQUIRED here because we need to INSERT into 'tenants' 
// and 'users' for an authenticated user who doesn't have a role yet (and thus might be blocked by RLS).
// Or we rely on the specific RLS "Authenticated users can create tenant" we added.
// However, creating the 'public.users' record might need elevation if we strictly limit self-creation.
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function provisionTenant(shopName: string, userId: string, email: string) {
    console.log('[Mock] Provisioning Tenant:', shopName);
    
    // Simulate delay
    await new Promise(r => setTimeout(r, 1000));

    // Mock Slug
    const slug = shopName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
    
    // Use Mock DB (Dynamic Import to avoid top-level side effects if tricky, but static is fine)
    const { db } = await import('@/lib/mock-db');
    const newTenant = db.createTenant(shopName, slug);
    console.log('Created Tenant:', newTenant);

    // SEED MENU for Testing
    db.createMenuItem({ tenantId: newTenant.id, name: 'Cappuccino', price: 65, category: 'Coffee' });
    db.createMenuItem({ tenantId: newTenant.id, name: 'Matcha Latte', price: 75, category: 'Tea' });
    db.createMenuItem({ tenantId: newTenant.id, name: 'Croissant', price: 80, category: 'Bakery' });
    db.createMenuItem({ tenantId: newTenant.id, name: 'Som Tum', price: 60, category: 'Food' });
    db.createMenuItem({ tenantId: newTenant.id, name: 'Limited Deal', price: 10, category: 'Promo', stock: 1 });
    db.createMenuItem({ tenantId: newTenant.id, name: 'Sold Out Item', price: 0, category: 'Promo', stock: 0 });

    return { success: true, slug: slug };
}
