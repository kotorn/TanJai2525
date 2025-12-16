"use server"

import { createClient } from "@/lib/supabase/server"

export interface InventoryItem {
    id: string
    name: string
    sku: string
    category: string
    stock: number
    unit: string
    status: string
}

export async function getInventory(): Promise<InventoryItem[]> {
    const supabase = createClient();
    
    // In a real scenario, we would join 'inventory_items' with 'inventory_levels'
    // For now, let's assume we are fetching from 'inventory_items' directly as a fallback
    // if the new schema isn't fully migrated.
    
    // Query: Get all inventory items
    const { data: items, error } = await supabase
        .from('inventory_items')
        .select('*');
        
    if (error) {
        console.error("Error fetching inventory:", error);
        return [];
    }

    // Transform to UI Model
    return items.map((item: any) => ({
        id: item.id,
        name: item.name,
        sku: item.name.substring(0, 3).toUpperCase() + '-001', // Fake SKU if missing
        category: "General", // Placeholder
        stock: item.current_stock || 0,
        unit: item.unit,
        status: (item.current_stock || 0) < 10 ? "Low Stock" : "In Stock"
    }));
}
