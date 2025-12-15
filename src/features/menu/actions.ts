'use server'

import { createClient } from '@/lib/supabase/server'
import { getRestaurantId, isMockMode } from '@/lib/supabase/helpers'
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

import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Helper to get the current user's restaurant ID.
 * Simplification: Fetches the *first* restaurant created by the user (or available to them).
 * In a multi-tenant real-world scenario, you'd likely pick the 'active' restaurant from context/session.
 */
/**
 * Mock Data Store (Global for dev server lifetime)
 */
let mockCategories: Category[] = [
    { id: "cat-1", restaurant_id: "mock-rest-1", name: "Recommended", sort_order: 0, created_at: new Date().toISOString() },
    { id: "cat-2", restaurant_id: "mock-rest-1", name: "Main Dishes", sort_order: 1, created_at: new Date().toISOString() },
    { id: "cat-3", restaurant_id: "mock-rest-1", name: "Beverages", sort_order: 2, created_at: new Date().toISOString() },
];

let mockItems: MenuItem[] = [
    { id: "item-1", restaurant_id: "mock-rest-1", category_id: "cat-1", name: "Pad Thai", price: 120, description: "Classic Thai stir-fried noodles", image_url: null, is_available: true, created_at: new Date().toISOString() },
    { id: "item-2", restaurant_id: "mock-rest-1", category_id: "cat-1", name: "Tom Yum Kung", price: 180, description: "Spicy prawn soup", image_url: null, is_available: true, created_at: new Date().toISOString() },
];


export async function getMenuData() {
    const supabase = await createClient();
    const restaurant_id = await getRestaurantId(supabase);

    if (!restaurant_id) {
        return { categories: [], items: [] };
    }

    if (isMockMode()) {
        console.warn("[Mock Mode] Fetching menu data");
        // Sort mock data
        return {
            categories: [...mockCategories].sort((a, b) => a.sort_order - b.sort_order),
            items: [...mockItems].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        };
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
};

export async function createCategory(data: { name: string; sort_order?: number }) {
    const supabase = await createClient();
    const result = CategorySchema.safeParse(data);
    
    if (!result.success) {
        return { error: "Invalid data", details: result.error.flatten() };
    }

    const restaurant_id = await getRestaurantId(supabase);
    if (!restaurant_id) return { error: "No restaurant found" };

    if (isMockMode()) {
        mockCategories.push({
            id: `cat-${Date.now()}`,
            restaurant_id,
            name: result.data.name,
            sort_order: result.data.sort_order,
            created_at: new Date().toISOString()
        });
        revalidatePath('/dashboard/menu');
        return { success: true };
    }

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
    if (isMockMode()) {
        mockCategories = mockCategories.filter(c => c.id !== id);
        revalidatePath('/dashboard/menu');
        return { success: true };
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/menu');
    return { success: true };
}

type CreateMenuItemData = z.infer<typeof MenuItemSchema>;

export async function createMenuItem(data: CreateMenuItemData) {
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
        description: result.data.description || null,
        image_url: result.data.image_url || null,
        is_available: result.data.is_available,
        category_id: result.data.category_id || null,
        restaurant_id: restaurant_id
    };

    if (isMockMode()) {
        mockItems.unshift({
            id: `item-${Date.now()}`,
            created_at: new Date().toISOString(),
            // @ts-ignore
            ...payload
        });
        revalidatePath('/dashboard/menu');
        return { success: true };
    }

    const { error } = await supabase.from('menu_items').insert(payload);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/menu');
    return { success: true };
}

export async function deleteMenuItem(id: string) {
    if (isMockMode()) {
        mockItems = mockItems.filter(i => i.id !== id);
        revalidatePath('/dashboard/menu');
        return { success: true };
    }

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
    if (isMockMode()) {
        items.forEach(item => {
            const cat = mockCategories.find(c => c.id === item.id);
            if (cat) cat.sort_order = item.sort_order;
        });
        revalidatePath('/dashboard/menu');
        return { success: true };
    }

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
    // Sanitize
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, created_at, restaurant_id, ...updates } = data;

    if (isMockMode()) {
        const item = mockItems.find(i => i.id === id);
        if (item) {
            Object.assign(item, updates);
        }
        revalidatePath('/dashboard/menu');
        return { success: true };
    }

    const supabase = await createClient();
    
    const { error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/menu');
    return { success: true };
}

// Option Groups Actions

export type OptionGroup = {
    id: string;
    restaurant_id: string;
    name: string;
    selection_type: 'single' | 'multiple';
    min_selection: number;
    max_selection: number | null;
    created_at: string;
    options?: Option[];
}

export type Option = {
    id: string;
    group_id: string;
    name: string;
    price: number;
    is_available: boolean;
    sort_order: number;
}

const OptionGroupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    selection_type: z.enum(['single', 'multiple']),
    min_selection: z.coerce.number().min(0).default(0),
    max_selection: z.coerce.number().optional().nullable(),
});

export async function getOptionGroups() {
    const supabase = await createClient();
    const restaurant_id = await getRestaurantId(supabase);

    if (!restaurant_id) return [];

    if (isMockMode()) {
        // Mock data
        return [
            { id: "og-1", restaurant_id, name: "Spiciness", selection_type: "single", min_selection: 1, max_selection: 1, options: [
                { id: "opt-1", group_id: "og-1", name: "Mild", price: 0, is_available: true, sort_order: 1 },
                { id: "opt-2", group_id: "og-1", name: "Medium", price: 0, is_available: true, sort_order: 2 },
                { id: "opt-3", group_id: "og-1", name: "Spicy", price: 0, is_available: true, sort_order: 3 },
            ] }
        ] as OptionGroup[];
    }

    const { data: groups, error } = await supabase
        .from('option_groups')
        .select(`
            *,
            options (
                *
            )
        `)
        .eq('restaurant_id', restaurant_id)
        .order('id'); // Should order by created_at but using ID for now

    if (error) {
        console.error("Error fetching option groups", error);
        return [];
    }

    // Sort options manually if needed or via query
    return (groups as OptionGroup[]) || [];
}

export async function createOptionGroup(data: z.infer<typeof OptionGroupSchema>) {
    const supabase = await createClient();
    const result = OptionGroupSchema.safeParse(data);

    if (!result.success) {
        return { error: "Invalid data", details: result.error.flatten() };
    }

    const restaurant_id = await getRestaurantId(supabase);
    if (!restaurant_id) return { error: "No restaurant found" };

    if (isMockMode()) return { success: true };

    const { error } = await supabase
        .from('option_groups')
        .insert({
            ...result.data,
            restaurant_id
        });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/menu');
    return { success: true };
}
