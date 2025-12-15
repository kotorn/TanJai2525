'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/mock-db';
import { z } from 'zod';

export type MenuItem = {
    id: string;
    tenant_id: string; // Using tenant_id instead of restaurant_id for consistency with mock-db
    category: string; // MockDB uses simple string category provided in UI, we can keep it or enhance
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
}

const MenuItemSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    category: z.string().min(1, "Category is required"),
    description: z.string().optional(),
    image_url: z.string().optional().nullable(),
    is_available: z.boolean().default(true),
});

export async function getMenuData(tenantSlug: string) {
    // In mock-db, items are global or need helper to filter. 
    // db.getMenuItems(tenantId) returns all items currently in the simple mock implementation.
    // In a real app we would filter by tenant.
    
    const items = db.getMenuItems(tenantSlug); 
    
    // Extract unique categories from items for the sidebar
    // If no items, provide default categories
    const categoryNames = Array.from(new Set(items.map((i: any) => i.category || 'Uncategorized')));
    const categories: Category[] = categoryNames.map((name, index) => ({
        id: `cat-${index}`, // Simple mock ID
        name: name as string
    }));

    if (categories.length === 0) {
        categories.push({ id: 'cat-main', name: 'Main' });
        categories.push({ id: 'cat-appetizer', name: 'Appetizer' });
        categories.push({ id: 'cat-drink', name: 'Drink' });
    }

    return {
        categories,
        items: items as MenuItem[]
    };
}

export async function createMenuItem(tenantSlug: string, data: z.infer<typeof MenuItemSchema>) {
    const result = MenuItemSchema.safeParse(data);
    
    if (!result.success) {
        return { error: "Invalid data", details: result.error.flatten() };
    }

    db.createMenuItem({
        tenant_id: tenantSlug,
        ...result.data,
        stock: 100 // Default stock
    });

    revalidatePath(`/${tenantSlug}/admin/menu`);
    return { success: true };
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>) {
    // Mock DB update logic
    // We need to implement update in MockDB or do it manually here since db.updateOrder exists but updateMenuItem might not
    // Checking mock-db.ts content from previous read:
    // It has createMenuItem, getMenuItems, updateStock, createOrder... NO updateMenuItem generic.
    // We need to extend it or hack it. Since it's in-memory, we can reference the array directly if exported?
    // The export is `export const MockDB = { ... params: [] }`. 
    // And `export const db = ...`. 
    // We can iterate db.menuItems if accessible.
    
    const items = db.menuItems;
    const itemIndex = items.findIndex((i: any) => i.id === id);
    
    if (itemIndex === -1) return { error: "Item not found" };

    const updatedItem = { ...items[itemIndex], ...data };
    items[itemIndex] = updatedItem;

    // revalidatePath is harder without tenant slug context if not passed, 
    // but usually we are on the page so revalidatePath('/') or current url works.
    // We will assume usage in the admin page.
    // Actually we need tenantSlug to revalidate correctly.
    // Ideally we pass it or path.
    // Let's rely on simple refresh or revalidatePath global? 
    // Just return success. Client router.refresh() handles it.
    
    return { success: true };
}

export async function deleteMenuItem(id: string) {
    const index = db.menuItems.findIndex((i: any) => i.id === id);
    if (index !== -1) {
        db.menuItems.splice(index, 1);
        return { success: true };
    }
    return { error: "Item not found" };
}
