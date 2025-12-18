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
