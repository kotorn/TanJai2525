-- Inventory Management System
-- Stock tracking, low stock alerts, and inventory history

-- Add inventory columns to menu_items
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS allow_backorder BOOLEAN DEFAULT FALSE;

-- Inventory transactions (history log)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  
  transaction_type TEXT NOT NULL, -- 'purchase', 'sale', 'adjustment', 'return'
  quantity_change INTEGER NOT NULL, -- Positive for increase, negative for decrease
  quantity_after INTEGER NOT NULL,
  
  reference_type TEXT, -- 'order', 'manual', 'system'
  reference_id UUID, -- Order ID or other reference
  
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Low stock alerts
CREATE TABLE IF NOT EXISTS low_stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  tenant_slug TEXT NOT NULL,
  
  current_stock INTEGER NOT NULL,
  threshold INTEGER NOT NULL,
  
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(menu_item_id, is_resolved)
);

-- Indexes
CREATE INDEX idx_inventory_transactions_menu_item ON inventory_transactions(menu_item_id);
CREATE INDEX idx_inventory_transactions_created_at ON inventory_transactions(created_at DESC);
CREATE INDEX idx_low_stock_alerts_tenant ON low_stock_alerts(tenant_slug);
CREATE INDEX idx_low_stock_alerts_unresolved ON low_stock_alerts(is_resolved) WHERE is_resolved = FALSE;

-- Function to update stock and log transaction
CREATE OR REPLACE FUNCTION update_inventory_stock(
  p_menu_item_id UUID,
  p_quantity_change INTEGER,
  p_transaction_type TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_current_stock INTEGER;
  v_new_stock INTEGER;
  v_track_inventory BOOLEAN;
BEGIN
  -- Get current stock and tracking status
  SELECT stock_quantity, track_inventory
  INTO v_current_stock, v_track_inventory
  FROM menu_items
  WHERE id = p_menu_item_id;
  
  IF NOT v_track_inventory THEN
    RETURN; -- Don't track inventory for this item
  END IF;
  
  v_new_stock := v_current_stock + p_quantity_change;
  
  -- Update stock
  UPDATE menu_items
  SET stock_quantity = v_new_stock
  WHERE id = p_menu_item_id;
  
  -- Log transaction
  INSERT INTO inventory_transactions (
    menu_item_id,
    transaction_type,
    quantity_change,
    quantity_after,
    reference_type,
    reference_id,
    notes,
    created_by
  ) VALUES (
    p_menu_item_id,
    p_transaction_type,
    p_quantity_change,
    v_new_stock,
    p_reference_type,
    p_reference_id,
    p_notes,
    auth.uid()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check and create low stock alerts
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_slug TEXT;
  v_low_threshold INTEGER;
BEGIN
  SELECT tenant, low_stock_threshold
  INTO v_tenant_slug, v_low_threshold
  FROM menu_items
  WHERE id = NEW.menu_item_id;
  
  -- If stock drops below threshold, create alert
  IF NEW.quantity_after < v_low_threshold AND NEW.quantity_after >= 0 THEN
    INSERT INTO low_stock_alerts (menu_item_id, tenant_slug, current_stock, threshold)
    VALUES (NEW.menu_item_id, v_tenant_slug, NEW.quantity_after, v_low_threshold)
    ON CONFLICT (menu_item_id, is_resolved) WHERE is_resolved = FALSE DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_low_stock_trigger
  AFTER INSERT ON inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION check_low_stock();

-- Trigger to reduce stock when order is placed
CREATE OR REPLACE FUNCTION reduce_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Reduce stock for each item in the order
  PERFORM update_inventory_stock(
    menu_item_id,
    -quantity,
    'sale',
    'order',
    NEW.id,
    'Order #' || (SELECT order_number FROM orders WHERE id = NEW.id)
  )
  FROM order_items
  WHERE order_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reduce_stock_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'pending' OR NEW.status = 'pending_payment')
  EXECUTE FUNCTION reduce_stock_on_order();

-- Trigger to restore stock when order is cancelled
CREATE OR REPLACE FUNCTION restore_stock_on_cancellation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    PERFORM update_inventory_stock(
      oi.menu_item_id,
      oi.quantity,
      'return',
      'order',
      NEW.id,
      'Order cancelled: #' || NEW.order_number
    )
    FROM order_items oi
    WHERE oi.order_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restore_stock_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_cancellation();

-- RLS Policies
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE low_stock_alerts ENABLE ROW LEVEL SECURITY;

-- Anyone can view inventory status (for product pages)
CREATE POLICY "Anyone can view inventory transactions"
  ON inventory_transactions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view low stock alerts"
  ON low_stock_alerts FOR SELECT
  USING (true);

-- Comments
COMMENT ON TABLE inventory_transactions IS 'Audit log for all inventory changes';
COMMENT ON TABLE low_stock_alerts IS 'Automated alerts when stock drops below threshold';
COMMENT ON FUNCTION update_inventory_stock IS 'Central function to update stock and create transaction log';
