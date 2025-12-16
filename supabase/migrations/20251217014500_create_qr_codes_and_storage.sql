-- Create Enum for QR Type
create type public.qr_type as enum ('static', 'dynamic');

-- Create QR Codes Table
create table public.qr_codes (
  id uuid not null default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  type public.qr_type not null,
  table_number text, -- Nullable for dynamic
  metadata jsonb default '{}'::jsonb, -- Stores pre-selected items or value
  token text not null unique, -- The access key for the URL
  expires_at timestamptz, -- Null for static
  created_at timestamptz default now(),
  primary key (id)
);

-- Enable RLS
alter table public.qr_codes enable row level security;

-- Policies for QR Codes

-- 1. Public Read (Anyone with a token needs to verify it, or anyone scanning)
-- Actually, we might want to restrict listing. 
-- But for "scanning", we usually fetch by token.
create policy "Allow public read by token"
on public.qr_codes for select
using (true); 
-- In a real strict environment, we might strict this to 'token = current_setting(...)' but for a public kiosk/menu, public read is standard.

-- 2. Owner Write (Owner of the restaurant)
-- Assuming 'restaurants' table has an owner_id or strict RLS. 
-- We usually check 'auth.uid()' against restaurant ownership.
-- For now, let's assume a generic strict policy if exists, or just allow authenticated for prototype if 'restaurants' policy handles the cross-check.
-- Let's assume there's a 'user_roles' or similar. 
-- Standard simplified SaaS pattern:
create policy "Allow owners to insert/update their own qr codes"
on public.qr_codes
for all
using (
  auth.uid() in (
    select owner_id from public.restaurants where id = qr_codes.restaurant_id
  )
)
with check (
  auth.uid() in (
    select owner_id from public.restaurants where id = qr_codes.restaurant_id
  )
);

-- Indexes
create index qr_codes_token_idx on public.qr_codes (token);
create index qr_codes_restaurant_id_idx on public.qr_codes (restaurant_id);

-- Storage: menu-images

-- Attempt to create bucket via SQL (Works if storage schema is accessible)
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

-- Storage Policies
-- 1. Public Read
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'menu-images' );

-- 2. Authenticated Upload (Any auth user? Or strict owner?)
-- Let's allow any authenticated user (staff/owner) to upload for now.
create policy "Authenticated Upload"
on storage.objects for insert
with check (
  bucket_id = 'menu-images'
  and auth.role() = 'authenticated'
);

-- 3. Owner Delete/Update
create policy "Owner Manage"
on storage.objects for all
using (
  bucket_id = 'menu-images'
  and auth.uid() = owner
);
