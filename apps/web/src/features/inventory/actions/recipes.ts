'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Add/Link Ingredient to Menu Item
export async function addRecipeItem(menuItemId: string, ingredientId: string, quantity: number) {
    const supabase = createClient();

    // Check if valid quantity
    if (quantity <= 0) throw new Error("Quantity must be positive");

    const { error } = await supabase
        .from('recipes')
        .insert({
            menu_item_id: menuItemId,
            ingredient_id: ingredientId,
            quantity_required: quantity
        });

    if (error) {
        if (error.code === '23505') { // Unique violation
            throw new Error('This ingredient is already in the recipe.');
        }
        throw new Error(error.message);
    }

    // We don't have tenantSlug easily available here for specific revalidation path without fetching.
    // However, the page usage pattern usually involves passing it or just refreshing.
    // We can rely on client-side refresh or simple revalidation if needed.
    return { success: true };
}

// Remove Ingredient from Recipe
export async function removeRecipeItem(recipeId: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);

    if (error) throw new Error(error.message);
    return { success: true };
}

// Update Quantity
export async function updateRecipeItemQuantity(recipeId: string, quantity: number) {
    const supabase = createClient();

    if (quantity <= 0) throw new Error("Quantity must be positive");

    const { error } = await supabase
        .from('recipes')
        .update({ quantity_required: quantity })
        .eq('id', recipeId);

    if (error) throw new Error(error.message);
    return { success: true };
}
