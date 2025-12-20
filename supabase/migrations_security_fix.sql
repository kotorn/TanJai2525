-- ==============================================================================
-- SECURITY FIX MIGRATION
-- Fixes Supabase Linter Warnings: Security Definer View & RLS Disabled
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Fix Security Definer Views (High Risk)
-- Changes views to execute with the privileges of the user calling the view,
-- ensuring RLS policies are enforced.
-- ------------------------------------------------------------------------------

ALTER VIEW public.daily_sales_stats SET (security_invoker = on);
ALTER VIEW public.hourly_sales_stats SET (security_invoker = on);

-- ------------------------------------------------------------------------------
-- 2. Enable RLS on Public Tables (Critical)
-- Enables Row Level Security on tables that were previously unprotected.
-- ------------------------------------------------------------------------------

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_plans ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. Add Access Policies (RLS)
-- Define who can read/write data for these tables.
-- ------------------------------------------------------------------------------

-- Table: system_plans (SaaS Plans info)
-- Policy: Everyone can read plans, only Service Role can modify.
CREATE POLICY "Allow Public Read on system_plans" 
ON public.system_plans FOR SELECT 
TO anon, authenticated 
USING (true);

-- Table: promotions (Shop Promotions)
-- Policy: Formatting public read (for customers), shop owner write.
CREATE POLICY "Allow Public Read on promotions" 
ON public.promotions FOR SELECT 
TO anon, authenticated 
USING (true);

-- Assuming verification via shop_id or role is needed for write, blocking write for now for anon.
-- Service role (admin) bypasses RLS automatically.

-- Table: promotion_rules
-- Policy: Public read.
CREATE POLICY "Allow Public Read on promotion_rules"
ON public.promotion_rules FOR SELECT
TO anon, authenticated
USING (true);

-- ==============================================================================
-- END MIGRATION
-- ==============================================================================
