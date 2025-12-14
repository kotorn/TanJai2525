-- Standardize 'products' to 'menu_items'
ALTER TABLE IF EXISTS products RENAME TO menu_items;

-- Ensure 'restaurants' has all fields previously intended for 'tenants'
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS cuisine_type TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Ensure 'menu_items' (formerly products) has consistent naming if needed
-- (The init schema had good structure, just renaming table is main step)

-- Drop 'tenants' if it exists to clean up confusion (assuming data is in restaurants or fresh start)
DROP TABLE IF EXISTS tenants;

-- Storage Setup for 'restaurant-assets' (if not already done by previous migration attempts)
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-assets', 'restaurant-assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage
DROP POLICY IF EXISTS "Public Access to Restaurant Assets" ON storage.objects;
CREATE POLICY "Public Access to Restaurant Assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'restaurant-assets' );

DROP POLICY IF EXISTS "Authenticated Users can upload Assets" ON storage.objects;
CREATE POLICY "Authenticated Users can upload Assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'restaurant-assets' 
  AND auth.role() = 'authenticated'
);
