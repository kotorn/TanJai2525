-- Create feature_flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text NOT NULL UNIQUE,
    value jsonb DEFAULT 'false'::jsonb,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS for feature_flags
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Create policy for reading feature flags (everyone can read)
CREATE POLICY "Enable read access for all users" ON public.feature_flags
    FOR SELECT
    USING (true);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    plan_tier text NOT NULL CHECK (plan_tier IN ('free', 'pro', 'enterprise')),
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
