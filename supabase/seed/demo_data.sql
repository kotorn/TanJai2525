-- Demo Data Seed for TanJai POS
-- Comprehensive realistic data for testing all features

BEGIN;

-- 1. Create Demo Tenant
INSERT INTO tenants (slug, name, settings) VALUES 
('tanjai', 'TanJai Restaurant', '{"currency": "THB", "timezone": "Asia/Bangkok"}')
ON CONFLICT (slug) DO NOTHING;

-- 2. Menu Items (with inventory tracking)
INSERT INTO menu_items (tenant, name, description, price, category, stock_quantity, low_stock_threshold, track_inventory) VALUES
-- Ramen
('tanjai', 'Tonkotsu Ramen', 'Rich pork bone broth with tender chashu', 280, 'Ramen', 50, 10, true),
('tanjai', 'Miso Ramen', 'Savory miso-based broth with seasonal vegetables', 260, 'Ramen', 45, 10, true),
('tanjai', 'Shoyu Ramen', 'Classic soy sauce broth with bamboo shoots', 250, 'Ramen', 40, 10, true),
('tanjai', 'Spicy Tantanmen', 'Fiery Sichuan-style ramen with ground pork', 290, 'Ramen', 30, 10, true),

-- Appetizers
('tanjai', 'Gyoza (6pcs)', 'Pan-fried pork dumplings', 120, 'Appetizers', 100, 20, true),
('tanjai', 'Edamame', 'Steamed soybeans with sea salt', 80, 'Appetizers', 80, 15, true),
('tanjai', 'Takoyaki (6pcs)', 'Octopus balls with bonito flakes', 150, 'Appetizers', 60, 15, true),
('tanjai', 'Karaage', 'Japanese fried chicken', 140, 'Appetizers', 50, 10, true),

-- Sides
('tanjai', 'Extra Chashu (3pcs)', 'Additional braised pork belly slices', 80, 'Sides', 120, 20, true),
('tanjai', 'Ajitama (Soft-boiled Egg)', 'Marinated ramen egg', 40, 'Sides', 150, 30, true),
('tanjai', 'Nori Seaweed (5 sheets)', 'Dried seaweed sheets', 30, 'Sides', 200, 40, true),

-- Beverages
('tanjai', 'Green Tea (Hot)', 'Traditional Japanese green tea', 50, 'Beverages', 0, 0, false),
('tanjai', 'Iced Oolong Tea', 'Refreshing oolong tea', 60, 'Beverages', 0, 0, false),
('tanjai', 'Ramune Soda', 'Japanese marble soda (assorted flavors)', 70, 'Beverages', 80, 20, true),
('tanjai', 'Calpico', 'Sweet fermented milk drink', 65, 'Beverages', 60, 15, true)

ON CONFLICT DO NOTHING;

-- 3. Demo Users (for testing - passwords would be hashed in reality)
-- Note: These will be created via Supabase Auth, this is just metadata

-- 4. Coupons
INSERT INTO coupons (code, tenant_slug, discount_type, discount_value, min_order_amount, usage_limit, usage_per_user, starts_at, expires_at, description, is_active) VALUES
-- Active Coupons
('WELCOME10', 'tanjai', 'percentage', 10, 0, NULL, 1, NOW(), NOW() + INTERVAL '30 days', 'Welcome discount for new customers', true),
('RAMEN50', 'tanjai', 'fixed_amount', 50, 500, 100, 2, NOW(), NOW() + INTERVAL '7 days', 'Flash sale: 50 baht off orders over 500', true),
('FREESHIP', 'tanjai', 'free_shipping', 0, 300, NULL, 3, NOW(), NOW() + INTERVAL '14 days', 'Free shipping on orders over 300 baht', true),
('VIP20', 'tanjai', 'percentage', 20, 1000, 50, 1, NOW(), NOW() + INTERVAL '60 days', 'VIP exclusive: 20% off', true),

