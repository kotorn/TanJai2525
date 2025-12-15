'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Zod Schemas
const MenuItemSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    category_id: z.string().optional(), // Optional if using text category fallback
    category: z.string().optional(), // Text fallback
    description: z.string().optional(),
    image_url: z.string().optional().nullable(),
    is_available: z.boolean().default(true),
    stock: z.coerce.number().default(0),
});

export type MenuItem = {
    id: string;
    tenant_id: string;
    category_id?: string; 
    category?: string;
    name: string;
    price: number;
    description: string | null;
    image_url: string | null;
    is_available: boolean;
    stock: number;
}

export type Category = {
    id: string;
    name: string;
    sort_order: number;
}

export async function getMenuData(tenantSlug: string) {
    const supabase = createClient();

    // 1. Get Tenant ID from Slug
    const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', tenantSlug)
        .single();
    
    if (tenantError || !tenant) {
        console.error('Tenant not found:', tenantError);
        return { categories: [], items: [] };
    }

    // 2. Fetch Categories
    // We try to fetch from 'menu_categories'. If it fails (table missing), we return empty.
    let categories: Category[] = [];
    const { data: catData, error: catError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('tenant_id', tenant.id) // Assuming we fixed the column name or it matches
        .order('sort_order', { ascending: true });
        
    if (!catError && catData) {
        categories = catData as Category[];
    } else {
        console.warn('Could not fetch categories (table might be missing or using restaurant_id):', catError?.message);
    }

    // 3. Fetch Items
    const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('name', { ascending: true });

    if (itemsError) {
        console.error('Error fetching items:', itemsError);
    }

    return {
        categories: categories,
        items: (items || []) as MenuItem[]
    };
}

export async function createCategory(tenantSlug: string, name: string) {
     const supabase = createClient();
     
    // Get Tenant
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', tenantSlug)
        .single();

    if (!tenant) return { error: "Tenant not found" };

    const { error } = await supabase.from('menu_categories').insert({
        tenant_id: tenant.id,
        name: name,
        sort_order: 0
    });

    if (error) return { error: error.message };
    revalidatePath(`/${tenantSlug}/admin/menu`);
    return { success: true };
}

export async function createMenuItem(tenantSlug: string, data: z.infer<typeof MenuItemSchema>) {
    const result = MenuItemSchema.safeParse(data);
    
    if (!result.success) {
        return { error: "Invalid data", details: result.error.flatten() };
    }

    const supabase = createClient();
    
    // Get Tenant ID
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', tenantSlug)
        .single();

    if (!tenant) return { error: "Tenant not found" };

    const { error } = await supabase.from('menu_items').insert({
        tenant_id: tenant.id,
        ...result.data
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/${tenantSlug}/admin/menu`);
    return { success: true };
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>) {
    const supabase = createClient();

    const { error } = await supabase
        .from('menu_items')
        .update(data)
        .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/'); 
    return { success: true };
}

export async function deleteMenuItem(id: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
        
    if (error) return { error: error.message };
    
    return { success: true };
}
