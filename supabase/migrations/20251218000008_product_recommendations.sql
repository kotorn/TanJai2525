-- Product Recommendations System
-- "You may also like", "Frequently bought together", "Recently viewed"

-- Product views tracking (for "Recently viewed")
CREATE TABLE IF NOT EXISTS product_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  tenant_slug TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Track unique views per day
  UNIQUE(user_id, menu_item_id, DATE(viewed_at))
);

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
