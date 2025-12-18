-- 1. Create System Plans Table (SaaS Tiers)
CREATE TABLE IF NOT EXISTS public.system_plans (
    id TEXT PRIMARY KEY, -- e.g., 'free', 'starter', 'pro'
    name TEXT NOT NULL,
    price_thb INTEGER NOT NULL DEFAULT 0,
    features JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. { "max_items": 50, "inventory": false }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Subscriptions Table (Payment History)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
    plan_id TEXT NOT NULL REFERENCES public.system_plans(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'trial')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enum for Restaurant Subscription Status
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS plan_id TEXT REFERENCES public.system_plans(id) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- 4. Enable RLS
ALTER TABLE public.system_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- System Plans: Readable by everyone (Public pricing), only Admin can edit (Service Role)
CREATE POLICY "Public can view plans" ON public.system_plans FOR SELECT USING (true);

-- Subscriptions: Restaurant Owners can view their own sub
CREATE POLICY "Owners can view own subscription" ON public.subscriptions 
FOR SELECT 
USING (auth.uid() IN (
    SELECT owner_id FROM public.restaurants WHERE id = subscriptions.restaurant_id
));

-- Seed Default Plans
INSERT INTO public.system_plans (id, name, price_thb, features) VALUES
('free', 'Street Food Starter', 0, '{"max_items": 20, "tables": 5, "inventory": false}'::jsonb),
('pro', 'Professional', 490, '{"max_items": 1000, "tables": 50, "inventory": true}'::jsonb),
('enterprise', 'Chain Master', 1990, '{"max_items": -1, "tables": -1, "inventory": true, "api_access": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;
