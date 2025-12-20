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
            // ... (log insert code)
        }

        // 3. Intelligent Message Handling (Level 1, 2, 3)
        await this.handleIntelligentResponse({
            provider,
            channel,
            userId: providerUserId,
            message: content,
            restaurantId: restaurant_id
        });

        return { profile, success: true };
    }

    private static async handleIntelligentResponse(params: {
        provider: SocialProvider;
        channel: SocialChannelSource;
        userId: string;
        message: string;
        restaurantId: string;
    }) {
        const { provider, userId, message, restaurantId } = params;
        const supabase = createClient();

        // Pick Adapter
        let adapter;
        if (provider === 'line') {
            const { LineAdapter } = await import('../adapters/line-adapter');
            adapter = new LineAdapter();
        } else {
            const { FacebookAdapter } = await import('../adapters/facebook-adapter');
            adapter = new FacebookAdapter();
        }

        const normalizedMsg = message.trim().toLowerCase();

        // Level 1: Exact Match (Zero Cost)
        if (normalizedMsg === 'เมนู' || normalizedMsg === 'สั่งอาหาร' || normalizedMsg === 'menu') {
            const { data: items } = await supabase
                .from('menu_items')
                .select('*')
                .eq('restaurant_id', restaurantId)
                .eq('is_available', true)
                .limit(10);

            if (items && items.length > 0) {
                return await adapter.sendProductCarousel(items, userId);
            }
        }

        // Level 2: Database Search (Low Cost)
        const { data: searchResults } = await supabase
            .from('menu_items')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .textSearch('name', normalizedMsg, { config: 'english' }) // Simple search
            .limit(5);

        if (searchResults && searchResults.length > 0) {
            return await adapter.sendProductCarousel(searchResults, userId);
        }

        // Level 3: AI Fallback (Using Gemini AI)
        console.log('[SocialHandler] Level 3 AI Fallback triggered for:', message);

        try {
            const { BotContextService } = await import('../services/bot-context-service');
            const { AIHandler } = await import('../services/ai-handler');

            const context = await BotContextService.getContext(restaurantId);
            const systemPrompt = BotContextService.formatSystemPrompt(context);

            const aiResponse = await AIHandler.askGemini(message, systemPrompt);

            await adapter.sendMessage(userId, aiResponse);
        } catch (error) {
            console.error('[SocialHandler] Level 3 AI Fallback failed:', error);
            await adapter.sendMessage(userId, 'ขออภัยครับ ระบบ AI ขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง หรือติดต่อพนักงานครับ');
        }
    }
}
