-- supabase/migrations/20251215000003_create_tables_and_options.sql

/**
 * NOTE (TH): สร้างตารางสำหรับระบบ Tables และ Option Groups (ตัวเลือกเสริม)
 * - tables: ข้อมูลโต๊ะ
 * - option_groups: กลุ่มตัวเลือก (เช่น ระดับความเผ็ด)
 * - options: ตัวเลือกย่อย (เช่น เผ็ดน้อย, เผ็ดมาก)
 * - menu_item_options: ความสัมพันธ์ระหว่างเมนูและตัวเลือก
 */

-- 1. Create Tables table
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  name VARCHAR(50) NOT NULL,
  qrcode_data TEXT, -- URL or Payload for QR
  status VARCHAR(50) DEFAULT 'available', -- available, occupied, reserved
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_table_status 
    CHECK (status IN ('available', 'occupied', 'reserved'))
);

CREATE INDEX idx_tables_restaurant ON tables(restaurant_id);
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view their restaurant tables"
  ON tables FOR SELECT
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage tables"
  ON tables FOR ALL
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 2. Create Option Groups table
CREATE TABLE IF NOT EXISTS option_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  name VARCHAR(100) NOT NULL, -- e.g. "Spiciness", "Toppings"
  is_required BOOLEAN DEFAULT FALSE,
  selection_type VARCHAR(50) DEFAULT 'single', -- single, multiple
  min_selection INTEGER DEFAULT 0,
  max_selection INTEGER, -- NULL = unlimited if multiple
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_selection_type
    CHECK (selection_type IN ('single', 'multiple'))
);

CREATE INDEX idx_option_groups_restaurant ON option_groups(restaurant_id);
ALTER TABLE option_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view option groups"
  ON option_groups FOR SELECT
  USING ( true ); -- Public read for menu (allows customers)

CREATE POLICY "Staff can manage option groups"
  ON option_groups FOR ALL
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 3. Create Options table
CREATE TABLE IF NOT EXISTS options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES option_groups(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0.00,
  is_available BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_options_group ON options(group_id);
ALTER TABLE options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view options"
  ON options FOR SELECT
  USING ( true );

CREATE POLICY "Staff can manage options"
  ON options FOR ALL
  USING (
    group_id IN (
        SELECT id FROM option_groups WHERE restaurant_id IN (
            SELECT restaurant_id FROM profiles WHERE id = auth.uid()
        )
    )
  );

-- 4. Create Menu Item Options (Junction)
-- Linking a Menu Item to an Option Group
CREATE TABLE IF NOT EXISTS menu_item_options (
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE NOT NULL,
  option_group_id UUID REFERENCES option_groups(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  
  PRIMARY KEY (menu_item_id, option_group_id)
);

ALTER TABLE menu_item_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view menu item options"
  ON menu_item_options FOR SELECT
  USING ( true );

CREATE POLICY "Staff manage menu item options"
  ON menu_item_options FOR ALL
  USING (
    menu_item_id IN (
        SELECT id FROM menu_items WHERE restaurant_id IN (
            SELECT restaurant_id FROM profiles WHERE id = auth.uid()
        )
    )
  );
