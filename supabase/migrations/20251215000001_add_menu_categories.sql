-- Create menu_categories table
create table menu_categories (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) not null,
  name text not null,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add category_id to menu_items
alter table menu_items 
add column category_id uuid references menu_categories(id);

-- Add index for performance
create index idx_menu_categories_restaurant on menu_categories(restaurant_id);
create index idx_menu_items_category on menu_items(category_id);

-- RLS Policies for menu_categories
alter table menu_categories enable row level security;

create policy "Public menu categories are viewable by everyone" 
on menu_categories for select 
using ( true );

create policy "Authenticated users can insert menu categories" 
on menu_categories for insert 
with check ( auth.role() = 'authenticated' );

create policy "Authenticated users can update menu categories" 
on menu_categories for update 
using ( auth.role() = 'authenticated' );

create policy "Authenticated users can delete menu categories" 
on menu_categories for delete 
using ( auth.role() = 'authenticated' );
