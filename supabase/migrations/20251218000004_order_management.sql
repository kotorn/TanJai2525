-- Order Management System
-- Comprehensive order tracking from creation to delivery

-- Order status enum
CREATE TYPE order_status AS ENUM (
  'pending_payment',
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

-- Payment method enum
CREATE TYPE payment_method AS ENUM (
  'cash',
  'line_pay',
  'promptpay',
  'thai_qr',
  'credit_card'
);

-- Main orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- Human-readable order number (e.g., ORD-20231218-0001)
  user_id UUID REFERENCES auth.users(id),
  tenant_slug TEXT NOT NULL,
  
  -- Order details
  status order_status DEFAULT 'pending_payment',
  payment_method payment_method,
  payment_status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  
  -- Amounts
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_fee DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Shipping info
  shipping_address JSONB NOT NULL, -- {recipient_name, phone, address, city, postal_code}
  tracking_number TEXT,
  
  -- Metadata
  notes TEXT,
  cancellation_reason TEXT,
  refund_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Order items (products in each order)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  
  -- Snapshot of product at time of order (in case product changes)
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  options JSONB DEFAULT '{}',
  
  -- Subtotal for this line item
  subtotal DECIMAL(10, 2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order status history (audit trail)
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status order_status NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refund requests
CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  reason TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, completed
  
  admin_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_tenant ON orders(tenant_slug);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item ON order_items(menu_item_id);
CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX idx_refund_requests_order ON refund_requests(order_id);

-- Auto-update triggers
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

CREATE TRIGGER refund_requests_updated_at
  BEFORE UPDATE ON refund_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  date_part TEXT;
  sequence_part INTEGER;
  order_number TEXT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  
  -- Get today's order count
  SELECT COUNT(*) + 1 INTO sequence_part
  FROM orders
  WHERE order_number LIKE 'ORD-' || date_part || '-%';
  
  order_number := 'ORD-' || date_part || '-' || LPAD(sequence_part::TEXT, 4, '0');
  RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Trigger to log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
    
    -- Update timestamps based on status
    IF NEW.status = 'shipped' THEN
      NEW.shipped_at := NOW();
    ELSIF NEW.status = 'delivered' THEN
      NEW.delivered_at := NOW();
    ELSIF NEW.status = 'cancelled' THEN
      NEW.cancelled_at := NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_order_status_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Mark review as verified purchase when order is delivered
CREATE OR REPLACE FUNCTION mark_verified_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE product_reviews
    SET verified_purchase = TRUE
    WHERE user_id = NEW.user_id
      AND menu_item_id IN (
        SELECT menu_item_id FROM order_items WHERE order_id = NEW.id
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mark_verified_purchase_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION mark_verified_purchase();

-- RLS Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their order items
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Users can view their order history
CREATE POLICY "Users can view own order history"
  ON order_status_history FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Users can create refund requests
CREATE POLICY "Users can create refund requests"
  ON refund_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own refund requests"
  ON refund_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE orders IS 'Main orders table with status tracking';
COMMENT ON TABLE order_items IS 'Line items for each order';
COMMENT ON TABLE order_status_history IS 'Audit trail for order status changes';
COMMENT ON TABLE refund_requests IS 'Customer refund requests';
