import { SupabaseClient } from '@supabase/supabase-js';

export type InventoryItemInput = {
    name: string;
    unit: string;
    cost_per_unit: number;
    current_stock: number;
    min_stock_level: number;
};

export class InventoryService {
    constructor(private readonly supabase: SupabaseClient) {}

    /**
     * Adds a new item to the inventory.
     */
    async addInventoryItem(tenantId: string, item: InventoryItemInput) {
        console.log(`[InventoryService] Adding item: ${item.name}`);
        const { data, error } = await this.supabase
            .from('inventory_items')
            .insert({
                tenant_id: tenantId,
                ...item
            })
            .select()
            .single();

        if (error) {
            console.error('[InventoryService] Add Item Error:', error);
            throw new Error(`Failed to add inventory item: ${error.message}`);
        }

        return data;
    }

    /**
     * Updates the stock level for a specific item.
     */
    async updateStock(itemId: string, newStock: number) {
        console.log(`[InventoryService] Updating stock for ${itemId} to ${newStock}`);
        const { error } = await this.supabase
            .from('inventory_items')
            .update({ current_stock: newStock })
            .eq('id', itemId);

        if (error) {
            console.error('[InventoryService] Update Stock Error:', error);
            throw new Error(`Failed to update stock: ${error.message}`);
        }

        return { success: true };
    }

    /**
     * Checks if there is sufficient stock for a list of items.
     * Use this before creating an order.
     */
    async checkStock(items: { menuItemId: string; quantity: number }[]): Promise<boolean> {
        // Implement logic to map menu items to inventory ingredients if needed.
        // For now, this is a placeholder for direct mapping or future complexity.
        return true;
    }
}
