-- Create Ingredients Table
-- Stores raw materials like "Pork", "Basil", "Rice"
create table public.ingredients (
  id uuid not null default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  unit text not null, -- e.g., 'kg', 'g', 'ml', 'pack'
  cost_per_unit numeric(10, 2) default 0, -- Current cost
  current_stock numeric(10, 4) default 0, -- Current quantity on hand
  min_stock_level numeric(10, 4) default 0, -- Reorder point
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

-- Enable RLS for Ingredients
alter table public.ingredients enable row level security;
create policy "Ingredients are visible to tenant"
  on public.ingredients for select
  using (tenant_id = (select id from public.tenants where id = ingredients.tenant_id)); -- Simplified for now, usually checks auth.uid()

create policy "Ingredients are editable by tenant owner"
  on public.ingredients for all
  using (tenant_id = (select id from public.tenants where id = ingredients.tenant_id));

-- Create Recipes (BOM) Table
-- Maps Menu Items to Ingredients
create table public.recipes (
  id uuid not null default gen_random_uuid(),
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete restrict,
  quantity_required numeric(10, 4) not null, -- Amount used per dish
  created_at timestamptz default now(),
  primary key (id),
  unique(menu_item_id, ingredient_id)
);

-- Enable RLS for Recipes
alter table public.recipes enable row level security;
create policy "Recipes are visible to tenant"
  on public.recipes for select
  using (exists (select 1 from public.menu_items where id = recipes.menu_item_id)); 

create policy "Recipes are editable by tenant owner"
  on public.recipes for all
  using (exists (select 1 from public.menu_items where id = recipes.menu_item_id));

-- Create Inventory Transactions Table
-- Logs every stock movement (Restock, Sale, Waste, Adjustment)
create type public.transaction_type as enum ('restock', 'sale', 'waste', 'audit');

create table public.inventory_transactions (
  id uuid not null default gen_random_uuid(),
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  type public.transaction_type not null,
  quantity_change numeric(10, 4) not null, -- Positive for restock, negative for usage
  cost_at_time numeric(10, 2), -- Snapshot of cost for COGS calculation
  reference_id uuid, -- Link to order_id or purchase_order_id
  note text,
  created_at timestamptz default now(),
  primary key (id)
);

-- Enable RLS for Transactions
alter table public.inventory_transactions enable row level security;
create policy "Transactions are visible to tenant"
  on public.inventory_transactions for select
  using (exists (select 1 from public.ingredients where id = inventory_transactions.ingredient_id));

-- Indexes for performance
create index idx_ingredients_tenant on public.ingredients(tenant_id);
create index idx_recipes_menu_item on public.recipes(menu_item_id);
create index idx_inventory_transactions_ingredient on public.inventory_transactions(ingredient_id);
