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
import { withTenantContext } from '@/lib/db-utils'; // Use our new helper

// We'll use the generic action logic, but now robustly handling Auth context
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Service role for processing

export async function processOrder(
    tenantId: string,
    items: { id: string; quantity: number }[],
    tableNumber: string = '1',
    userId?: string // Optional: for logged-in users
) {
    // Use Helper to ensure DB Context is set (Security Best Practice)
    return await withTenantContext(tenantId, async (supabase) => {
        try {
            // 1. Prepare Order Payload
            const orderData = {
                tenant_id: tenantId,
                table_number: tableNumber,
                status: 'pending',
                total_amount: 0, // Calculated by DB trigger or logic below
                user_id: userId || null, // Link if logged in
            };

            // 2. Call Atomic Function (Defined in schema.sql)
            // We might need to update the function signature to accept user_id if not already
            // For MVP, if the function 'create_order_with_stock_deduction' doesn't support user_id, 
            // we might do a direct insert pattern or update the SQL function.
            // Let's assume for now we call the function, but it might need a small SQL update to persist user_id.
            // Alternatively, we do a direct insert block here leveraging the Service Role + Context.

            // Simulating the logic of the SQL function in TS for flexibility with Guest/User:

            let total = 0;
            // Verify items and calculate total (Simplified)
            // In real app: fetch prices from DB

            // Call the RPC defined previously
            const { data: orderId, error } = await supabase.rpc('create_order_with_stock_deduction', {
                p_tenant_id: tenantId,
                p_table_number: tableNumber,
                p_items: items
            });

            if (error) throw error;

            // If userId is present, we update the order to link it
            if (userId && orderId) {
                await supabase.from('orders').update({ user_id: userId }).eq('id', orderId);
            }

            // 3. Revalidate Cache
            // Clear the cache for the KDS and Order Status pages
            revalidatePath(`/${tenantId}/kds`);
            revalidatePath(`/${tenantId}/tables/${tableNumber}`);

            return { success: true, orderId };
        } catch (error: any) {
            console.error('Order Failed:', error);
            return { success: false, error: 'Order failed: ' + error.message };
        }
    });
}
