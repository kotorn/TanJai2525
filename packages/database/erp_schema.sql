-------------------------------------------------------------------------------
-- TANJAI ERP EXTENSION SCHEMA
-- Focus: Multi-Branch Inventory, Procurement, Supplier Management
-------------------------------------------------------------------------------

-------------------------------------------------------------------------------
-- 1. WAREHOUSES & LOCATIONS
-------------------------------------------------------------------------------

create table warehouses (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) not null,
  name text not null, -- e.g. "Central Kitchen", "Bangna Branch"
  code text,          -- e.g. "WH-001"
  address text,
  is_main boolean default false, -- If true, this is the Central Kitchen
  created_at timestamptz default now()
);

alter table warehouses enable row level security;

create policy "Tenant Isolation Select" on warehouses
  for select using (tenant_id = app_get_tenant_id());

-------------------------------------------------------------------------------
-- 2. ENHANCED INVENTORY (Multi-Location)
-------------------------------------------------------------------------------

-- Maps inventory items (from base schema) to specific warehouses
create table inventory_levels (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) not null,
  inventory_item_id uuid references inventory_items(id) on delete cascade not null,
  warehouse_id uuid references warehouses(id) on delete cascade not null,
  quantity numeric(10,4) default 0,
  min_stock numeric(10,4) default 10,  -- Reorder point for this specific location
  max_stock numeric(10,4),             -- Target stock level
  bin_location text,                   -- e.g. "Aisle 3, Shelf B"
  updated_at timestamptz default now(),
  
  unique(inventory_item_id, warehouse_id)
);

alter table inventory_levels enable row level security;

create policy "Tenant Isolation Select" on inventory_levels
  for select using (tenant_id = app_get_tenant_id());

-------------------------------------------------------------------------------
-- 3. SUPPLIER MANAGEMENT (CRM)
-------------------------------------------------------------------------------

create table suppliers (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) not null,
  name text not null,
  contact_person text,
  email text,
  phone text,
  address text,
  tax_id text,
  payment_terms integer default 30, -- Days, e.g. Credit 30 Days
  created_at timestamptz default now()
);

alter table suppliers enable row level security;

create policy "Tenant Isolation Select" on suppliers
  for select using (tenant_id = app_get_tenant_id());

-- Supplier Price List (Cost per item per supplier)
create table supplier_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) not null,
  supplier_id uuid references suppliers(id) on delete cascade not null,
  inventory_item_id uuid references inventory_items(id) on delete cascade not null,
  supplier_sku text, -- Supplier's part number
  unit_price numeric(10,2) not null,
  minimum_order_quantity numeric(10,4) default 1,
  lead_time_days integer,
  is_preferred boolean default false,
  updated_at timestamptz default now()
);

alter table supplier_items enable row level security;

create policy "Tenant Isolation Select" on supplier_items
  for select using (tenant_id = app_get_tenant_id());


-------------------------------------------------------------------------------
-- 4. PURCHASING (Procurement)
-------------------------------------------------------------------------------

create type po_status as enum ('draft', 'pending_approval', 'sent', 'partial_received', 'received', 'cancelled');

create table purchase_orders (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) not null,
  po_number text not null, -- e.g. "PO-2025-0001"
  supplier_id uuid references suppliers(id) not null,
  warehouse_id uuid references warehouses(id) not null, -- Where to ship to
  status po_status default 'draft',
  total_amount numeric(10,2) default 0,
  
  order_date date default current_date,
  expected_delivery_date date,
  
  created_by uuid, -- User ID
  approved_by uuid, -- User ID
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table purchase_orders enable row level security;

create policy "Tenant Isolation Select" on purchase_orders
  for select using (tenant_id = app_get_tenant_id());

create table purchase_order_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) not null,
  purchase_order_id uuid references purchase_orders(id) on delete cascade not null,
  inventory_item_id uuid references inventory_items(id) not null,
  
  quantity_ordered numeric(10,4) not null,
  quantity_received numeric(10,4) default 0,
  unit_price numeric(10,2) not null, -- Locked in price at time of PO
  total_price numeric(10,2) generated always as (quantity_ordered * unit_price) stored,
  
  created_at timestamptz default now()
);

alter table purchase_order_items enable row level security;

create policy "Tenant Isolation Select" on purchase_order_items
  for select using (tenant_id = app_get_tenant_id());

-------------------------------------------------------------------------------
-- 5. STOCK MOVEMENTS (Audit Trail)
-------------------------------------------------------------------------------

create type movement_type as enum ('po_receive', 'transfer_in', 'transfer_out', 'usage', 'adjustment', 'waste');

create table stock_movements (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) not null,
  inventory_item_id uuid references inventory_items(id) not null,
  warehouse_id uuid references warehouses(id) not null,
  
  movement_type movement_type not null,
  quantity_change numeric(10,4) not null, -- Positive or Negative
  reference_id uuid, -- Link to PO ID or Order ID
  reason text,
  
  performed_by uuid, -- User ID
  created_at timestamptz default now()
);

alter table stock_movements enable row level security;

create policy "Tenant Isolation Select" on stock_movements
  for select using (tenant_id = app_get_tenant_id());
