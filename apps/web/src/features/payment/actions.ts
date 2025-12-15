'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// const supabase = createClient(supabaseUrl, supabaseKey);

export async function markOrderPaid(tenantId: string, orderId: string) {
    const { db } = await import('@/lib/mock-db');
    db.updateOrder(orderId, { 
        status: 'paid', 
        payment_method: 'cash',
        paid_at: new Date().toISOString()
    });

    revalidatePath(`/${tenantId}`);
    revalidatePath(`/${tenantId}/admin/cashier`);

    return { success: true };
}

export async function getUnpaidOrders(tenantId: string) {
    const { db } = await import('@/lib/mock-db');
    const orders = db.getOrders(tenantId);
    
    // Filter
    return orders.filter((o: any) => o.status !== 'paid' && o.status !== 'cancelled')
          .sort((a: any, b: any) => a.created_at.localeCompare(b.created_at));
}
