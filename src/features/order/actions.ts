'use server'

import { createClient } from '@/lib/supabase/server'
import { getMenuData } from '@/features/menu/actions'

export async function getSession(tableId: string) {
    const supabase = await createClient();

    // 1. Fetch Table details
    // We select *, but also want the restaurant details.
    // Assuming simple structure for now.
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

    if (table.status !== 'available' && table.status !== 'occupied') {
        // Maybe later block if 'reserved'? For now allow ordering.
    }

    // 2. Fetch Menu
    // We can reuse getMenuData, but we might want to filter by this restaurant specifically.
    // getMenuData currently fetches ALL (or RLS filtered).
    // Logic: getMenuData uses RLS based on Auth User.
    // HERE: The customer is NOT authenticated as a restaurant owner.
    // So getMenuData() might return nothing if RLS blocks public access.
    
    // ACTION: We need a PUBLIC get menu action.
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', table.restaurant_id)
        .order('sort_order');

    const { data: items, error: itemError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', table.restaurant_id)
        .eq('is_available', true)
        .order('created_at');

    if (catError || itemError) {
        return { error: "Failed to load menu" };
    }

    return {
        table,
        restaurant: table.restaurants, // Valid due to inner join structure helper or simple return
        categories: categories || [],
        items: items || []
    };
}
