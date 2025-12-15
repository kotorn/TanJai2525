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


export async function processOrder(
    tenantId: string,
    items: { id: string; quantity: number, name?: string }[], // Updated to accept name if possible, or we mock it
    tableNumber: string = '1',
    userId?: string // Optional: for logged-in users
) {
    console.log('[Mock] Processing Order:', items);
    
    const { db } = await import('@/lib/mock-db');
    
    // Calculate mock total (50 * qty)
    const total = items.reduce((acc, item) => acc + (50 * item.quantity), 0);

    // Create Order
    // We try to ensure items has structure KDS expects.
    // KDS expects order_items: { quantity, menu_items: { name } }
    // We map items to that structure
    const orderItems = items.map(i => ({
        quantity: i.quantity,
        menu_items: { name: 'Boat Noodles (Mock)' } // Hardcoded for now if name not passed
    }));

    const order = {
        tenant_id: tenantId,
        table_number: tableNumber,
        status: 'pending',
        total_amount: total,
        user_id: userId || null,
        order_items: orderItems, // Store directly for KDS to read
        created_at: new Date().toISOString()
    };

    const created = db.createOrder(order);

    revalidatePath(`/${tenantId}/kds`);
    revalidatePath(`/${tenantId}/tables/${tableNumber}`);

    return { success: true, orderId: created.id };
}
