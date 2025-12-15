'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function addMenuItem(tenantSlug: string, name: string, price: number, category: string) {
    try {
        // 1. Resolve Slug to ID
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('id')
            .eq('slug', tenantSlug)
            .single();

        if (tenantError || !tenant) throw new Error('Tenant not found');

        const { error } = await supabase
            .from('menu_items')
            .insert({
                tenant_id: tenant.id,
                name: name,
                price: price,
                category: category,
                is_available: true
            });

        if (error) throw error;

        revalidatePath(`/${tenantSlug}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
