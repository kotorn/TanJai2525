-- Create Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id text NOT NULL DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  status text NOT NULL DEFAULT 'active', -- 'active', 'expired', 'pending_verification'
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  auto_renew boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id)
);

-- Enable RLS for Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow Tenant Owners to read their own subscription
CREATE POLICY "Tenant owners can read own subscription" ON public.subscriptions
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Create Payment Slips Table
CREATE TABLE IF NOT EXISTS public.payment_slips (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  slip_image_url text NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  CONSTRAINT payment_slips_pkey PRIMARY KEY (id)
);

-- Enable RLS for Payment Slips
ALTER TABLE public.payment_slips ENABLE ROW LEVEL SECURITY;

-- Allow Tenant Owners to insert slips (upload proof)
CREATE POLICY "Tenant owners can insert slips" ON public.payment_slips
  FOR INSERT WITH CHECK (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE tenant_id IN (
        SELECT tenant_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

-- Allow Tenant Owners to read their own slips
CREATE POLICY "Tenant owners can read own slips" ON public.payment_slips
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE tenant_id IN (
        SELECT tenant_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

-- Add 'plan' column to tenants table for easy access (denormalization)
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS current_plan text DEFAULT 'free';
