'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { PaymentService } from '@/services/payment-service';

export async function markOrderPaid(tenantId: string, orderId: string) {
    const supabase = await createClient();
    const paymentService = new PaymentService(supabase);

    try {
        // "cash" is default here, but service allows flexibility
        await paymentService.processPayment(orderId, 'cash', 0); 
        
        revalidatePath(`/${tenantId}`);
        revalidatePath(`/${tenantId}/admin/cashier`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getUnpaidOrders(tenantId: string) {
    const supabase = await createClient();
    
    // Direct DB query is fine for "reading" lists if not complex business logic,
    // or we could add `getUnpaidOrders` to PaymentService if we want strict encapsulation.
    // For now, let's keep simple reading here or use Service?
    // "Service Layer" usually implies encapsulation.
    
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', tenantId)
        .neq('status', 'paid')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Get Unpaid Orders Error:', error);
        return [];
    }

    return orders;
}
