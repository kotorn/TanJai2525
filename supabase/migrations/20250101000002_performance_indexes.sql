-- Optimizing for RLS and Common Queries
-- The leading column should almost ALWAYS be `tenant_id` for this multi-tenant architecture.

-- 1. Menu Items: Frequently filtered by availability within a tenant
create index idx_menu_items_tenant_available on menu_items(tenant_id, is_available);

-- 2. Inventory: Frequently queried for low stock items
-- Note: 'quantity' check would usually be done in application logic or a specific view, 
-- but having tenant_id + quantity index helps range queries.
create index idx_inventory_items_tenant_stock on inventory_items(tenant_id, quantity);

-- 3. Recipes: finding recipes for a menu item (already has single index, but composite might be better if we join)
-- Existing: create index idx_recipes_menu_item on recipes(menu_item_id); 
-- Since recipes are always scoped by tenant in RLS, we might want tenant_id first.
-- However, we usually query recipes BY menu_item_id. 
-- RLS will enforce tenant_id check. Postgres can combine indexes, but a composite (menu_item_id, tenant_id) is safest for RLS.
drop index if exists idx_recipes_menu_item;
create index idx_recipes_menu_item_tenant on recipes(menu_item_id, tenant_id);
