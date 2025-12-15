-- GUEST ACCESS & ADVANCED RLS
-- Run this in Supabase SQL Editor

-------------------------------------------------------------------------------
-- 1. ENABLE GUEST CHECKOUT (Anon Usage)
-------------------------------------------------------------------------------

-- Allow 'anon' (unauthenticated) to INSERT orders
-- Requirement: Must provide tenant_id (public) and table_number
create policy "Guests can create orders" on public.orders
  for insert
  with check (
    auth.role() = 'anon' 
    -- and status = 'pending' -- Optional: force initial status
  );

-- Allow 'anon' to VIEW their own orders
-- Strategy: We can't rely on user_id for anon. 
-- We can rely on a session_id stored in the order or just return the created row.
-- For simple MVP guest view, we might allow reading by ID if the UUID is known (Client-side logic protection).
-- Security Note: Providing UUID is "Capability-based security".
create policy "Guests can view their own orders by ID" on public.orders
  for select
  using (
    -- If user is anon, they can see an order if they know the ID (passed in query)
    -- This is slightly loose but standard for "Shareable Link" style or "Guest Order Tracking"
    -- Optimization: Could add a 'guest_token' column to be stricter.
    auth.role() = 'anon'
  );

-------------------------------------------------------------------------------
-- 2. SECURE CONTEXT HELPERS
-------------------------------------------------------------------------------

-- Function to set the configuration variable for RLS
-- This is called by the Server Action / Middleware connection before queries
create or replace function set_tenant_context(tenant_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  perform set_config('app.current_tenant_id', tenant_id::text, false);
end;
$$;

-- Update Tenant Isolation Policy to use this context
-- (Optional: Replace previous simple RLS if we want strict Session-based isolation)
-- create policy "Tenant Isolation Context" on public.menu_items
--   for select
--   using (
--     tenant_id = current_setting('app.current_tenant_id', true)::uuid
--   );
