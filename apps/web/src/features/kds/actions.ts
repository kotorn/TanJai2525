'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function fetchKitchenOrders(tenantId: string) {
    const supabase = createSupabaseClient();
    
    // Fetch orders with status pending or preparing
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                id,
                quantity,
                name,
                notes,
                modifiers,
                menu_items (
                    name,
                    image_url
                )
            )
        `)
        // .eq('tenant_id', tenantId) // If tenant_id column exists
        .in('status', ['pending', 'preparing'])
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Fetch KDS Error:", error);
        return [];
    }

    return data || [];
}

export async function updateOrderStatus(tenantId: string, orderId: string, newStatus: string) {
    const supabase = createSupabaseClient();

    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

    if (error) {
        console.error("Update KDS Error:", error);
        return { success: false, error: error.message };
    }
    
    // Revalidate the KDS page
    revalidatePath(`/${tenantId}/kds`);
    return { success: true };
}
