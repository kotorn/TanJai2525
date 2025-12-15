'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Service role for updates
// const supabase = createClient(supabaseUrl, supabaseKey);

export async function updateOrderStatus(tenantId: string, orderId: string, newStatus: string) {
    console.log('[Mock] Updating Order:', orderId, newStatus);
    const { db } = await import('@/lib/mock-db');
    
    db.updateOrder(orderId, { status: newStatus });

    revalidatePath(`/${tenantId}/kds`);
    return { success: true };
}
