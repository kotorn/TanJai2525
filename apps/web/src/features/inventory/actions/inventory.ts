'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Add New Ingredient
export async function addIngredient(tenantId: string, data: { name: string, unit: string, cost: number, stock: number, minStock: number }) {
    const supabase = createClient();

    const { error } = await supabase
        .from('ingredients')
        .insert({
            tenant_id: tenantId,
            name: data.name,
            unit: data.unit,
            cost_per_unit: data.cost,
            current_stock: data.stock,
            min_stock_level: data.minStock
        });

    if (error) throw new Error(error.message);
    revalidatePath(`/${tenantId}/inventory`);
    return { success: true };
}

// Update Stock (Restock / Audit)
export async function updateStock(ingredientId: string, quantityChange: number, type: 'restock' | 'waste' | 'audit', note?: string, cost?: number) {
    const supabase = createClient();

    // 1. Get current stock
    const { data: ingredient } = await supabase
        .from('ingredients')
        .select('current_stock, tenant_id') // need tenant_id? maybe for revalidation path
        .eq('id', ingredientId)
        .single();

    if (!ingredient) throw new Error('Ingredient not found');

    // 2. Insert Transaction
    const { error: txError } = await supabase
        .from('inventory_transactions')
        .insert({
            ingredient_id: ingredientId,
            type: type,
            quantity_change: quantityChange,
            cost_at_time: cost || 0, // Should fetch current cost if not provided
            note: note
        });

    if (txError) throw new Error(txError.message);

    // 3. Update Ingredient Level
    const newStock = (ingredient.current_stock || 0) + quantityChange;

    // Optional: Update cost_per_unit if it's a restock with new price (Weighted Average logic could go here)
    const updateData: any = { current_stock: newStock };
    if (cost && type === 'restock') {
        updateData.cost_per_unit = cost;
    }

    const { error: updateError } = await supabase
        .from('ingredients')
        .update(updateData)
        .eq('id', ingredientId);

    if (updateError) throw new Error(updateError.message);

    // Revalidate? We need tenantId to revalidate the page properly if we use /[tenant]/inventory
    // But we don't have tenantSlug here easily unless passed.
    // Ideally we pass path or just rely on client refresh. 
    // revalidatePath is global for the route string.

    return { success: true };
}
