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
