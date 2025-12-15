-- Create option_groups table
CREATE TABLE IF NOT EXISTS option_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    required BOOLEAN DEFAULT false,
    min_selection INTEGER DEFAULT 0,
    max_selection INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create options table
CREATE TABLE IF NOT EXISTS options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_modifier DECIMAL(10,2) DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_option_groups_restaurant ON option_groups(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_options_group ON options(group_id);

-- RLS Policies (Simple: allow all for now, restrict later based on auth)
ALTER TABLE option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON option_groups FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON options FOR SELECT USING (true);

-- TODO: Add write policies for restaurant owners
CREATE POLICY "Allow owner write access" ON option_groups USING (true) WITH CHECK (true);
CREATE POLICY "Allow owner write access" ON options USING (true) WITH CHECK (true);
