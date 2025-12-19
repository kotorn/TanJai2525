'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { InventoryService, type InventoryItemInput } from '@/services/inventory-service';

export async function addInventoryItem(tenantId: string, item: InventoryItemInput) {
    const supabase = await createClient();
    const inventoryService = new InventoryService(supabase);

    try {
        await inventoryService.addInventoryItem(tenantId, item);
        revalidatePath(`/${tenantId}/inventory`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateStock(itemId: string, newStock: number) {
    const supabase = await createClient();
    const inventoryService = new InventoryService(supabase);

    try {
        await inventoryService.updateStock(itemId, newStock);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
