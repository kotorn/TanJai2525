import { NextRequest, NextResponse } from 'next/server';
import { routeToStation, StationID } from '@/lib/kitchen/station-router';

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
    try {
        const body = await req.json() as SubmitOrderPayload;

        // 1. Basic Validation
        if (!body.restaurantId || !body.tableId || !body.items || body.items.length === 0) {
            return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
        }

        console.log(`[API] Processing Order for Table ${body.tableId}...`);

        // 2. Mock Inventory Check (ARC-0002 Logic would go here)
        // const isStockAvailable = await checkInventory(body.items);
        // if (!isStockAvailable) return NextResponse.json({ error: 'Out of Stock' }, { status: 409 });

        // 3. Process Routing & Structure Data for DB
        const routedItems = body.items.map(item => {
            const station = routeToStation({ 
                id: item.menuItemId, 
                category: item.category,
                tags: [] // In real app, fetch tags from DB based on ID
            });

            return {
                ...item,
                station,
                status: 'PENDING'
            };
        });

        // 4. Mock Database Insertion
        // await supabase.from('orders').insert({ ... });
        // await supabase.from('order_items').insert(routedItems);

        console.log('[API] Order Routed Successfully:', routedItems);

        // 5. Success Response
        return NextResponse.json({
            success: true,
            orderId: `ord_${Date.now()}`,
            routedItems: routedItems
        });

    } catch (error) {
        console.error('[API] Order Submit Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
