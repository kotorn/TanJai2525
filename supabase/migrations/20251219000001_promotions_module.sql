-- ============================================
-- PROMOTIONS MODULE (Medusa-Lite)
-- ============================================

-- 1. Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount')),
    value DECIMAL NOT NULL,
    is_active BOOLEAN DEFAULT true,
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create promotion_rules table
-- Logic: A promotion is valid ONLY if all its rules are satisfied (AND logic)
CREATE TABLE IF NOT EXISTS promotion_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
    attribute TEXT NOT NULL, -- 'cart_total', 'category_id', 'product_id', 'customer_group'
    operator TEXT NOT NULL CHECK (operator IN ('eq', 'gt', 'gte', 'lt', 'lte', 'in')),
    values JSONB NOT NULL, -- e.g. [500] or ["uuid1", "uuid2"]
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add promotion tracking to orders
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'promotion_id') THEN
        ALTER TABLE orders ADD COLUMN promotion_id UUID REFERENCES promotions(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_amount') THEN
        ALTER TABLE orders ADD COLUMN discount_amount DECIMAL DEFAULT 0;
    END IF;
END $$;

-- 4. Initial Seed for Testing
INSERT INTO promotions (code, type, value, usage_limit)
VALUES ('WELCOME10', 'percentage', 10, 100)
ON CONFLICT (code) DO NOTHING;

INSERT INTO promotion_rules (promotion_id, attribute, operator, values)
SELECT id, 'cart_total', 'gte', '[100]'::jsonb
FROM promotions WHERE code = 'WELCOME10'
ON CONFLICT DO NOTHING;
