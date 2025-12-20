-- Create 'payment_slips' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment_slips', 'payment_slips', false) -- Private bucket
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload (INSERT)
CREATE POLICY "Authenticated users can upload slips"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment_slips'
  AND auth.role() = 'authenticated'
);

-- Policy: Allow users to view their own uploads (SELECT)
CREATE POLICY "Users can view own slips"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment_slips'
  AND auth.uid() = owner
);

-- Policy: Allow Super Admins to view all (SELECT)
-- Requires bridging to public.users table or a specific claim
-- For simplicity in MVP, we might rely on the Dashboard or a simpler check.
-- Let's try to link to public.users to check role
CREATE POLICY "Super Admins can view all slips"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment_slips'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE public.users.id = auth.uid() 
    AND public.users.role = 'super_admin'
  )
);
