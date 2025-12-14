-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user belongs to restaurant
CREATE OR REPLACE FUNCTION is_restaurant_member(restaurant_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND restaurant_id = restaurant_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Restaurants Policies
-- Anyone can read restaurant info (needed for login/menu page)
CREATE POLICY "Public restaurants are viewable by everyone" 
ON restaurants FOR SELECT 
USING (true);

-- Only owners/admins can update
-- (Simplification: assuming `service_role` or specific admin flag in future)

-- 2. Profiles Policies
-- Users can view/update their own profile
CREATE POLICY "Users can see and update their own profile" 
ON profiles FOR ALL 
USING (auth.uid() = id);

-- 3. Categories/Products (Menu)
-- Public read access for menus
CREATE POLICY "Public menu view" 
ON categories FOR SELECT USING (true);
CREATE POLICY "Public products view" 
ON products FOR SELECT USING (true);

-- Staff can update menu (using helper)
CREATE POLICY "Staff can update categories" 
ON categories FOR ALL 
USING (is_restaurant_member(restaurant_id));

CREATE POLICY "Staff can update products" 
ON products FOR ALL 
USING (is_restaurant_member(restaurant_id));

-- 4. Orders
-- Staff and Kitchen can view orders for their restaurant
CREATE POLICY "Staff/Kitchen view orders" 
ON orders FOR ALL 
USING (is_restaurant_member(restaurant_id));

-- 5. Order Items
CREATE POLICY "Staff/Kitchen view order items" 
ON order_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND is_restaurant_member(orders.restaurant_id)
  )
);

-- 6. Payments
CREATE POLICY "Staff view payments" 
ON payments FOR ALL 
USING (is_restaurant_member(restaurant_id));
