"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateOrderSchema = z.object({
    items: z.array(
        z.object({
            menu_item_id: z.string().uuid(),
            quantity: z.number().min(1),
            price: z.number().min(0),
        })
    ),
    total_amount: z.number().min(0),
});

export async function createOrder(data: z.infer<typeof CreateOrderSchema>) {
    const supabase = await createClient();

    // Validate input
    const result = CreateOrderSchema.safeParse(data);
    if (!result.success) {
        return { error: "Invalid input data" };
    }

    const { items, total_amount } = result.data;

    // 1. Get Tenant ID (RLS will enforce this, but we need it for inserting)
    // In a real generic insert, we might rely on default values, but here explicit is safer.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    // Transaction wrapping is tricky in Supabase HTTP API.
    // Ideally, we use a Postgres Function (RPC) for atomic Order + Inventory.
    // For Day 3 Skeleton, we'll demonstrate the JS-side logic structure.

    // A. Create Order
    const { data: order, error: orderError } = await supabase
        .from("orders") // Assumes orders table exists (it wasn't in Day 2 schema, might need to add it or its a pending task)
        .insert({
            status: "pending",
            total_amount,
        })
        .select()
        .single();

    if (orderError) {
        console.error("Order creation failed", orderError);
        return { error: "Failed to create order" };
    }

    // B. Create Order Items
    const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
        // In a real app, we would rollback here (delete the order).
        // Or better, use call a Postgres function: `perform_order_transaction(...)`
        console.error("Order items failed", itemsError);
        return { error: "Failed to create order items" };
    }

    revalidatePath("/pos");
    return { success: true, orderId: order.id };
}
