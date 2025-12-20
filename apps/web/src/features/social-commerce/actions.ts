'use server';

import { createClient } from '@/lib/supabase/server';
import { LineAdapter } from './adapters/line-adapter';
import { FacebookAdapter } from './adapters/facebook-adapter';

/**
 * Server Action to send an order bill/summary to a social media chat
 */
export async function sendBillToSocial(orderId: string) {
    const supabase = createClient();

    // 1. Fetch Order details
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
            *,
            social_profile:social_profiles(*)
        `)
        .eq('id', orderId)
        .single();

    if (orderError || !order) {
        console.error('[SocialAction] Order fetch failed:', orderError);
        return { success: false, error: 'Order not found' };
    }

    // 2. Determine target account
    // If order has channel_source, use that. 
    // Otherwise, check if user has a linked social profile.
    const channel = order.channel_source;
    let targetProfile = (order as any).social_profile;

    if (!targetProfile && order.customer_id) {
        // Try to find any linked profile for this customer
        const { data: profile } = await supabase
            .from('social_profiles')
            .select('*')
            .eq('customer_id', order.customer_id)
            .limit(1)
            .maybeSingle();
        targetProfile = profile;
    }

    if (!targetProfile) {
        return { success: false, error: 'No linked social profile found for this customer' };
    }

    const userId = targetProfile.provider_user_id;

    // 3. Selection of Adapter
    let adapter;
    if (targetProfile.provider === 'line') {
        adapter = new LineAdapter();
    } else if (targetProfile.provider === 'facebook') {
        adapter = new FacebookAdapter();
    } else {
        return { success: false, error: `Provider ${targetProfile.provider} not supported for billing yet` };
    }

    // 4. Send rich message
    const result = await adapter.sendOrderSummary(orderId, userId);

    // 5. Log Outbound Communication
    if (result.success) {
        await supabase.from('communication_logs').insert({
            restaurant_id: order.restaurant_id,
            social_profile_id: targetProfile.id,
            customer_id: order.customer_id,
            channel: channel === 'pos' ? 'line_oa' : channel, // Logic to choose default
            direction: 'outbound',
            content: `Sent rich order summary for #${orderId.slice(0, 8)}`,
            content_type: 'template',
            external_id: result.messageId,
            metadata: { order_id: orderId }
        });
    }

    return result;
}
