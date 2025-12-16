-- Create Enum for Plans
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');

-- Table: Subscriptions (One per Tenant/User)
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    tier subscription_tier DEFAULT 'free',
    status TEXT DEFAULT 'active', -- active, past_due, canceled
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Feature Flags (Definitions)
CREATE TABLE public.feature_flags (
    key TEXT PRIMARY KEY, -- e.g., 'advanced_analytics'
    description TEXT,
    is_global_enabled BOOLEAN DEFAULT true
);

-- Table: Plan Features (Mapping)
CREATE TABLE public.plan_features (
    plan_tier subscription_tier NOT NULL,
    feature_key TEXT REFERENCES public.feature_flags(key) NOT NULL,
    PRIMARY KEY (plan_tier, feature_key)
);

-- RLS: Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- RLS: Feature Flags (Public Read)
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read flags" 
ON public.feature_flags FOR SELECT 
USING (true);

-- RLS: Plan Features (Public Read)
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read plan features" 
ON public.plan_features FOR SELECT 
USING (true);

-- SEED DATA (Initial Default State)
INSERT INTO public.feature_flags (key, description) VALUES
('basic_pos', 'Standard Ordering & Checkout'),
('inventory_sync', 'Real-time Cross-device Sync'),
('adv_analytics', 'Deep insights and export'),
('loyalty_program', 'Customer Points System');

INSERT INTO public.plan_features (plan_tier, feature_key) VALUES
('free', 'basic_pos'),
('pro', 'basic_pos'),
('pro', 'inventory_sync'),
('pro', 'adv_analytics'),
('pro', 'loyalty_program');

-- Function to check if user has feature (Helper for RLS queries)
CREATE OR REPLACE FUNCTION public.has_feature(user_uuid UUID, f_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_tier subscription_tier;
BEGIN
    SELECT tier INTO user_tier FROM public.subscriptions WHERE user_id = user_uuid;
    
    -- Default to free if no sub found
    IF user_tier IS NULL THEN
        user_tier := 'free';
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.plan_features 
        WHERE plan_tier = user_tier AND feature_key = f_key
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
