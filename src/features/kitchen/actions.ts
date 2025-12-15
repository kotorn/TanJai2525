'use server';

import { createClient } from '@/lib/supabase/server';
import { isMockMode } from '@/lib/supabase/helpers';

// In-memory mock store for KDS orders (persists during server runtime)
const mockOrdersStore: any[] = [
    {
        id: "kds-1",
        order_number: "TJ-0001",
        table_number: "5",
        status: 'pending', // Pending
        created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
        special_instructions: "No spicy",
        order_items: [
            { id: "oi-1", quantity: 2, name: "Pad Thai", notes: "Extra lime" },
            { id: "oi-2", quantity: 1, name: "Iced Tea" }
        ]
    },
    {
        id: "kds-2",
        order_number: "TJ-0002",
        table_number: "12",
        status: 'preparing', // Preparing
        created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago (Red alert!)
        special_instructions: null,
        order_items: [
            { id: "oi-3", quantity: 1, name: "Green Curry" }
        ]
    }
];

export async function fetchKitchenOrders() {
    if (isMockMode()) {
        // Return mock orders, filtering out 'done' status (they should be hidden)
        return mockOrdersStore.filter(o => o.status !== 'done');
    }

    const supabase = await createClient();
    
    // Fetch orders with status pending or preparing
    // order items, and menu details (optional, but items usually have snapshot name)
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                id,
                quantity,
                name,
                notes,
                modifiers
            )
        `)
        .in('status', ['pending', 'preparing'])
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Fetch KDS Error:", error);
        return [];
    }

    return data || [];
}

export async function updateKitchenOrderStatus(orderId: string, newStatus: string) {
    if (isMockMode()) {
        // Update mock store
        const order = mockOrdersStore.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            console.log(`[Mock KDS] Updated order ${orderId} to ${newStatus}`);
        }
        return { success: true };
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

    if (error) {
        console.error("Update KDS Error:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
