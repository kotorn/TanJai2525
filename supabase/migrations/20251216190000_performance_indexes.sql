-- Optimizing for Order History & KDS views
CREATE INDEX IF NOT EXISTS idx_orders_tenant_created ON public.orders(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status ON public.orders(tenant_id, status);

-- Optimizing for Inventory Lookups (ERP)
CREATE INDEX IF NOT EXISTS idx_inventory_levels_composite ON public.inventory_levels(tenant_id, warehouse_id, inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_name ON public.inventory_items(tenant_id, name text_pattern_ops); -- Fast search

-- Optimizing for Stock Movements History
CREATE INDEX IF NOT EXISTS idx_stock_movements_item_date ON public.stock_movements(inventory_item_id, created_at DESC);

-- Optimizing for Menu lookups
CREATE INDEX IF NOT EXISTS idx_menu_items_category_sort ON public.menu_items(tenant_id, category_id, sort_order);
