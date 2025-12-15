-- Add qr_code_url column if not exists
ALTER TABLE tables ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- Create function to auto-generate QR URL on insert
CREATE OR REPLACE FUNCTION generate_table_qr()
RETURNS TRIGGER AS $$
BEGIN
    -- Basic format: https://app.tanjaipos.com/order?tableId={uuid}
    -- In production, might want a shorter ID or signed token
    NEW.qr_code_url := 'https://app.tanjaipos.com/order?tableId=' || NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_generate_table_qr ON tables;
CREATE TRIGGER trigger_generate_table_qr
BEFORE INSERT ON tables
FOR EACH ROW
EXECUTE FUNCTION generate_table_qr();

-- RLS Update (Ensure public can read tables for order flow)
DROP POLICY IF EXISTS "Public read access for tables" ON tables;
CREATE POLICY "Public read access for tables" ON tables
    FOR SELECT
    USING (true); -- Ideally restrict to same restaurant if context known, but public read mainly safe for MVP

-- Ensure indexes
CREATE INDEX IF NOT EXISTS idx_tables_restaurant_id ON tables(restaurant_id);
