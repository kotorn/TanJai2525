-- Create dynamic_qrs table
CREATE TABLE IF NOT EXISTS dynamic_qrs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  amount DECIMAL(10, 2),
  payload JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active', -- active, used, expired
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_qr_status 
    CHECK (status IN ('active', 'used', 'expired'))
);

CREATE INDEX idx_dynamic_qrs_tenant ON dynamic_qrs(tenant_id);
CREATE INDEX idx_dynamic_qrs_expiry ON dynamic_qrs(expires_at);

ALTER TABLE dynamic_qrs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their QRs"
  ON dynamic_qrs FOR ALL
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE id IN (
          SELECT id FROM profiles WHERE id = auth.uid() -- Simplified for now
      )
    )
  );

CREATE POLICY "Public can view active QRs"
  ON dynamic_qrs FOR SELECT
  USING (status = 'active' AND expires_at > NOW());
