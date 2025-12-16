-- Helper function required by ERP module
CREATE OR REPLACE FUNCTION app_get_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  select tenant_id from public.users where id = auth.uid();
$$;

-- 1. Inventory Items (Base table for ERP)
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) NOT NULL,
    name text NOT NULL,
    unit text NOT NULL DEFAULT 'unit',
    cost_per_unit numeric(10, 2) DEFAULT 0,
    current_stock numeric(10, 4) DEFAULT 0,
    min_stock_level numeric(10, 4) DEFAULT 0,
    last_restocked_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant members view inventory" ON public.inventory_items FOR SELECT USING (tenant_id = app_get_tenant_id());
CREATE POLICY "Tenant members manage inventory" ON public.inventory_items FOR ALL USING (tenant_id = app_get_tenant_id());

-- 2. Physical Tables (renamed from 'tables' to avoid reserved keyword issues, though 'tables' is allowed)
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) NOT NULL,
    name text NOT NULL, -- e.g. "T1", "Bar 2"
    capacity integer DEFAULT 4,
    qr_code_url text,
    status text DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tables" ON public.restaurant_tables FOR SELECT USING (true);
CREATE POLICY "Tenant members manage tables" ON public.restaurant_tables FOR ALL USING (tenant_id = app_get_tenant_id());

-- 3. Enhance Orders to link with Physical Tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'table_id') THEN
        ALTER TABLE public.orders ADD COLUMN table_id uuid REFERENCES public.restaurant_tables(id);
    END IF;
END $$;
