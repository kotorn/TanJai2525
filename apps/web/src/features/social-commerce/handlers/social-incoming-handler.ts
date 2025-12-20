import { createClient } from '@/lib/supabase/server';
import { SocialProvider, SocialChannelSource } from '../types';

export class SocialIncomingHandler {
    /**
     * Entry point for all incoming social messages from webhooks
     */
    static async handleMessage(params: {
        provider: SocialProvider;
        channel: SocialChannelSource;
        providerUserId: string;
        content: string;
        contentType?: string;
        externalId?: string;
        metadata?: any;
    }) {
        const supabase = createClient();
        const { provider, channel, providerUserId, content, contentType = 'text', externalId, metadata } = params;

        // 1. Find or Create Social Profile
        let { data: profile, error: profileError } = await supabase
            .from('social_profiles')
            .select('*')
            .eq('provider', provider)
            .eq('provider_user_id', providerUserId)
            .maybeSingle();

        if (profileError) {
            console.error('[SocialHandler] Profile check failed:', profileError);
            throw profileError;
        }

        if (!profile) {
            // Create new profile (linked to a guest or nothing yet)
            const { data: newProfile, error: createError } = await supabase
                .from('social_profiles')
                .insert({
                    provider,
                    provider_user_id: providerUserId,
                    profile_data: metadata?.profile || {},
                    last_interaction: new Date().toISOString()
                })
                .select()
                .single();

            if (createError) throw createError;
            profile = newProfile;
        } else {
            // Update last interaction
            await supabase
                .from('social_profiles')
                .update({ last_interaction: new Date().toISOString() })
                .eq('id', profile.id);
        }

        // 2. Log Communication (ERPNext Style)
        // Note: In a real app, you'd want to determine the restaurant_id 
        // from the webhook URL or some mapping table. 
        // For now, we assume we need to find the active restaurant for this profile/customer.

        // Placeholder restaurant_id - in production, this should be resolved dynamically
        const restaurant_id = metadata?.restaurant_id || '';

        if (restaurant_id) {
            const { error: logError } = await supabase
                .from('communication_logs')
                .insert({
                    restaurant_id,
                    social_profile_id: profile.id,
                    customer_id: profile.customer_id,
                    channel,
                    direction: 'inbound',
                    content,
                    content_type: contentType,
                    external_id: externalId,
                    metadata
                });

            if (logError) console.error('[SocialHandler] Communication log failed:', logError);
        }

        return { profile, success: true };
    }
}
