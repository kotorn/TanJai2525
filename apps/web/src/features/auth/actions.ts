'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function provisionTenant(
    shopName: string, 
    userId: string, 
    email: string,
    metadata?: { cuisine?: string; location?: string }
) {
    // // // console.log('[Action] Provisioning Tenant:', { shopName, userId });
    
    try {
        const supabaseAdmin = createAdminClient();
        
        // 1. Generate Slug
        const slug = shopName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 10000);

        // 2. Insert Tenant (Using Admin to ensure no RLS hiccups, although Authenticated is allowed)
        const { data: tenant, error: tenantError } = await supabaseAdmin
            .from('tenants')
            .insert({
                name: shopName,
                slug: slug,
            })
            .select()
            .single();

        if (tenantError) throw new Error('Failed to create tenant: ' + tenantError.message);

        // 3. Link User to Tenant (Update public.users)
        // We use Admin here to UPSERT to ensure the profile exists with the correct Tenant ID & Role
        const { error: userError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: userId,
                email: email,
                tenant_id: tenant.id,
                role: 'owner',
                full_name: shopName + ' Owner', // Default name
                // cuisine/location could go into a 'metadata' jsonb column if users table has it, 
                // but schema didn't show it. We'll skip for now or add if schema permits.
            })
            .select();

        if (userError) throw new Error('Failed to link user: ' + userError.message);

        // 4. Seed Default Menu (Optional, using Admin)
        const { error: menuError } = await supabaseAdmin
            .from('menu_items')
            .insert([
                { tenant_id: tenant.id, name: 'Hot Coffee', price: 60, category: 'Coffee', is_available: true },
                { tenant_id: tenant.id, name: 'Iced Tea', price: 50, category: 'Tea', is_available: true },
            ]);

        // 5. Revalidate
        revalidatePath('/');
        
        return { success: true, slug: tenant.slug };
    } catch (error: any) {
        console.error('Provisioning Error:', error);
        return { success: false, error: error.message };
    }
}
