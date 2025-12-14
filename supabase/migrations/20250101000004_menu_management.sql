-- Create categories table
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) not null,
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Enable RLS on categories
alter table categories enable row level security;

-- Policies for categories
create policy "Tenants can view their own categories"
  on categories for select
  using (tenant_id = current_setting('app.current_tenant', true)::uuid);

create policy "Tenants can manage their own categories"
  on categories for all
  using (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Update menu_items table
alter table menu_items
add column if not exists category_id uuid references categories(id),
add column if not exists description text,
add column if not exists image_url text,
add column if not exists sort_order int default 0,
add column if not exists is_available boolean default true;

-- Add index for sorting and filtering
create index if not exists idx_categories_tenant_sort on categories(tenant_id, sort_order);
create index if not exists idx_menu_items_category on menu_items(category_id);
create index if not exists idx_menu_items_sort on menu_items(sort_order);

-- Migration Note: If menu_items already had data without category_id, they will be orphaned.
-- In a production migration, we might create a "Default" category and assign them to it.
-- Since we are in early dev, null category_id is acceptable or we assume empty data.
