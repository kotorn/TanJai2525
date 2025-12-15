'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Types for the Order Payload
type OrderItemInput = {
    menu_item_id: string;
    quantity: number;
    options?: Record<string, any>;
};

type CreateOrderInput = {
    tenant_id: string; // In real app, derived from session/context
    table_number: string;
    items: OrderItemInput[];
};

// Initialize Supabase Client (Server-Side)
// Note: In a real Next.js app, use createServerComponentClient from @supabase/auth-helpers-nextjs
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use Service Role for atomic actions if bypassing RLS on edge cases, OR use standard key with RLS context
const supabase = createClient(supabaseUrl, supabaseKey);

export async function processOrder(data: CreateOrderInput) {
    console.log('Processing Order for Tenant:', data.tenant_id);

    try {
        // 1. Call the Atomic Database Function (RPC)
        // This ensures order creation and inventory deduction happen in ONE transaction
        const { data: orderId, error } = await supabase.rpc('create_order_with_stock_deduction', {
            p_tenant_id: data.tenant_id,
            p_table_number: data.table_number,
            p_items: data.items,
        });

        if (error) {
            console.error('Database Error:', error);
            throw new Error(`Order failed: ${error.message}`);
        }

        // 2. Trigger Real-time Broadcast (KDS)
        // Even though Supabase Realtime listens to DB changes, we might want to trigger specific events
        // or if we aren't using listening on 'orders' table directly. 
        // Ideally, the client (KDS) is listening to 'INSERT ON orders' via Supabase Realtime.
        // So explicit broadcast might be redundant if CDC is on, but good for custom notify.

        // 3. Revalidate Cache
        // Clear the cache for the KDS and Order Status pages
        revalidatePath(`/${data.tenant_id}/kds`);
        revalidatePath(`/${data.tenant_id}/tables/${data.table_number}`);

        return { success: true, orderId };

    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
