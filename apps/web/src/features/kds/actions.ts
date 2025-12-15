'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Service role for updates
const supabase = createClient(supabaseUrl, supabaseKey);

export async function updateOrderStatus(tenantId: string, orderId: string, newStatus: string) {
    try {
        const { error } = await supabase
            .from('orders')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .eq('tenant_id', tenantId); // Safety check

        if (error) throw error;

        revalidatePath(`/${tenantId}/kds`);
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update status:', error);
        return { success: false, error: error.message };
    }
}
