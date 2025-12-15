'use server';

import { createClient } from '@/lib/supabase/server';
import { isMockMode } from '@/lib/supabase/helpers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

/**
 * MOCK DATA
 */
const MOCK_RESTAURANT_ID = "mock-restaurant-id";
const MOCK_TABLE_ID = "mock-table-id"; // Non-UUID for visibility, or UUID if schema strict
// Using UUIDs for mocks to satisfy Zod if we enforce it, but we can relax schema or use uuidv4
const MOCK_TABLE_UUID = "00000000-0000-0000-0000-000000000001";
const MOCK_RESTAURANT_UUID = "00000000-0000-0000-0000-000000000002";


export async function getSession(tableId: string) {
    if (isMockMode()) {
        console.warn("[Mock Mode] Using mock session data");
        // Simulate loading delay
        await new Promise(r => setTimeout(r, 500));

        return {
            table: {
                id: tableId,
                name: "Table 1 (Mock)",
                restaurant_id: MOCK_RESTAURANT_UUID,
                status: 'available'
            },
            restaurant: {
                id: MOCK_RESTAURANT_UUID,
                name: "Tanjai Mock Kitchen",
                cuisine_type: "Thai Modern",
                banner_url: null,
                logo_url: null
            },
            categories: [
                { id: "cat-1", name: "Recommended", sort_order: 1 },
                { id: "cat-2", name: "Main Dishes", sort_order: 2 },
            ],
            items: [
                { id: "item-1", category_id: "cat-1", name: "Signature Pad Thai", price: 150, description: "Best Pad Thai in town", is_available: true, image_url: null },
                { id: "item-2", category_id: "cat-2", name: "Green Curry", price: 120, description: "Spicy and creamy", is_available: true, image_url: null },
                { id: "item-3", category_id: "cat-2", name: "Mango Sticky Rice", price: 89, description: "Sweet dessert", is_available: true, image_url: null },
            ]
        };
    }

    const supabase = await createClient();

    // 1. Fetch Table details
    const { data: table, error: tableError } = await supabase
        .from('tables')
        .select(`
            *,
            restaurants (
                id,
                name,
                slug,
                banner_url,
                logo_url,
                cuisine_type
            )
        `)
        .eq('id', tableId)
        .single();
    
    if (tableError || !table) {
        console.error("Session Error: Table not found", tableError);
        return { error: "Invalid Table ID" };
    }

    // 2. Fetch Menu (Public)
    const { data: categories } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', table.restaurant_id)
        .order('sort_order');

    const { data: items } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', table.restaurant_id)
        .eq('is_available', true)
        .order('created_at');

    return {
        table,
        restaurant: table.restaurants,
        categories: categories || [],
        items: items || []
    };
}

/**
 * Order Schema Verification
 */
const orderSchema = z.object({
  restaurantId: z.string().uuid(),
  tableId: z.string().uuid(),
  items: z.array(
    z.object({
      menuItemId: z.string(), // menu item id might not be uuid in mock ??
      quantity: z.number().min(1).max(99),
      selectedOptions: z.array(z.any()).optional(),
      specialInstructions: z.string().max(100).optional(),
    })
  ).min(1),
  orderInstructions: z.string().max(200).optional(),
});

export async function submitOrder(tableId: string, cartItems: any[]) {
    // 1. Validate Basic Input
    if (!tableId) return { error: "Missing Table ID" };
    if (!cartItems || cartItems.length === 0) return { error: "Cart is empty" };

    if (isMockMode()) {
        console.warn("[Mock Mode] Submitting order");
        await new Promise(r => setTimeout(r, 1000));
        return { success: true, orderId: `mock-order-${Date.now()}` };
    }

    const supabase = await createClient();

    // 2. Resolve Restaurant ID from Table
    const { data: table } = await supabase
        .from('tables')
        .select('restaurant_id')
        .eq('id', tableId)
        .single();
    
    if (!table) return { error: "Invalid Table" };

    // 3. Prepare Data for Schema Validation (Optional safety step)
    const payload = {
        restaurantId: table.restaurant_id,
        tableId,
        items: cartItems.map(item => ({
            menuItemId: item.id, // Maps internal 'id' to schema 'menuItemId'
            quantity: item.quantity,
            selectedOptions: item.selectedOptions,
            specialInstructions: item.notes
        }))
    };

    // 4. Calculate Total (Server-side)
    // In real app, re-fetch prices. For now, sum from client payload TRUSTED for MVP or re-fetch if possible.
    // Let's stick to client prices for MVP speed to avoid N+1 selects, but acknowledge risk.
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 5. Insert Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            restaurant_id: table.restaurant_id,
            table_id: tableId,
            status: 'pending',
            total_amount: totalAmount,
            payment_status: 'unpaid',
            // order_number is auto-generated by trigger
        })
        .select()
        .single();

    if (orderError) {
        console.error("Submit Order Error", orderError);
        return { error: "Failed to create order" };
    }

    // 6. Insert Items
    const orderItemsPayload = cartItems.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        name: item.name,        // Snapshot name
        unit_price: item.price, // Snapshot price
        quantity: item.quantity,
        modifiers: item.selectedOptions,
        notes: item.notes,
        line_total: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload);

    if (itemsError) {
        console.error("Submit Items Error", itemsError);
        // Ideally rollback
        return { error: "Failed to save order items" };
    }

    revalidatePath('/dashboard/orders');
    return { success: true, orderId: order.id };
}

// Fetch Unpaid Orders (For POS)
export async function fetchUnpaidOrders() {
    if (isMockMode()) {
        return [
            { id: "ord-1", table_number: "T1", order_number: "TJ-0001", total_amount: 550, status: 'pending', created_at: new Date().toISOString() },
            { id: "ord-2", table_number: "T3", order_number: "TJ-0002", total_amount: 120, status: 'completed', created_at: new Date().toISOString() }
        ];
    }
    const supabase = await createClient();
    // Logic to fetch orders
    return [];
}

// Update Status (For KDS)
export async function updateOrderStatus(orderId: string, status: string) {
    if (isMockMode()) return { success: true };
    
    // DB Update logic
    const supabase = await createClient();
    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}
