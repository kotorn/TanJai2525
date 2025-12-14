-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Tenants Table (Restaurants)
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  settings jsonb default '{}'::jsonb
);

-- 2. Menu Items
create table menu_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) not null,
  name text not null,
  price numeric(10, 2) not null,
  is_available boolean default true,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Inventory Items (Stock)
create table inventory_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) not null,
  name text not null,
  unit text not null, -- e.g., 'kg', 'g', 'pack'
  quantity numeric(10, 4) default 0 not null,
  low_stock_threshold numeric(10, 4) default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Recipes (Relationship)
create table recipes (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) not null,
  menu_item_id uuid references menu_items(id) not null,
  inventory_item_id uuid references inventory_items(id) not null,
  quantity_required numeric(10, 4) not null, -- Amount deducted per order
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for performance (Day 2.5 Strategy)
create index idx_menu_items_tenant on menu_items(tenant_id);
create index idx_inventory_items_tenant on inventory_items(tenant_id);
create index idx_recipes_tenant on recipes(tenant_id);
create index idx_recipes_menu_item on recipes(menu_item_id);