-- Upcoming Coupon
('NEWYEAR25', 'tanjai', 'percentage', 25, 0, 200, 1, NOW() + INTERVAL '7 days', NOW() + INTERVAL '37 days', 'New Year Special', true)

ON CONFLICT DO NOTHING;

-- 5. Bulk Discount Rules (Buy X Get Y)
INSERT INTO bulk_discount_rules (tenant_slug, name, buy_quantity, get_quantity, discount_percentage, is_active, starts_at, expires_at) VALUES
('tanjai', 'Buy 2 Ramen Get 1 Free Gyoza', 2, 1, 100, true, NOW(), NOW() + INTERVAL '30 days'),
('tanjai', 'Buy 3+ Appetizers Get 20% Off', 3, 3, 20, true, NOW(), NOW() + INTERVAL '60 days')

ON CONFLICT DO NOTHING;

-- 6. Promotion Campaigns
INSERT INTO promotion_campaigns (tenant_slug, name, description, discount_type, discount_value, starts_at, expires_at, is_active) VALUES
('tanjai', 'Weekend Special', 'All ramen 15% off on weekends', 'percentage', 15, NOW(), NOW() + INTERVAL '90 days', true),
('tanjai', 'Happy Hour', 'Beverages 30 baht off 3-5pm', 'fixed_amount', 30, NOW(), NOW() + INTERVAL '30 days', true)

ON CONFLICT DO NOTHING;

-- 7. Product Reviews (for top items)
-- Note: These would normally reference real user_ids from auth.users
-- You'll need to create actual users first, then update these with real UUIDs

-- 8. Product Recommendations (pre-computed)
WITH ramen_items AS (
  SELECT id FROM menu_items WHERE category = 'Ramen' AND tenant = 'tanjai' LIMIT 4
),
gyoza AS (
  SELECT id FROM menu_items WHERE name = 'Gyoza (6pcs)' AND tenant = 'tanjai'
),
edamame AS (
  SELECT id FROM menu_items WHERE name = 'Edamame' AND tenant = 'tanjai'
),
chashu AS (
  SELECT id FROM menu_items WHERE name LIKE '%Chashu%' AND tenant = 'tanjai'
)
INSERT INTO product_recommendations (menu_item_id, recommended_item_id, recommendation_type, score)
SELECT r.id, g.id, 'frequently_bought', 85.0
FROM ramen_items r, gyoza g
UNION ALL
SELECT r.id, e.id, 'frequently_bought', 75.0
FROM ramen_items r, edamame e
UNION ALL
SELECT r.id, c.id, 'similar', 90.0
FROM ramen_items r, chashu c
ON CONFLICT DO NOTHING;

-- 9. Newsletter Subscribers (demo emails)
INSERT INTO newsletter_subscribers (email, tenant_slug, is_active, is_verified) VALUES
('demo1@tanjai.com', 'tanjai', true, true),
('demo2@tanjai.com', 'tanjai', true, true),
('demo3@tanjai.com', 'tanjai', true, false)

ON CONFLICT DO NOTHING;

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Demo data seeded successfully!';
  RAISE NOTICE '📊 Created:';
  RAISE NOTICE '  - 15 menu items (Ramen, Appetizers, Sides, Beverages)';
  RAISE NOTICE '  - 5 coupons (4 active, 1 upcoming)';
  RAISE NOTICE '  - 2 bulk discount rules';
  RAISE NOTICE '  - 2 promotion campaigns';
  RAISE NOTICE '  - Product recommendations';
  RAISE NOTICE '  - 3 newsletter subscribers';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '  1. Create test users via Supabase Auth';
  RAISE NOTICE '  2. Place test orders to generate analytics';
  RAISE NOTICE '  3. Submit reviews (will auto-verify after delivery)';
  RAISE NOTICE '  4. Run: SELECT * FROM menu_items;';
END $$;
