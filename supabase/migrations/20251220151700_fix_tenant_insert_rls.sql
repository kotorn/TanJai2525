-- Enable RLS on tenants table (just within case it's not enabled)
ALTER TABLE "public"."tenants" ENABLE ROW LEVEL SECURITY;

-- Allow Authenticated Users to INSERT a new Tenant
-- This is required because we are establishing a new shop, and the user is already logged in.
CREATE POLICY "Enable insert for authenticated users" ON "public"."tenants"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow Authenticated Users to SELECT their own tenants (Optional, but good practice)
-- Adjust 'owner_id' logical linkage if needed, but usually we link via public.users.tenant_id
-- For now, letting them insert is the priority.
