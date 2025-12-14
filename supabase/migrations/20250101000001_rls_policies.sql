-- Enable RLS on all tables
alter table tenants enable row level security;
alter table menu_items enable row level security;
alter table inventory_items enable row level security;
alter table recipes enable row level security;

-- Policy for Tenants table
-- Tenants can see their own data. 
-- For creating a tenant, we might need a separate flow or allow authenticated users to create one.
create policy "Tenants can view their own data"
  on tenants
  for select
  using (id = current_setting('app.current_tenant', true)::uuid);

create policy "Tenants can update their own data"
  on tenants
  for update
  using (id = current_setting('app.current_tenant', true)::uuid);

-- Policies for Menu Items
create policy "Tenants can view their own menu items"
  on menu_items
  for select
  using (tenant_id = current_setting('app.current_tenant', true)::uuid);

create policy "Tenants can insert their own menu items"
  on menu_items
  for insert
  with check (tenant_id = current_setting('app.current_tenant', true)::uuid);

create policy "Tenants can update their own menu items"
  on menu_items
  for update
  using (tenant_id = current_setting('app.current_tenant', true)::uuid);

create policy "Tenants can delete their own menu items"
  on menu_items
  for delete
  using (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Policies for Inventory Items
create policy "Tenants can view their own inventory"
  on inventory_items
  for select
  using (tenant_id = current_setting('app.current_tenant', true)::uuid);

create policy "Tenants can manage their own inventory"
  on inventory_items
  for all
  using (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Policies for Recipes
create policy "Tenants can view their own recipes"
  on recipes
  for select
  using (tenant_id = current_setting('app.current_tenant', true)::uuid);

create policy "Tenants can manage their own recipes"
  on recipes
  for all
  using (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Helper function to set the tenant (for testing in SQL editor)
-- Usage: select set_config('app.current_tenant', 'tenant-uuid-here', false);
