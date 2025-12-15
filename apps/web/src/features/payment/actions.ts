'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function markOrderPaid(tenantId: string, orderId: string) {
    try {
        const { error } = await supabase
            .from('orders')
            .update({
                status: 'paid', // Or 'completed'
                payment_method: 'cash',
                paid_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .eq('tenant_id', tenantId);

        if (error) throw error;

        revalidatePath(`/${tenantId}`);
        revalidatePath(`/${tenantId}/admin/cashier`);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getUnpaidOrders(tenantId: string) {
    const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', tenantId)
        .neq('status', 'paid')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: true });

    return data || [];
}
