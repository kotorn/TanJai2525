-- Seed Test Tenant
INSERT INTO "public"."tenants" ("id", "name", "slug", "created_at")
VALUES 
('11111111-1111-1111-1111-111111111111', 'Test Kitchen', 'test-kitchen', now())
ON CONFLICT ("id") DO NOTHING;

-- Seed Menu Category
INSERT INTO "public"."menu_categories" ("id", "tenant_id", "name", "sort_order")
VALUES
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Chaos Specials', 1)
ON CONFLICT ("id") DO NOTHING;

-- Seed Menu Item
INSERT INTO "public"."menu_items" ("id", "tenant_id", "category_id", "name", "price", "is_available", "description")
VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Spicy Bug', 99.00, true, 'Contains randomness')
ON CONFLICT ("id") DO NOTHING;
