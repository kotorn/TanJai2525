'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function fetchKitchenOrders(tenantId: string) {
    const supabase = createServerActionClient({ cookies });
    
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
    const supabase = createServerActionClient({ cookies });

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
