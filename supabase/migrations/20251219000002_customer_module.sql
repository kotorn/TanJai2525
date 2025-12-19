-- ============================================
-- CUSTOMER MODULE (Medusa-Lite)
-- ============================================

-- 1. Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE, -- Email is unique identifier for guest retention
    phone TEXT,
    first_name TEXT,
    last_name TEXT,
    user_id UUID REFERENCES auth.users(id), -- Nullable: Guest vs Registered
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by email or user_id
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- 2. Link Orders to Customers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_id') THEN
        ALTER TABLE orders ADD COLUMN customer_id UUID REFERENCES customers(id);
    END IF;
END $$;

-- 3. RLS Policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Admins/Service Role can do anything
-- Users can see their own customer record
CREATE POLICY "Users can view own customer record"
  ON customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own customer record"
  ON customers FOR UPDATE
  USING (auth.uid() = user_id);
