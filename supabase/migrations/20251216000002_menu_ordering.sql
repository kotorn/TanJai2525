-- 1. Menu Categories
CREATE TABLE IF NOT EXISTS public.menu_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) NOT NULL,
    name text NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- 2. Menu Items
CREATE TABLE IF NOT EXISTS public.menu_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) NOT NULL,
    category_id uuid REFERENCES public.menu_categories(id),
    name text NOT NULL,
    price numeric(10, 2) NOT NULL DEFAULT 0,
    description text,
    image_url text,
    is_available boolean DEFAULT true,
    stock integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) NOT NULL,
    table_no text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
    total_amount numeric(10, 2) NOT NULL DEFAULT 0,
    is_offline_synced boolean DEFAULT false,
    user_id uuid REFERENCES auth.users, -- Optional, if logged in user ordered
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    menu_item_id uuid REFERENCES public.menu_items(id),
    menu_item_name text NOT NULL, -- Snapshot
    price numeric(10, 2) NOT NULL, -- Snapshot
    quantity integer NOT NULL DEFAULT 1,
    modifiers jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- 5. RLS Policies

-- Helper function (reusing if exists or creating)
CREATE OR REPLACE FUNCTION public.is_tenant_member(tenant_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND tenant_id = tenant_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Menu Categories
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.menu_categories FOR SELECT USING (true);
CREATE POLICY "Tenant members manage categories" ON public.menu_categories FOR ALL USING (is_tenant_member(tenant_id));

-- Menu Items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Tenant members manage items" ON public.menu_items FOR ALL USING (is_tenant_member(tenant_id));

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- Staff can view/edit all orders for their tenant
CREATE POLICY "Tenant members manage orders" ON public.orders FOR ALL USING (is_tenant_member(tenant_id));
-- Public can CREATE orders (e.g. from table QR) - but normally we want some restriction.
-- For now, allow INSERT if referencing valid tenant (maybe tricky without token).
-- Option: Allow INSERT for anon, but restricted SELECT.
CREATE POLICY "Anon create orders" ON public.orders FOR INSERT WITH CHECK (true);
-- Users can view their own orders if logged in
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant members manage order items" ON public.order_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND is_tenant_member(orders.tenant_id))
);
CREATE POLICY "Anon create order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id) -- Weak check, relies on order creation
);
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_tenant ON public.menu_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON public.orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
