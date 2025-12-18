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
