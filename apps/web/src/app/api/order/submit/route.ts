import { NextRequest, NextResponse } from 'next/server';
import { routeToStation } from '@/lib/kitchen/station-router';
import { createClient } from '@/lib/supabase/server';
import { apiGuard } from '@/lib/api-auth';

// DEV-0001: Order Ingestion API
// Owner: Dev Core

interface OrderItemPayload {
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
    category: string; // Needed for routing
}

interface SubmitOrderPayload {
    restaurantId: string;
    tableId: string;
    guestId?: string; // Optional for Guest Checkout
    items: OrderItemPayload[];
}

export async function POST(req: NextRequest) {
    // Security Guard
    const guardResult = apiGuard(req);
    if (guardResult) return guardResult;

    try {
        const body = await req.json() as SubmitOrderPayload;
        const supabase = createClient();

        // 1. Basic Validation
        if (!body.restaurantId || !body.tableId || !body.items || body.items.length === 0) {
            return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
        }

        console.log(`[API] Processing Order for Table ${body.tableId}...`);

        // 2. Process Routing & Structure Data for DB
        const routedItems = body.items.map(item => {
            const station = routeToStation({ 
                id: item.menuItemId, 
                category: item.category,
                tags: [] 
            });

            return {
                menu_item_id: item.menuItemId,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                notes: item.notes,
                station,
                status: 'PENDING'
            };
        });

        // 3. Database Insertion
        // Insert Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                restaurant_id: body.restaurantId,
                table_id: body.tableId,
                guest_id: body.guestId,
                status: 'PENDING_PACK',
                total_amount: body.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Insert Order Items
        const itemsToInsert = routedItems.map(item => ({
            ...item,
            order_id: order.id
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        console.log('[API] Order Persistence Success:', order.id);

        // 4. Success Response
        return NextResponse.json({
            success: true,
            orderId: order.id,
            routedItems: routedItems
        });

    } catch (error: any) {
        console.error('[API] Order Submit Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
