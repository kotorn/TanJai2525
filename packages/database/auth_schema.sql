-- Auth & Tenant Mapping Schema

-------------------------------------------------------------------------------
-- 1. PUBLIC USERS (Mapping auth.users -> app data)
-------------------------------------------------------------------------------

create table public.users (
  id uuid references auth.users(id) on delete cascade not null primary key,
  tenant_id uuid references public.tenants(id),
  full_name text,
  avatar_url text,
  email text,
  role text default 'staff', -- 'owner', 'manager', 'staff'
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.users enable row level security;

-- Policies for Users
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-------------------------------------------------------------------------------
-- 2. TENANT PERMISSIONS
-------------------------------------------------------------------------------

-- Allow authenticated users to create a tenant (Onboarding)
create policy "Authenticated users can create tenant" on public.tenants
  for insert with check (auth.role() = 'authenticated');

-- Allow users to view their own tenant
create policy "Users can view own tenant" on public.tenants
  for select using (
    id in (select tenant_id from public.users where id = auth.uid())
  );
  
-------------------------------------------------------------------------------
-- 3. UPDATED RLS HELPER (Using DB Lookup instead of just Claim for robustness)
-------------------------------------------------------------------------------

-- This function looks up the tenant_id for the current user from the public.users table
-- This is safer than relying solely on client-side context for critical writes
create or replace function app_get_tenant_id_safe()
returns uuid
language sql stable
security definer -- Runs with elevated privs to read users table even if policy restricts
as $$
  select tenant_id from public.users where id = auth.uid();
$$;

-- Update existing policies to use this function (Optional/Migrate later)
-- Example: create policy ... using (tenant_id = app_get_tenant_id_safe());
