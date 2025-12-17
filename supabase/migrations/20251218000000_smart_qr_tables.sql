-- supabase/migrations/20251218000000_smart_qr_tables.sql

-- 1. Modify 'tables' to help with Static QR
ALTER TABLE tables 
ADD COLUMN IF NOT EXISTS qr_code_static_url TEXT;

-- 2. Create 'dynamic_qrs' table
CREATE TABLE IF NOT EXISTS dynamic_qrs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb, -- Content like {amount: 500, items: []}
  expires_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active', -- active, used, expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_qr_status CHECK (status IN ('active', 'used', 'expired'))
);

-- Indexes
CREATE INDEX idx_dynamic_qrs_status ON dynamic_qrs(status);
CREATE INDEX idx_dynamic_qrs_restaurant ON dynamic_qrs(restaurant_id);

-- 3. RLS Policies

ALTER TABLE dynamic_qrs ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can manage their QRs
CREATE POLICY "Owners can manage dynamic QRs"
  ON dynamic_qrs
  FOR ALL
  USING (
    restaurant_id IN (
        SELECT restaurant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Public can read 'active' QRs (for scanning)
CREATE POLICY "Public can view active dynamic QRs"
  ON dynamic_qrs
  FOR SELECT
  USING (
    status = 'active' 
    AND (expires_at IS NULL OR expires_at > NOW())
  );
