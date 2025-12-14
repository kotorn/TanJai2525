-- Add profile fields to tenants table
alter table tenants 
add column if not exists slug text unique,
add column if not exists cuisine_type text,
add column if not exists logo_url text,
add column if not exists banner_url text,
add column if not exists address text,
add column if not exists phone text;

-- Create index on slug for faster lookups (e.g., tanjai.app/r/my-restaurant)
create index if not exists idx_tenants_slug on tenants(slug);

-- Create a storage bucket for restaurant assets if it doesn't exist
insert into storage.buckets (id, name, public)
values ('restaurant-assets', 'restaurant-assets', true)
on conflict (id) do nothing;

-- RLS Policy for Storage: Allow public read access
create policy "Public Access to Restaurant Assets"
on storage.objects for select
using ( bucket_id = 'restaurant-assets' );

-- RLS Policy for Storage: Allow authenticated users (tenants) to upload their own assets
-- Note: This assumes the file path contains the tenant_id or user_id for stricter control.
-- For now, we allow authenticated inserts to the bucket.
create policy "Authenticated Users can upload Assets"
on storage.objects for insert
with check (
  bucket_id = 'restaurant-assets' 
  and auth.role() = 'authenticated'
);
