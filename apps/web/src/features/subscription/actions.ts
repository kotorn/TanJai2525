'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getSubscriptionStatus(tenantId: string) {
    const supabase = createClient();

    // Get current subscription
    const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .order('end_date', { ascending: false })
        .limit(1)
        .single();

    // If no active subscription found, check if there is any (expired?)
    // Or default to Free
    if (error || !subscription) {
        return { plan: 'free', status: 'active', isValid: true };
    }

    return {
        plan: subscription.plan_id,
        status: subscription.status,
        isValid: new Date(subscription.end_date) > new Date()
    };
}

export async function upgradeSubscription(tenantId: string, planId: string, slipUrl: string, amount: number) {
    const supabase = createClient();
    const user = await supabase.auth.getUser();

    if (!user.data.user) return { success: false, error: 'Unauthorized' };

    try {
        // 1. Create or Get Subscription Record (Pending)
        // For simplicity, we just insert a new "pending_verification" subscription
        // properly linked to the tenant

        const { data: sub, error: subError } = await supabase
            .from('subscriptions')
            .insert({
                tenant_id: tenantId,
                plan_id: planId,
                status: 'pending_verification',
                // Start date/end date will be updated by Admin upon approval
                start_date: new Date().toISOString(),
            })
            .select()
            .single();

        if (subError) throw new Error('Failed to create subscription: ' + subError.message);

        // 2. Insert Payment Slip
        const { error: slipError } = await supabase
            .from('payment_slips')
            .insert({
                subscription_id: sub.id,
                amount: amount,
                slip_image_url: slipUrl, // In real app, this comes from Storage
                status: 'pending'
            });

        if (slipError) throw new Error('Failed to save slip: ' + slipError.message);

        revalidatePath(`/${tenantId}/settings/billing`);
        return { success: true };

    } catch (error: any) {
        console.error('Upgrade Error:', error);
        return { success: false, error: error.message };
    }
}
