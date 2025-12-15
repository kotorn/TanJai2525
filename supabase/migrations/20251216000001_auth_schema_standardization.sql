-- 1. Standardize Tenants (formerly restaurants)
-- Check if 'tenants' exists, if not, rename 'restaurants' if it exists, or create new.
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'restaurants') AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tenants') THEN
    ALTER TABLE restaurants RENAME TO tenants;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.tenants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text UNIQUE,
    created_at timestamptz DEFAULT now(),
    settings jsonb DEFAULT '{}'::jsonb,
    -- Add columns expected by code/legacy schema if missing
    cuisine_type text,
    banner_url text,
    address text,
    phone text,
    logo_url text
);

-- 2. Standardize Users (formerly profiles)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    ALTER TABLE profiles RENAME TO users;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.users (
    id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
    full_name text,
    email text,
    tenant_id uuid REFERENCES public.tenants(id),
    role text DEFAULT 'staff',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Trigger for New User Creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, tenant_id, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    (new.raw_user_meta_data->>'tenant_id')::uuid, -- Expect tenant_id in metadata or NULL
    COALESCE(new.raw_user_meta_data->>'role', 'staff')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid duplication
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. RLS Policies

-- Tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public tenants view" ON public.tenants;
CREATE POLICY "Public tenants view" ON public.tenants FOR SELECT USING (true);

-- Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 5. Foreign Key cleanup (if renaming happened, foreign keys might still point to old names if not handled by PG, 
-- but PG usually handles table renames well. We verify columns.)

-- Ensure products/menu_items point to tenants
DO $$
BEGIN
  -- Handle 'products' table rename to 'menu_items' if strictly following 2025 standard, 
  -- but for now we focus on Authentication (Users/Tenants). 
  -- We just ensure 'restaurant_id' columns in other tables are compatible or we add 'tenant_id' alias?
  -- For strictness, we should rename column 'restaurant_id' to 'tenant_id' in related tables or add a generated column.
  -- Let's stick to the minimal change for Auth first: Validating the Users/Tenants tables exists.
  NULL;
END $$;
