-- supabase/migrations/20251218020000_add_tax_fields.sql

-- Add Japan Tax fields to menu_items
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(4, 2) DEFAULT 0.08, -- 8% by default (Food)
ADD COLUMN IF NOT EXISTS is_alcohol BOOLEAN DEFAULT FALSE;

-- Add constraint to ensure tax_rate is valid (optional but good for data integrity)
-- Common rates: 0.00 (Exempt), 0.08 (Reduced), 0.10 (Standard)
ALTER TABLE public.menu_items
ADD CONSTRAINT valid_tax_rate CHECK (tax_rate IN (0.00, 0.08, 0.10));

-- Comment for documentation
COMMENT ON COLUMN public.menu_items.tax_rate IS 'Japan Consumption Tax Rate: 0.08 (Reduced/Food) or 0.10 (Standard/Alcohol/Dine-in)';
COMMENT ON COLUMN public.menu_items.is_alcohol IS 'Flag to identify alcohol items which strictly strictly require 10% tax';
