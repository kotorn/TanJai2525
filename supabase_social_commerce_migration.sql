-- TanJai POS: Social Commerce Migration
-- 1. Enums for Social Channels
DO $$ BEGIN
    CREATE TYPE social_provider_type AS ENUM ('line', 'facebook', 'tiktok', 'google');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE social_channel_source_type AS ENUM ('pos', 'liff', 'line_oa', 'facebook_messenger', 'tiktok');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Social Profiles (Linking Customers to Social IDs)
CREATE TABLE IF NOT EXISTS social_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES auth.users(id), -- Or a custom customers table if you use one
    provider social_provider_type NOT NULL,
    provider_user_id TEXT NOT NULL,
    profile_data JSONB,
    last_interaction TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);

-- 3. Communication Logs (Unified Inbox / CRM)
CREATE TABLE IF NOT EXISTS communication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    customer_id UUID REFERENCES auth.users(id),
    social_profile_id UUID REFERENCES social_profiles(id),
    channel social_channel_source_type NOT NULL DEFAULT 'pos',
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    content TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'text', -- text, image, template, etc.
    external_id TEXT, -- platform message id
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Extend Orders Table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS channel_source social_channel_source_type DEFAULT 'pos',
ADD COLUMN IF NOT EXISTS external_order_id TEXT;

-- 5. Enable RLS (Security)
ALTER TABLE social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;

-- 6. Add default RLS Policies (Example: Restaurant owner can see logs)
-- Note: Replace with specific policies based on your auth model
CREATE POLICY "Restaurant owners can view communication logs" ON communication_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM restaurants WHERE id = communication_logs.restaurant_id AND owner_id = auth.uid())
    );

COMMENT ON TABLE social_profiles IS 'Unified social identity mapping for customers';
COMMENT ON TABLE communication_logs IS 'ERPNext-style omnichannel communication tracking';
