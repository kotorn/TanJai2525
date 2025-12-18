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
