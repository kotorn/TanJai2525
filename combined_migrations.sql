-- Create dynamic_qrs table
create table if not exists public.dynamic_qrs (
  id uuid not null default gen_random_uuid(),
  amount numeric(10,2),
  payload jsonb default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'used', 'expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint dynamic_qrs_pkey primary key (id)
);

-- Enable RLS
alter table public.dynamic_qrs enable row level security;

-- Policies
create policy "Owners can do everything with dynamic_qrs"
  on public.dynamic_qrs for all
  using (auth.role() = 'authenticated');

create policy "Public can read active qrs"
  on public.dynamic_qrs for select
  using (true); -- Public needs to read to validate/pay
-- supabase/migrations/20251218000000_smart_qr_tables.sql

-- 1. Modify 'tables' to help with Static QR (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tables' AND table_schema = 'public') THEN
        EXECUTE 'ALTER TABLE tables ADD COLUMN IF NOT EXISTS qr_code_static_url TEXT';
    END IF;
END $$;

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
-- Shopping Cart Persistence Schema
-- Allows users to save their cart across sessions

-- Cart items table (for authenticated users)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_slug TEXT NOT NULL,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  options JSONB DEFAULT '{}',
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Prevent duplicate items for same user + menu item + options
  UNIQUE(user_id, menu_item_id, options)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_tenant ON cart_items(tenant_slug);
CREATE INDEX IF NOT EXISTS idx_cart_items_expires ON cart_items(expires_at);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cart_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_items_updated_at();

-- RLS Policies
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can only see their own cart
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own cart items
CREATE POLICY "Users can create cart items"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart items
CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own cart items
CREATE POLICY "Users can delete own cart"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- Function to clean up expired carts (run daily via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_carts()
RETURNS void AS $$
BEGIN
  DELETE FROM cart_items WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON TABLE cart_items IS 'Persistent shopping cart storage for authenticated users';
COMMENT ON COLUMN cart_items.expires_at IS 'Cart items expire after 7 days of inactivity';
-- User Profiles and Authentication Enhancement
-- Extends Supabase Auth with additional user data

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  default_address_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved addresses
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- 'Home', 'Work', etc.
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  street TEXT NOT NULL,
  building TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_slug TEXT NOT NULL,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicates
  UNIQUE(user_id, menu_item_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);

-- Auto-update triggers
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

CREATE TRIGGER user_addresses_updated_at
  BEFORE UPDATE ON user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE user_addresses 
    SET is_default = FALSE 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_default_address
  BEFORE INSERT OR UPDATE ON user_addresses
  FOR EACH ROW
  WHEN (NEW.is_default = TRUE)
  EXECUTE FUNCTION ensure_single_default_address();

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- User Profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Addresses
CREATE POLICY "Users can view own addresses"
  ON user_addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON user_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON user_addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON user_addresses FOR DELETE
  USING (auth.uid() = user_id);

-- Wishlist
CREATE POLICY "Users can view own wishlist"
  ON wishlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to wishlist"
  ON wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from wishlist"
  ON wishlists FOR DELETE
  USING (auth.uid() = user_id);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Comments
COMMENT ON TABLE user_profiles IS 'Extended user profile information';
COMMENT ON TABLE user_addresses IS 'Saved shipping addresses for users';
COMMENT ON TABLE wishlists IS 'User wishlist for favorite items';
-- Product Reviews and Ratings System

-- Reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_slug TEXT NOT NULL,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[], -- Array of image URLs
  verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One review per user per product
  UNIQUE(user_id, menu_item_id)
);

-- Review helpfulness tracking
CREATE TABLE IF NOT EXISTS review_helpful (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(review_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_menu_item ON product_reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_review_helpful_review ON review_helpful(review_id);

-- Auto-update trigger
CREATE TRIGGER product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Update helpful count when review_helpful changes
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE product_reviews 
    SET helpful_count = helpful_count + 1 
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE product_reviews 
    SET helpful_count = helpful_count - 1 
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_helpful_count_trigger
  AFTER INSERT OR DELETE ON review_helpful
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- RLS Policies
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
  ON product_reviews FOR SELECT
  USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON product_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON product_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Anyone can see review helpfulness
CREATE POLICY "Anyone can view review helpful"
  ON review_helpful FOR SELECT
  USING (true);

-- Authenticated users can mark reviews as helpful
CREATE POLICY "Users can mark reviews helpful"
  ON review_helpful FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unmark reviews helpful"
  ON review_helpful FOR DELETE
  USING (auth.uid() = user_id);

-- Materialized view for product average ratings (performance optimization)
CREATE MATERIALIZED VIEW IF NOT EXISTS product_ratings AS
SELECT 
  menu_item_id,
  COUNT(*) as review_count,
  AVG(rating)::DECIMAL(3,2) as average_rating,
  COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
  COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
  COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
  COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
  COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
FROM product_reviews
GROUP BY menu_item_id;

CREATE INDEX idx_product_ratings_menu_item ON product_ratings(menu_item_id);

-- Function to refresh ratings view (call after review insert/update/delete)
CREATE OR REPLACE FUNCTION refresh_product_ratings()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY product_ratings;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_product_ratings();

-- Comments
COMMENT ON TABLE product_reviews IS 'Customer reviews and ratings for menu items';
COMMENT ON TABLE review_helpful IS 'Tracks which users found reviews helpful';
COMMENT ON MATERIALIZED VIEW product_ratings IS 'Aggregated product ratings for performance';
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
-- Discount & Promotion System
-- Coupons, bulk discounts, and time-limited promotions

-- Discount type enum
CREATE TYPE discount_type AS ENUM (
  'percentage',
  'fixed_amount',
  'buy_x_get_y',
  'free_shipping'
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  tenant_slug TEXT NOT NULL,
  
  -- Discount details
  discount_type discount_type NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL, -- Percentage (e.g., 20) or fixed amount (e.g., 100)
  
  -- Conditions
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2), -- Cap for percentage discounts
  applicable_categories TEXT[], -- NULL = all categories
  applicable_items UUID[], -- NULL = all items, array of menu_item_ids
  
  -- Usage limits
  usage_limit INTEGER, -- NULL = unlimited
  usage_per_user INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  
  -- Validity period
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Metadata
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupon usage tracking
CREATE TABLE IF NOT EXISTS coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  order_id UUID REFERENCES orders(id),
  
  discount_amount DECIMAL(10, 2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(coupon_id, order_id)
);

-- Bulk discount rules (Buy X Get Y)
CREATE TABLE IF NOT EXISTS bulk_discount_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  
  -- Rule configuration
  buy_quantity INTEGER NOT NULL CHECK (buy_quantity > 0),
  get_quantity INTEGER NOT NULL CHECK (get_quantity > 0),
  discount_percentage DECIMAL(5, 2) DEFAULT 100, -- 100 = free, 50 = 50% off
  
  -- Applicable items
  applicable_items UUID[], -- NULL = all items
  
  -- Validity
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promotion campaigns (time-limited sales)
CREATE TABLE IF NOT EXISTS promotion_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Discount configuration
  discount_type discount_type NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  
  -- Applicable items
  applicable_categories TEXT[],
  applicable_items UUID[],
  
  -- Timing
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_tenant ON coupons(tenant_slug);
CREATE INDEX idx_coupons_active ON coupons(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_coupon_usages_coupon ON coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_user ON coupon_usages(user_id);
CREATE INDEX idx_bulk_discount_rules_tenant ON bulk_discount_rules(tenant_slug);
CREATE INDEX idx_promotion_campaigns_tenant ON promotion_campaigns(tenant_slug);
CREATE INDEX idx_promotion_campaigns_active ON promotion_campaigns(is_active, starts_at, expires_at);

-- Auto-update triggers
CREATE TRIGGER coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

CREATE TRIGGER bulk_discount_rules_updated_at
  BEFORE UPDATE ON bulk_discount_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

CREATE TRIGGER promotion_campaigns_updated_at
  BEFORE UPDATE ON promotion_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION validate_coupon(
  p_code TEXT,
  p_user_id UUID,
  p_order_amount DECIMAL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_amount DECIMAL,
  message TEXT
) AS $$
DECLARE
  v_coupon RECORD;
  v_user_usage_count INTEGER;
  v_discount DECIMAL;
BEGIN
  -- Get coupon
  SELECT * INTO v_coupon
  FROM coupons
  WHERE code = p_code
    AND is_active = TRUE
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (expires_at IS NULL OR expires_at > NOW());
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, 'Invalid or expired coupon code';
    RETURN;
  END IF;
  
  -- Check usage limit
  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, 'Coupon usage limit reached';
    RETURN;
  END IF;
  
  -- Check user usage limit
  SELECT COUNT(*) INTO v_user_usage_count
  FROM coupon_usages
  WHERE coupon_id = v_coupon.id AND user_id = p_user_id;
  
  IF v_user_usage_count >= v_coupon.usage_per_user THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, 'You have already used this coupon';
    RETURN;
  END IF;
  
  -- Check minimum order amount
  IF p_order_amount < v_coupon.min_order_amount THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, 
      FORMAT('Minimum order amount is ฿%s', v_coupon.min_order_amount);
    RETURN;
  END IF;
  
  -- Calculate discount
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount := p_order_amount * (v_coupon.discount_value / 100);
    IF v_coupon.max_discount_amount IS NOT NULL THEN
      v_discount := LEAST(v_discount, v_coupon.max_discount_amount);
    END IF;
  ELSIF v_coupon.discount_type = 'fixed_amount' THEN
    v_discount := v_coupon.discount_value;
  ELSIF v_coupon.discount_type = 'free_shipping' THEN
    v_discount := 0; -- Handled separately in shipping calculation
  END IF;
  
  RETURN QUERY SELECT TRUE, v_discount, 'Coupon applied successfully';
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE id = NEW.coupon_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_coupon_usage_trigger
  AFTER INSERT ON coupon_usages
  FOR EACH ROW
  EXECUTE FUNCTION increment_coupon_usage();

-- RLS Policies
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_discount_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_campaigns ENABLE ROW LEVEL SECURITY;

-- Anyone can view active coupons (for public promotions)
CREATE POLICY "Anyone can view active coupons"
  ON coupons FOR SELECT
  USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

-- Users can view their coupon usage
CREATE POLICY "Users can view own coupon usage"
  ON coupon_usages FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can view active discount rules and promotions
CREATE POLICY "Anyone can view bulk discounts"
  ON bulk_discount_rules FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Anyone can view active promotions"
  ON promotion_campaigns FOR SELECT
  USING (is_active = TRUE AND starts_at <= NOW() AND expires_at > NOW());

-- Comments
COMMENT ON TABLE coupons IS 'Discount coupons with usage limits and validity periods';
COMMENT ON TABLE coupon_usages IS 'Tracking of coupon usage per order';
COMMENT ON TABLE bulk_discount_rules IS 'Buy X Get Y discount rules';
COMMENT ON TABLE promotion_campaigns IS 'Time-limited promotional sales';
COMMENT ON FUNCTION validate_coupon IS 'Validates coupon and calculates discount amount';
-- Multi-Payment Gateway Support
-- PromptPay, Thai QR, LINE Pay, Cash tracking

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Payment details
  payment_method payment_method NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'THB',
  
  -- Payment gateway info
  gateway_transaction_id TEXT, -- External transaction ID from payment provider
  gateway_response JSONB, -- Full response from gateway
  
  -- PromptPay/QR specific
  qr_code_data TEXT, -- QR code string for Thai QR/PromptPay
  qr_code_image_url TEXT, -- Generated QR code image URL
  promptpay_id TEXT, -- Phone number or National ID
  
  -- Status tracking
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed, cancelled, refunded
  error_message TEXT,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 minutes')
);

-- Payment webhooks (for async payment notifications)
CREATE TABLE IF NOT EXISTS payment_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  
  provider TEXT NOT NULL, -- 'promptpay', 'line_pay', etc.
  event_type TEXT NOT NULL, -- 'payment.success', 'payment.failed', etc.
  payload JSONB NOT NULL,
  
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_gateway_id ON payment_transactions(gateway_transaction_id);
CREATE INDEX idx_payment_webhooks_transaction ON payment_webhooks(payment_transaction_id);
CREATE INDEX idx_payment_webhooks_unprocessed ON payment_webhooks(processed) WHERE processed = FALSE;

-- Auto-update trigger
CREATE TRIGGER payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Function to update order payment status
CREATE OR REPLACE FUNCTION update_order_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE orders
    SET 
      payment_status = 'completed',
      paid_at = NOW(),
      status = CASE 
        WHEN status = 'pending_payment' THEN 'pending'::order_status
        ELSE status
      END
    WHERE id = NEW.order_id;
    
    NEW.completed_at := NOW();
  ELSIF NEW.status = 'failed' THEN
    UPDATE orders
    SET payment_status = 'failed'
    WHERE id = NEW.order_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_payment_trigger
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_order_payment_status();

-- Function to generate Thai QR Payment string (for PromptPay)
CREATE OR REPLACE FUNCTION generate_thai_qr_string(
  p_promptpay_id TEXT,
  p_amount DECIMAL
)
RETURNS TEXT AS $$
DECLARE
  v_qr_string TEXT;
BEGIN
  -- This is a simplified version. In production, use proper Thai QR code generation library
  -- Format: https://www.bot.or.th/Thai/PaymentSystems/StandardPS/Documents/ThaiQRCode_Payment_Standard.pdf
  
  v_qr_string := FORMAT(
    '000201010212%s%s0303764540%s5802TH5913TanJai POS6007Bangkok62070503***63',
    -- Merchant Account Information
    LPAD(LENGTH(p_promptpay_id)::TEXT, 2, '0'),
    p_promptpay_id,
    -- Transaction Amount
    LPAD((LENGTH(p_amount::TEXT) + 2)::TEXT, 2, '0') || p_amount::TEXT
  );
  
  RETURN v_qr_string;
END;
$$ LANGUAGE plpgsql;

-- Function to create payment transaction
CREATE OR REPLACE FUNCTION create_payment_transaction(
  p_order_id UUID,
  p_payment_method payment_method,
  p_amount DECIMAL,
  p_promptpay_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_qr_string TEXT;
BEGIN
  -- Generate QR string for Thai QR/PromptPay
  IF p_payment_method IN ('promptpay', 'thai_qr') THEN
    v_qr_string := generate_thai_qr_string(
      COALESCE(p_promptpay_id, '0000000000000'), -- Default merchant ID
      p_amount
    );
  END IF;
  
  -- Create transaction
  INSERT INTO payment_transactions (
    order_id,
    payment_method,
    amount,
    qr_code_data,
    promptpay_id
  ) VALUES (
    p_order_id,
    p_payment_method,
    p_amount,
    v_qr_string,
    p_promptpay_id
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhooks ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment transactions
CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Users can create payment transactions for their orders
CREATE POLICY "Users can create payment transactions"
  ON payment_transactions FOR INSERT
  WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Webhooks are system-managed (no direct user access)
CREATE POLICY "System manages webhooks"
  ON payment_webhooks FOR ALL
  USING (FALSE);

-- Comments
COMMENT ON TABLE payment_transactions IS 'Payment gateway transactions with QR code support';
COMMENT ON TABLE payment_webhooks IS 'Async payment notification webhooks';
COMMENT ON FUNCTION generate_thai_qr_string IS 'Generates Thai QR payment string for PromptPay';
COMMENT ON FUNCTION create_payment_transaction IS 'Creates payment transaction and generates QR code';
-- Product Recommendations System
-- "You may also like", "Frequently bought together", "Recently viewed"

-- Product views tracking (for "Recently viewed")
CREATE TABLE IF NOT EXISTS product_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  tenant_slug TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index for tracking views per day (replaces the invalid UNIQUE constraint)
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_views_user_item_date 
  ON product_views (user_id, menu_item_id, DATE(viewed_at));

-- Product recommendations (pre-computed)
CREATE TABLE IF NOT EXISTS product_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  recommended_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  
  recommendation_type TEXT NOT NULL, -- 'similar', 'frequently_bought', 'popular'
  score DECIMAL(5, 2) DEFAULT 0, -- Recommendation strength 0-100
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(menu_item_id, recommended_item_id, recommendation_type)
);

-- Frequently bought together (from order data)
CREATE TABLE IF NOT EXISTS product_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_a UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  item_b UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  
  times_bought_together INTEGER DEFAULT 1,
  last_bought_together TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(item_a, item_b)
);

-- Indexes
CREATE INDEX idx_product_views_user ON product_views(user_id);
CREATE INDEX idx_product_views_item ON product_views(menu_item_id);
CREATE INDEX idx_product_views_date ON product_views(viewed_at DESC);
CREATE INDEX idx_product_recommendations_item ON product_recommendations(menu_item_id);
CREATE INDEX idx_product_recommendations_score ON product_recommendations(score DESC);
CREATE INDEX idx_product_pairs_item_a ON product_pairs(item_a);

-- Track product view
CREATE OR REPLACE FUNCTION track_product_view(
  p_user_id UUID,
  p_menu_item_id UUID,
  p_tenant_slug TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO product_views (user_id, menu_item_id, tenant_slug)
  VALUES (p_user_id, p_menu_item_id, p_tenant_slug)
  ON CONFLICT (user_id, menu_item_id, DATE(viewed_at))
  DO UPDATE SET viewed_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Generate "Frequently Bought Together" from orders
CREATE OR REPLACE FUNCTION generate_product_pairs()
RETURNS VOID AS $$
BEGIN
  -- Clear old pairs
  TRUNCATE product_pairs;
  
  -- Find items bought together
  INSERT INTO product_pairs (item_a, item_b, times_bought_together)
  SELECT 
    oi1.menu_item_id as item_a,
    oi2.menu_item_id as item_b,
    COUNT(*) as times_bought_together
  FROM order_items oi1
  JOIN order_items oi2 ON oi1.order_id = oi2.order_id 
    AND oi1.menu_item_id < oi2.menu_item_id
  GROUP BY oi1.menu_item_id, oi2.menu_item_id
  HAVING COUNT(*) >= 3; -- At least bought together 3 times
END;
$$ LANGUAGE plpgsql;

-- Get recommendations for a product
CREATE OR REPLACE FUNCTION get_product_recommendations(
  p_menu_item_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  item_id UUID,
  item_name TEXT,
  item_price DECIMAL,
  recommendation_type TEXT,
  score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mi.id,
    mi.name,
    mi.price,
    pr.recommendation_type,
    pr.score
  FROM product_recommendations pr
  JOIN menu_items mi ON mi.id = pr.recommended_item_id
  WHERE pr.menu_item_id = p_menu_item_id
  ORDER BY pr.score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get "Frequently Bought Together"
CREATE OR REPLACE FUNCTION get_frequently_bought_together(
  p_menu_item_id UUID,
  p_limit INTEGER DEFAULT 3
)
RETURNS TABLE (
  item_id UUID,
  item_name TEXT,
  item_price DECIMAL,
  times_bought INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mi.id,
    mi.name,
    mi.price,
    pp.times_bought_together
  FROM product_pairs pp
  JOIN menu_items mi ON (mi.id = pp.item_b)
  WHERE pp.item_a = p_menu_item_id
  UNION
  SELECT 
    mi.id,
    mi.name,
    mi.price,
    pp.times_bought_together
  FROM product_pairs pp
  JOIN menu_items mi ON (mi.id = pp.item_a)
  WHERE pp.item_b = p_menu_item_id
  ORDER BY times_bought_together DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_pairs ENABLE ROW LEVEL SECURITY;

-- Users can view their own product views
CREATE POLICY "Users can view own product views"
  ON product_views FOR ALL
  USING (auth.uid() = user_id);

-- Anyone can view recommendations (public data)
CREATE POLICY "Anyone can view recommendations"
  ON product_recommendations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view product pairs"
  ON product_pairs FOR SELECT
  USING (true);

-- Comments
COMMENT ON TABLE product_views IS 'Track user product views for "Recently viewed"';
COMMENT ON TABLE product_recommendations IS 'Pre-computed product recommendations';
COMMENT ON TABLE product_pairs IS 'Products frequently bought together';
-- Newsletter & Email Marketing System

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_slug TEXT NOT NULL,
  
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  
  -- Preferences
  preferences JSONB DEFAULT '{"frequency": "weekly", "categories": []}',
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verified_at TIMESTAMPTZ
);

-- Email campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_slug TEXT NOT NULL,
  
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  
  campaign_type TEXT NOT NULL, -- 'newsletter', 'promotional', 'transactional'
  
  -- Scheduling
  status TEXT DEFAULT 'draft', -- draft, scheduled, sending, sent, cancelled
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  -- Stats
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email campaign sends (tracking)
CREATE TABLE IF NOT EXISTS email_campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Tracking
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0
);

-- Automated email triggers
CREATE TABLE IF NOT EXISTS email_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_slug TEXT NOT NULL,
  
  trigger_type TEXT NOT NULL, -- 'abandoned_cart', 'order_confirmation', 'new_product'
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Email template
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Timing
  delay_minutes INTEGER DEFAULT 0, -- Send after X minutes
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_tenant ON newsletter_subscribers(tenant_slug);
CREATE INDEX idx_newsletter_subscribers_active ON newsletter_subscribers(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_email_campaigns_tenant ON email_campaigns(tenant_slug);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaign_sends_campaign ON email_campaign_sends(campaign_id);

-- Auto-update triggers
CREATE TRIGGER email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Update campaign stats when email is opened/clicked
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.opened_at IS NOT NULL AND OLD.opened_at IS NULL THEN
    UPDATE email_campaigns
    SET total_opened = total_opened + 1
    WHERE id = NEW.campaign_id;
  END IF;
  
  IF NEW.clicked_at IS NOT NULL AND OLD.clicked_at IS NULL THEN
    UPDATE email_campaigns
    SET total_clicked = total_clicked + 1
    WHERE id = NEW.campaign_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaign_stats_trigger
  AFTER UPDATE ON email_campaign_sends
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_stats();

-- RLS Policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_triggers ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscription
CREATE POLICY "Users can manage own subscription"
  ON newsletter_subscribers FOR ALL
  USING (auth.uid() = user_id OR email = auth.jwt()->>'email');

-- Public can subscribe (for guest signups)
CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Campaign sends are tracked by system
CREATE POLICY "System manages campaign sends"
  ON email_campaign_sends FOR ALL
  USING (FALSE);

-- Comments
COMMENT ON TABLE newsletter_subscribers IS 'Email newsletter subscribers';
COMMENT ON TABLE email_campaigns IS 'Marketing email campaigns';
COMMENT ON TABLE email_campaign_sends IS 'Individual email send tracking';
COMMENT ON TABLE email_triggers IS 'Automated email triggers';
-- Analytics & Customer Insights

-- Customer analytics view
CREATE MATERIALIZED VIEW IF NOT EXISTS customer_analytics AS
SELECT 
  u.id as user_id,
  u.email,
  up.display_name,
  
  -- Order stats
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.total_amount) as lifetime_value,
  AVG(o.total_amount) as average_order_value,
  MAX(o.created_at) as last_order_date,
  MIN(o.created_at) as first_order_date,
  
  -- Behavioral
  (SELECT COUNT(*) FROM product_reviews WHERE user_id = u.id) as total_reviews,
  (SELECT COUNT(*) FROM wishlists WHERE user_id = u.id) as wishlist_items,
  
  -- Engagement score (0-100)
  LEAST(100, (
    (COUNT(DISTINCT o.id) * 10) + -- 10 points per order
    ((SELECT COUNT(*) FROM product_reviews WHERE user_id = u.id) * 5) + -- 5 points per review
    ((SELECT COUNT(*) FROM wishlists WHERE user_id = u.id) * 2) -- 2 points per wishlist item
  )) as engagement_score,
  
  -- Classification
  CASE
    WHEN COUNT(DISTINCT o.id) >= 10 THEN 'VIP'
    WHEN COUNT(DISTINCT o.id) >= 5 THEN 'Regular'
    WHEN COUNT(DISTINCT o.id) >= 1 THEN 'New'
    ELSE 'Prospect'
  END as customer_tier

FROM auth.users u
LEFT JOIN user_profiles up ON up.user_id = u.id
LEFT JOIN orders o ON o.user_id = u.id AND o.status IN ('delivered', 'shipped')
GROUP BY u.id, u.email, up.display_name;

-- Product analytics view
CREATE MATERIALIZED VIEW IF NOT EXISTS product_analytics AS
SELECT 
  mi.id as menu_item_id,
  mi.name,
  mi.price,
  mi.tenant,
  
  -- Sales stats
  COUNT(DISTINCT oi.order_id) as times_ordered,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.subtotal) as total_revenue,
  
  -- Reviews
  COALESCE(pr.review_count, 0) as review_count,
  COALESCE(pr.average_rating, 0) as average_rating,
  
  -- Views
  (SELECT COUNT(*) FROM product_views WHERE menu_item_id = mi.id) as view_count,
  
  -- Conversion rate
  CASE 
    WHEN (SELECT COUNT(*) FROM product_views WHERE menu_item_id = mi.id) > 0
    THEN (COUNT(DISTINCT oi.order_id)::DECIMAL / (SELECT COUNT(*) FROM product_views WHERE menu_item_id = mi.id)) * 100
    ELSE 0
  END as conversion_rate,
  
  -- Popularity score
  (
    (COUNT(DISTINCT oi.order_id) * 10) +
    (COALESCE(pr.average_rating, 0) * 5) +
    ((SELECT COUNT(*) FROM product_views WHERE menu_item_id = mi.id) * 0.1)
  ) as popularity_score

FROM menu_items mi
LEFT JOIN order_items oi ON oi.menu_item_id = mi.id
LEFT JOIN product_ratings pr ON pr.menu_item_id = mi.id
GROUP BY mi.id, mi.name, mi.price, mi.tenant, pr.review_count, pr.average_rating;

-- Daily sales summary
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_sales_summary AS
SELECT 
  tenant_slug,
  DATE(created_at) as sale_date,
  
  COUNT(DISTINCT id) as total_orders,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as average_order_value,
  
  COUNT(DISTINCT user_id) as unique_customers,
  
  -- By status
  COUNT(*) FILTER (WHERE status = 'delivered') as completed_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
  
  -- Payment methods
  COUNT(*) FILTER (WHERE payment_method = 'promptpay') as promptpay_orders,
  COUNT(*) FILTER (WHERE payment_method = 'line_pay') as line_pay_orders,
  COUNT(*) FILTER (WHERE payment_method = 'cash') as cash_orders

FROM orders
GROUP BY tenant_slug, DATE(created_at);

-- Indexes on materialized views
CREATE INDEX idx_customer_analytics_tier ON customer_analytics(customer_tier);
CREATE INDEX idx_customer_analytics_ltv ON customer_analytics(lifetime_value DESC);
CREATE INDEX idx_product_analytics_popularity ON product_analytics(popularity_score DESC);
CREATE INDEX idx_daily_sales_date ON daily_sales_summary(sale_date DESC);

-- Function to refresh all analytics
CREATE OR REPLACE FUNCTION refresh_analytics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY customer_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY product_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales_summary;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON MATERIALIZED VIEW customer_analytics IS 'Customer lifetime value and engagement metrics';
COMMENT ON MATERIALIZED VIEW product_analytics IS 'Product performance and popularity metrics';
COMMENT ON MATERIALIZED VIEW daily_sales_summary IS 'Daily sales aggregation for reporting';
-- supabase/migrations/20251218020000_add_tax_fields.sql

-- Add Japan Tax fields to menu_items
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(4, 2) DEFAULT 0.08, -- 8% by default (Food)
ADD COLUMN IF NOT EXISTS is_alcohol BOOLEAN DEFAULT FALSE;

-- Add constraint to ensure tax_rate is valid (optional but good for data integrity)
-- Common rates: 0.00 (Exempt), 0.08 (Reduced), 0.10 (Standard)
ALTER TABLE public.menu_items
ADD CONSTRAINT valid_tax_rate CHECK (tax_rate IN (0.00, 0.08, 0.10));

-- Comment for documentation
COMMENT ON COLUMN public.menu_items.tax_rate IS 'Japan Consumption Tax Rate: 0.08 (Reduced/Food) or 0.10 (Standard/Alcohol/Dine-in)';
COMMENT ON COLUMN public.menu_items.is_alcohol IS 'Flag to identify alcohol items which strictly strictly require 10% tax';
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
-- 1. Ensure the 'tanjai' tenant exists
INSERT INTO "public"."tenants" ("id", "name", "slug", "created_at")
VALUES 
('c0a80101-0000-0000-0000-000000000000', 'Tanjai Ramen & Congee', 'tanjai', now())
ON CONFLICT ("slug") DO UPDATE SET name = EXCLUDED.name, id = EXCLUDED.id;

-- 2. Seed Categories
INSERT INTO "public"."menu_categories" ("id", "tenant_id", "name", "sort_order")
VALUES
('20000000-0000-0000-0000-000000000001', 'c0a80101-0000-0000-0000-000000000000', 'Ramen', 1),
('20000000-0000-0000-0000-000000000002', 'c0a80101-0000-0000-0000-000000000000', 'Congee', 2),
('20000000-0000-0000-0000-000000000003', 'c0a80101-0000-0000-0000-000000000000', 'Beverages', 3)
ON CONFLICT ("id") DO NOTHING;

-- 3. Seed Menu Items (Ramen)
INSERT INTO "public"."menu_items" ("tenant_id", "category_id", "name", "price", "is_available", "description", "image_url")
VALUES
('c0a80101-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', 'Tonkotsu Ramen', 189.00, true, 'Creamy pork bone broth with chashu pork and soft-boiled egg.', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=400&auto=format&fit=crop'),
('c0a80101-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', 'Miso Ramen', 169.00, true, 'Rich miso-based broth with sweet corn, bamboo shoots, and green onions.', 'https://images.unsplash.com/photo-1591814448473-7027b515b41e?q=80&w=400&auto=format&fit=crop'),
('c0a80101-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Shoyu Ramen', 159.00, true, 'Clear soy sauce broth with nori, fish cake, and sliced pork.', 'https://images.unsplash.com/photo-1557872240-50d2bb80c97a?q=80&w=400&auto=format&fit=crop');

-- 4. Seed Menu Items (Congee)
INSERT INTO "public"."menu_items" ("tenant_id", "category_id", "name", "price", "is_available", "description")
VALUES
('c0a80101-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'Pork Congee', 65.00, true, 'Traditional rice porridge with minced pork and soft-boiled egg.'),
('c0a80101-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'Fish Congee', 85.00, true, 'Fresh fish slices in silky smooth rice porridge with ginger and onions.');

-- 5. Seed Menu Items (Beverages)
INSERT INTO "public"."menu_items" ("tenant_id", "category_id", "name", "price", "is_available", "description")
VALUES
('c0a80101-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000003', 'Iced Green Tea', 35.00, true, 'Authentic Japanese green tea, unsweetened.'),
('c0a80101-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000003', 'Chrysanthemum Tea', 30.00, true, 'Lightly sweetened herbal tea with cooling properties.');
