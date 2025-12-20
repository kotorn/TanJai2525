export type SocialProvider = 'line' | 'facebook' | 'tiktok' | 'google';

export type SocialChannelSource = 'pos' | 'liff' | 'line_oa' | 'facebook_messenger' | 'tiktok';

export interface SocialProfile {
    id: string;
    customer_id?: string;
    provider: SocialProvider;
    provider_user_id: string;
    profile_data?: {
        display_name?: string;
        picture_url?: string;
        status_message?: string;
        email?: string;
    };
    last_interaction: string;
}

export interface CommunicationLog {
    id: string;
    tenant_id: string;
    customer_id?: string;
    social_profile_id?: string;
    channel: SocialChannelSource;
    direction: 'inbound' | 'outbound';
    content: string;
    content_type: 'text' | 'image' | 'template' | 'file';
    external_id?: string; // Social platform message ID
    metadata?: any;
    created_at: string;
}
