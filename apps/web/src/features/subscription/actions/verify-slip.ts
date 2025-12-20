'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Approve Subscription
export async function approveSubscription(subscriptionId: string, durationMonths: number = 1) {
    const supabase = createClient();

    // 1. Verify Admin Access (Double check server-side)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile?.role !== 'super_admin') throw new Error('Unauthorized');

    // 2. Calculate Dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // 3. Update Subscription
    const { error: subError } = await supabase
        .from('subscriptions')
        .update({
            status: 'active',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

    if (subError) throw new Error('Failed to update subscription');

    // 4. Update Payment Slip as Verified
    // Find the latest pending slip for this subscription
    const { error: slipError } = await supabase
        .from('payment_slips')
        .update({
            status: 'verified',
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString()
        })
        .eq('subscription_id', subscriptionId)
        .eq('status', 'pending'); // Only update pending ones

    revalidatePath('/admin/subscriptions');
    return { success: true };
}

// Reject Subscription
export async function rejectSubscription(subscriptionId: string, reason: string = 'Payment invalid') {
    const supabase = createClient();

    // 1. Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile?.role !== 'super_admin') throw new Error('Unauthorized');

    // 2. Update Subscription -> Expired (or kept as pending/rejected?)
    // Let's set to 'expired' so they are blocked again and see the red screen.
    const { error: subError } = await supabase
        .from('subscriptions')
        .update({
            status: 'expired',
            updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

    if (subError) throw new Error('Failed to update subscription');

    // 3. Update Slip -> Rejected
    const { error: slipError } = await supabase
        .from('payment_slips')
        .update({
            status: 'rejected',
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString()
            // We might want to store the reason? Schema doesn't have it yet. Skip for now.
        })
        .eq('subscription_id', subscriptionId)
        .eq('status', 'pending');

    revalidatePath('/admin/subscriptions');
    return { success: true };
}
