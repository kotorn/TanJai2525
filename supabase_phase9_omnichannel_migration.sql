-- TanJai POS: Phase 9 Omnichannel Expansion Migration

-- 1. Extend Orders table for UTM Tracking
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- 2. Create Stock Ledger (Inventory Movements)
CREATE TABLE IF NOT EXISTS stock_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
    order_id UUID REFERENCES orders(id), -- Optional: Link to order if triggered by sale
    movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'waste')),
    quantity DECIMAL(12,2) NOT NULL,
    previous_quantity DECIMAL(12,2),
    new_quantity DECIMAL(12,2),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 3. Enable RLS
ALTER TABLE stock_ledger ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy
CREATE POLICY "Restaurant owners can view stock ledger" ON stock_ledger
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM restaurants WHERE id = stock_ledger.restaurant_id AND owner_id = auth.uid())
    );

COMMENT ON TABLE stock_ledger IS 'Audit trail for all inventory movements';
