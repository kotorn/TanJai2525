'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Types
export type Category = {
    id: string;
    restaurant_id: string;
    name: string;
    sort_order: number;
    created_at: string;
}

export type MenuItem = {
    id: string;
    restaurant_id: string;
    category_id: string | null;
    name: string;
    price: number;
    description: string | null;
    image_url: string | null;
    is_available: boolean;
    created_at: string;
}

// Schemas
const CategorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    sort_order: z.number().default(0),
});

const MenuItemSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    category_id: z.string().uuid("Category is required").nullable().optional(),
    description: z.string().optional(),
    image_url: z.string().optional().nullable(),
    is_available: z.boolean().default(true),
});

/**
 * Helper to get the current user's restaurant ID.
 * Simplification: Fetches the *first* restaurant created by the user (or available to them).
 * In a multi-tenant real-world scenario, you'd likely pick the 'active' restaurant from context/session.
 */
async function getRestaurantId(supabase: any) {
    // 1. Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 2. Fetch the restaurant associated with the user
    // Assuming RLS allows the user to see their own restaurants.
    // If no restaurant exists, we can't create menu items.
    const { data } = await supabase
        .from('restaurants')
        .select('id')
        .limit(1)
        .single();
    
    if (data) return data.id;

    return null;
}

export async function getMenuData() {
    const supabase = await createClient();
    const restaurant_id = await getRestaurantId(supabase);

    if (!restaurant_id) {
        return { categories: [], items: [] };
    }

    const { data: categories, error: catError } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", restaurant_id)
        .order("sort_order", { ascending: true });

    if (catError) console.error("Error fetching categories:", catError);

    const { data: items, error: itemError } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurant_id)
        .order("created_at", { ascending: false });

    if (itemError) console.error("Error fetching items:", itemError);

    return {
        categories: (categories as Category[]) || [],
        items: (items as MenuItem[]) || []
    };
}

export async function createCategory(data: { name: string; sort_order?: number }) {
    const supabase = await createClient();
    const result = CategorySchema.safeParse(data);
    
    if (!result.success) {
        return { error: "Invalid data", details: result.error.flatten() };
    }

    const restaurant_id = await getRestaurantId(supabase);
    if (!restaurant_id) return { error: "No restaurant found" };

    const { error } = await supabase
        .from('menu_categories')
        .insert({
            name: result.data.name,
            sort_order: result.data.sort_order,
            restaurant_id: restaurant_id
        });

    if (error) return { error: error.message };

    revalidatePath('/dashboard/menu');
    return { success: true };
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/menu');
    return { success: true };
}

export async function createMenuItem(data: any) {
    const supabase = await createClient();
    const result = MenuItemSchema.safeParse(data);

    if (!result.success) {
        return { error: "Invalid data", details: result.error.flatten() };
    }

    const restaurant_id = await getRestaurantId(supabase);
    if (!restaurant_id) return { error: "No restaurant found" };

    const payload = {
        name: result.data.name,
        price: result.data.price,
        description: result.data.description,
        image_url: result.data.image_url,
        is_available: result.data.is_available,
        category_id: result.data.category_id || null,
        restaurant_id: restaurant_id
    };

    const { error } = await supabase.from('menu_items').insert(payload);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/menu');
    return { success: true };
}

export async function deleteMenuItem(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/menu');
    return { success: true };
}

export async function updateCategoryOrder(items: { id: string; sort_order: number }[]) {
    const supabase = await createClient();
    
    // Process updates
    const updates = items.map(item => 
        supabase
            .from('menu_categories')
            .update({ sort_order: item.sort_order })
            .eq('id', item.id)
    );

    await Promise.all(updates);
    revalidatePath('/dashboard/menu');
    return { success: true };
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>) {
    const supabase = await createClient();
    
    // Sanitize
    const { id: _, created_at, restaurant_id, ...updates } = data as any;

    const { error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/menu');
    return { success: true };
}
