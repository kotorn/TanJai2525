'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Service Role is REQUIRED here because we need to INSERT into 'tenants' 
// and 'users' for an authenticated user who doesn't have a role yet (and thus might be blocked by RLS).
// Or we rely on the specific RLS "Authenticated users can create tenant" we added.
// However, creating the 'public.users' record might need elevation if we strictly limit self-creation.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function provisionTenant(shopName: string, userId: string, email: string) {
    try {
        // 1. Generate Slug
        const slug = shopName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);

        // 2. Create Tenant
        const { data: tenant, error: tenantError } = await supabaseAdmin
            .from('tenants')
            .insert({
                name: shopName,
                slug: slug
            })
            .select()
            .single();

        if (tenantError) throw tenantError;

        // 3. Create Public User Record linked to Tenant
        const { error: userError } = await supabaseAdmin
            .from('users')
            .insert({
                id: userId,
                tenant_id: tenant.id,
                email: email,
                role: 'owner',
                full_name: shopName + ' Owner' // Placeholder
            });

        if (userError) throw userError;

        return { success: true, slug: tenant.slug };
    } catch (error: any) {
        console.error('Provisioning Error:', error);
        return { success: false, error: error.message };
    }
}
