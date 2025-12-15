'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function fetchKitchenOrders(restaurantId: string) {
    const supabase = await createClient();
    
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
        .eq('restaurant_id', restaurantId) // Filter by restaurant
        .in('status', ['pending', 'preparing'])
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Fetch KDS Error:", error);
        return [];
    }

    return data || [];
}

export async function updateKitchenOrderStatus(orderId: string, newStatus: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

    if (error) {
        console.error("Update KDS Error:", error);
        return { success: false, error: error.message };
    }
    
    // We don't strictly need revalidatePath if using realtime, 
    // but it helps if the user refreshes or for static regeneration.
    revalidatePath('/dashboard/kitchen'); 
    return { success: true };
}
