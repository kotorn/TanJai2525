-- Tanjai POS Database Schema
-- Focus: Multi-tenancy, Row-Level Security (RLS), Offline-First support

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-------------------------------------------------------------------------------
-- 1. TENANTS & AUTH
-------------------------------------------------------------------------------

create table tenants (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null, -- e.g. "noodle-shop-1" (used in subdomain/url)
  name text not null,
  created_at timestamptz default now()
);

-- RLS: Tenants can be read by public (for login/resolution) but only updated by admins
alter table tenants enable row level security;

create policy "Tenants are viewable by everyone" on tenants
  for select using (true);

-------------------------------------------------------------------------------
-- 2. INVENTORY & MENU (Feature: Ingredient-Level COGS)
-------------------------------------------------------------------------------

-- Ingredients / Raw Materials
create table inventory_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) not null,
  name text not null,
  unit text not null, -- e.g. 'kg', 'liter', 'pack'
  cost_per_unit numeric(10,2) not null, -- Current cost
  current_stock numeric(10,4) default 0,
  min_stock_level numeric(10,4) default 10,
  created_at timestamptz default now()
);

alter table inventory_items enable row level security;

-- Menu Items (Sellable)
create table menu_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) not null,
  name text not null,
  price numeric(10,2) not null,
  category text,
  image_url text,
  is_available boolean default true,
  created_at timestamptz default now()
);

alter table menu_items enable row level security;

-- Bill of Materials (BOM) - Mapping Menu to Ingredients
create table menu_item_bom (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) not null,
  menu_item_id uuid references menu_items(id) on delete cascade not null,
  inventory_item_id uuid references inventory_items(id) not null,
  quantity numeric(10,4) not null, -- Amount used per dish
  created_at timestamptz default now()
);

alter table menu_item_bom enable row level security;

-------------------------------------------------------------------------------
-- 3. ORDERS (Feature: Atomic Transactions)
-------------------------------------------------------------------------------

create type order_status as enum ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');

create table orders (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) not null,
  table_number text,
  status order_status default 'pending',
  total_amount numeric(10,2) not null default 0,
  payment_status text default 'unpaid',
  payment_proof_url text, -- Slip image
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table orders enable row level security;

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) not null,
  order_id uuid references orders(id) on delete cascade not null,
  menu_item_id uuid references menu_items(id) not null,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null,
  options jsonb default '{}', -- e.g. { "no_cilantro": true, "spicy_level": 3 }
  created_at timestamptz default now()
);

alter table order_items enable row level security;

-------------------------------------------------------------------------------
-- 4. RLS POLICIES
-------------------------------------------------------------------------------

-- Helper function to get current tenant_id from session/request context
-- In a real Supabase app, this might come from `auth.jwt() -> app_metadata`
-- For this MVP, we assume a custom GUC or JWT claim `app.current_tenant`
create or replace function app_get_tenant_id()
returns uuid
language sql stable
as $$
  select nullif(current_setting('app.current_tenant', true), '')::uuid;
$$;

-- Generic RLS Policy Template for Tenant Isolation
-- (Applied to all tenant-scoped tables: inventory_items, menu_items, orders, etc.)

-- Policy: Select
create policy "Tenant Isolation Select" on inventory_items
  for select using (tenant_id = app_get_tenant_id());
  
create policy "Tenant Isolation Select" on menu_items
  for select using (tenant_id = app_get_tenant_id());

create policy "Tenant Isolation Select" on orders
  for select using (tenant_id = app_get_tenant_id());

-- (Repeat insert/update/delete policies as needed for specific roles)

-------------------------------------------------------------------------------
-- 5. ATOMIC FUNCTIONS (Feature: Server Actions & Stock Deduction)
-------------------------------------------------------------------------------

create or replace function create_order_with_stock_deduction(
  p_tenant_id uuid,
  p_table_number text,
  p_items jsonb -- Array of { menu_item_id, quantity, options }
)
returns uuid -- Returns the new order ID
language plpgsql
as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_menu_price numeric;
  v_bom record;
begin
  -- 1. Create Order Header
  insert into orders (tenant_id, table_number, status, total_amount)
  values (p_tenant_id, p_table_number, 'pending', 0) -- Amount updated later
  returning id into v_order_id;
  
  -- 2. Loop through items
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    -- Get price
    select price into v_menu_price from menu_items where id = (v_item->>'menu_item_id')::uuid;
    
    -- Insert Order Item
    insert into order_items (tenant_id, order_id, menu_item_id, quantity, unit_price, options)
    values (
      p_tenant_id, 
      v_order_id, 
      (v_item->>'menu_item_id')::uuid, 
      (v_item->>'quantity')::int, 
      v_menu_price,
      v_item->'options'
    );
    
    -- 3. Stock Deduction (Logic: Find BOM -> Deduct Inventory)
    for v_bom in 
      select * from menu_item_bom where menu_item_id = (v_item->>'menu_item_id')::uuid
    loop
      update inventory_items
      set current_stock = current_stock - (v_bom.quantity * (v_item->>'quantity')::int)
      where id = v_bom.inventory_item_id;
      
      -- Check for negative stock (optional: raise error if strict)
      -- if stock < 0 then raise exception 'Insufficient stock';
    end loop;
    
  end loop;

  return v_order_id;
end;
$$;
