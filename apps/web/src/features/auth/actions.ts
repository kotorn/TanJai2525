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
        const supabase = createClient(); // Use authenticated client (Context: User)

        // 1. Generate Slug
        const slug = shopName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 10000);

        // 2. Insert Tenant
        // Now using authenticated user context, so the RLS "Enable insert for authenticated users" will pass.
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .insert({
                name: shopName,
                slug: slug,
                // Ensure the 'plan' is set to free by default, though DB defines default
            })
            .select()
            .single();

        if (tenantError) throw new Error('Failed to create tenant: ' + tenantError.message);

        // 3. Link User to Tenant (Update public.users)
        // Trying to use authenticated client. If RLS on users prevents this, we might need Service Role Key.
        // Assuming typical setup allows users to update own profile.
        const { error: userError } = await supabase
            .from('users')
            .upsert({
                id: userId,
                email: email,
                tenant_id: tenant.id,
                role: 'owner',
                full_name: shopName + ' Owner',
            })
            .select();

        if (userError) {
            console.error('User Link Error (Non-fatal for tenant creation):', userError);
            // If this fails, we might technically have a tenant but no owner linked properly in 'users' table.
            // But let's throw to be safe.
            throw new Error('Failed to link user: ' + userError.message);
        }

        // 4. Seed Default Menu (Optional)
        // Need to check if authenticated user can insert menu_items for this tenant
        // If RLS allows owner to insert, this is fine.
        const { error: menuError } = await supabase
            .from('menu_items')
            .insert([
                { tenant_id: tenant.id, name: 'Hot Coffee', price: 60, category: 'Coffee', is_available: true },
                { tenant_id: tenant.id, name: 'Iced Tea', price: 50, category: 'Tea', is_available: true },
            ]);

        if (menuError) console.warn('Menu Seed Error:', menuError); // Non-fatal

        // 5. Revalidate
        revalidatePath('/');

        return { success: true, slug: tenant.slug };
    } catch (error: any) {
        console.error('Provisioning Error:', error);
        return { success: false, error: error.message };
    }
}
