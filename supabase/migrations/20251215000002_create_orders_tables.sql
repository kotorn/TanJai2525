-- supabase/migrations/20251215000002_create_orders_tables.sql

/**
 * NOTE (TH): สร้างตารางสำหรับระบบ Order
 * - orders: ข้อมูล order หลัก
 * - order_items: รายการอาหารในแต่ละ order
 * - payments: ข้อมูลการชำระเงิน
 */

-- สร้างตาราง orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  table_id UUID REFERENCES tables(id),
  table_number VARCHAR(50),
  
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  
  subtotal DECIMAL(10, 2) NOT NULL,
  service_charge DECIMAL(10, 2) DEFAULT 0.00,
  discount DECIMAL(10, 2) DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  payment_verified_at TIMESTAMP WITH TIME ZONE,
  
  special_instructions TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_order_status 
    CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  CONSTRAINT valid_payment_method
    CHECK (payment_method IN ('cash', 'transfer', 'card')),
  CONSTRAINT valid_payment_status
    CHECK (payment_status IN ('unpaid', 'pending', 'verified', 'failed'))
);

-- สร้างตาราง order_items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES menu_items(id),
  
  name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  
  modifiers JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  
  station_id VARCHAR(50),
  item_status VARCHAR(50) DEFAULT 'pending',
  
  line_total DECIMAL(10, 2) NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_item_status
    CHECK (item_status IN ('pending', 'preparing', 'ready', 'cancelled'))
);

-- สร้างตาราง payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  
  amount DECIMAL(10, 2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  
  slip_image_url TEXT,
  qr_payload TEXT,
  
  verified_by_provider VARCHAR(50),
  verification_data JSONB,
  
  status VARCHAR(50) DEFAULT 'pending',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_payment_status
    CHECK (status IN ('pending', 'verified', 'failed', 'manual_review'))
);

-- สร้าง indexes
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_station ON order_items(station_id);
CREATE INDEX idx_payments_order ON payments(order_id);

-- สร้าง function auto-generate order_number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  today TEXT;
  seq INT;
BEGIN
  today := TO_CHAR(NOW(), 'YYYYMMDD');
  
  SELECT COUNT(*) + 1 INTO seq
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE
    AND restaurant_id = NEW.restaurant_id;
  
  NEW.order_number := 'TJ-' || today || '-' || LPAD(seq::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- RLS Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies (เห็นได้เฉพาะคนในร้านเดียวกัน)
CREATE POLICY "Staff can view their restaurant orders"
  ON orders FOR SELECT
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Staff can insert orders"
  ON orders FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles WHERE id = auth.uid()
    )
  );
