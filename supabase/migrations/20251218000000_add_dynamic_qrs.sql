-- Create dynamic_qrs table
create table if not exists public.dynamic_qrs (
  id uuid not null default gen_random_uuid(),
  amount numeric(10,2),
  payload jsonb default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'used', 'expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint dynamic_qrs_pkey primary key (id)
);

-- Enable RLS
alter table public.dynamic_qrs enable row level security;

-- Policies
create policy "Owners can do everything with dynamic_qrs"
  on public.dynamic_qrs for all
  using (auth.role() = 'authenticated');

create policy "Public can read active qrs"
  on public.dynamic_qrs for select
  using (true); -- Public needs to read to validate/pay
