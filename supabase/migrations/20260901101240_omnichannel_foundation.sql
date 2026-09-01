-- Omnichannel foundation
--
-- This is an additive compatibility migration. The repository contains older
-- restaurant_id and tenant_id paths, so the canonical contract is introduced
-- without dropping or renaming legacy columns. A later expand/contract
-- migration can make tenant_id NOT NULL after production read-back proves the
-- mapping is complete.

-- Currency is tenant configuration, not a global application constant. Existing
-- Thai tenants retain the legacy THB default, while 2525minishop resolves to
-- JPY until an explicit settings.currency value is configured.
CREATE OR REPLACE FUNCTION public.omni_tenant_currency(p_tenant_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  configured_currency text;
  tenant_label text;
BEGIN
  SELECT upper(NULLIF(BTRIM(t.settings ->> 'currency'), '')),
         lower(concat_ws(' ', t.slug, t.name))
  INTO configured_currency, tenant_label
  FROM public.tenants AS t
  WHERE t.id = p_tenant_id;

  IF configured_currency ~ '^[A-Z]{3}$' THEN
    RETURN configured_currency;
  END IF;

  IF tenant_label LIKE '%2525%' THEN
    RETURN 'JPY';
  END IF;

  RETURN 'THB';
END;
$$;

-- 1. Introduce the canonical tenant_id compatibility column where the legacy
-- table is present. Only UUID-to-UUID mappings are backfilled automatically;
-- ambiguous legacy values are left for an explicit tenant migration.
DO $$
DECLARE
  target_table text;
  has_tenant_id boolean;
  has_restaurant_id boolean;
  tenant_udt text;
  restaurant_udt text;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'users',
    'menu_categories',
    'categories',
    'menu_items',
    'orders',
    'order_items'
  ] LOOP
    IF to_regclass(format('public.%I', target_table)) IS NULL THEN
      CONTINUE;
    END IF;

    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = target_table
        AND c.column_name = 'tenant_id'
    ) INTO has_tenant_id;

    IF NOT has_tenant_id THEN
      EXECUTE format(
        'ALTER TABLE public.%I ADD COLUMN tenant_id uuid',
        target_table
      );
    END IF;

    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = target_table
        AND c.column_name = 'restaurant_id'
    ) INTO has_restaurant_id;

    IF has_restaurant_id THEN
      SELECT c.udt_name
      INTO tenant_udt
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = target_table
        AND c.column_name = 'tenant_id';

      SELECT c.udt_name
      INTO restaurant_udt
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = target_table
        AND c.column_name = 'restaurant_id';

      IF tenant_udt = 'uuid' AND restaurant_udt = 'uuid' THEN
        EXECUTE format(
          'UPDATE public.%I SET tenant_id = restaurant_id WHERE tenant_id IS NULL AND restaurant_id IS NOT NULL',
          target_table
        );
      END IF;
    END IF;
  END LOOP;

  IF to_regclass('public.menu_items') IS NOT NULL THEN
    ALTER TABLE public.menu_items
      ADD COLUMN IF NOT EXISTS sku text,
      ADD COLUMN IF NOT EXISTS stock numeric(12, 3),
      ADD COLUMN IF NOT EXISTS stock_quantity numeric(12, 3),
      ADD COLUMN IF NOT EXISTS track_inventory boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS currency text,
      ADD COLUMN IF NOT EXISTS inventory_managed boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_available boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

    UPDATE public.menu_items
    SET sku = id::text
    WHERE sku IS NULL;

    UPDATE public.menu_items
    SET stock_quantity = stock
    WHERE stock_quantity IS NULL
      AND stock IS NOT NULL;

    UPDATE public.menu_items
    SET stock = stock_quantity
    WHERE track_inventory = true
      AND stock_quantity IS NOT NULL;

    UPDATE public.menu_items
    SET inventory_managed = true
    WHERE track_inventory = true;
  END IF;

  IF to_regclass('public.orders') IS NOT NULL THEN
    ALTER TABLE public.orders
      ADD COLUMN IF NOT EXISTS channel_source text NOT NULL DEFAULT 'pos',
      ADD COLUMN IF NOT EXISTS channel_provider text,
      ADD COLUMN IF NOT EXISTS channel_connection_id uuid,
      ADD COLUMN IF NOT EXISTS external_order_id text,
      ADD COLUMN IF NOT EXISTS external_idempotency_key text,
      ADD COLUMN IF NOT EXISTS currency text;
  END IF;

  IF to_regclass('public.order_items') IS NOT NULL THEN
    ALTER TABLE public.order_items
      ADD COLUMN IF NOT EXISTS currency text;
  END IF;
END $$;

-- Backfill new currency columns without relabeling existing orders as JPY.
-- The trigger functions below keep future rows aligned with the tenant config.
DO $$
BEGIN
  IF to_regclass('public.menu_items') IS NOT NULL THEN
    ALTER TABLE public.menu_items ALTER COLUMN currency DROP DEFAULT;
    UPDATE public.menu_items
    SET currency = CASE
      WHEN NULLIF(BTRIM(currency), '') IS NOT NULL THEN UPPER(BTRIM(currency))
      ELSE public.omni_tenant_currency(tenant_id)
    END;
    ALTER TABLE public.menu_items ALTER COLUMN currency SET NOT NULL;
  END IF;

  IF to_regclass('public.orders') IS NOT NULL THEN
    ALTER TABLE public.orders ALTER COLUMN currency DROP DEFAULT;
    UPDATE public.orders
    SET currency = CASE
      WHEN NULLIF(BTRIM(currency), '') IS NOT NULL THEN UPPER(BTRIM(currency))
      ELSE public.omni_tenant_currency(tenant_id)
    END;
    ALTER TABLE public.orders ALTER COLUMN currency SET NOT NULL;
  END IF;

  IF to_regclass('public.order_items') IS NOT NULL THEN
    ALTER TABLE public.order_items ALTER COLUMN currency DROP DEFAULT;
    IF to_regclass('public.orders') IS NOT NULL THEN
      UPDATE public.order_items AS oi
      SET currency = CASE
        WHEN NULLIF(BTRIM(oi.currency), '') IS NOT NULL THEN UPPER(BTRIM(oi.currency))
        ELSE COALESCE(o.currency, 'THB')
      END
      FROM public.orders AS o
      WHERE o.id = oi.order_id;
    END IF;
    UPDATE public.order_items
    SET currency = 'THB'
    WHERE NULLIF(BTRIM(currency), '') IS NULL;
    ALTER TABLE public.order_items ALTER COLUMN currency SET NOT NULL;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.omni_apply_menu_item_currency()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.currency := public.omni_tenant_currency(NEW.tenant_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.omni_apply_order_currency()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.currency := public.omni_tenant_currency(NEW.tenant_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.omni_apply_order_item_currency()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  parent_currency text;
BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    SELECT o.currency
    INTO parent_currency
    FROM public.orders AS o
    WHERE o.id = NEW.order_id;
  END IF;

  NEW.currency := COALESCE(parent_currency, public.omni_tenant_currency(NEW.tenant_id), 'THB');
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.menu_items') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS omni_apply_menu_item_currency ON public.menu_items;
    CREATE TRIGGER omni_apply_menu_item_currency
      BEFORE INSERT OR UPDATE OF tenant_id ON public.menu_items
      FOR EACH ROW
      EXECUTE FUNCTION public.omni_apply_menu_item_currency();
  END IF;

  IF to_regclass('public.orders') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS omni_apply_order_currency ON public.orders;
    CREATE TRIGGER omni_apply_order_currency
      BEFORE INSERT OR UPDATE OF tenant_id ON public.orders
      FOR EACH ROW
      EXECUTE FUNCTION public.omni_apply_order_currency();
  END IF;

  IF to_regclass('public.order_items') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS omni_apply_order_item_currency ON public.order_items;
    CREATE TRIGGER omni_apply_order_item_currency
      BEFORE INSERT OR UPDATE OF order_id, tenant_id ON public.order_items
      FOR EACH ROW
      EXECUTE FUNCTION public.omni_apply_order_item_currency();
  END IF;
END $$;

-- Existing menu migrations used integer inventory columns. Widen them before
-- the shared reservation function starts accepting fractional quantities.
DO $$
DECLARE
  stock_type text;
  stock_quantity_type text;
BEGIN
  IF to_regclass('public.menu_items') IS NULL THEN
    RETURN;
  END IF;

  SELECT c.udt_name
  INTO stock_type
  FROM information_schema.columns AS c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'menu_items'
    AND c.column_name = 'stock';

  IF stock_type IN ('int2', 'int4', 'int8') THEN
    ALTER TABLE public.menu_items
      ALTER COLUMN stock TYPE numeric(12, 3)
      USING stock::numeric;
  END IF;

  SELECT c.udt_name
  INTO stock_quantity_type
  FROM information_schema.columns AS c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'menu_items'
    AND c.column_name = 'stock_quantity';

  IF stock_quantity_type IN ('int2', 'int4', 'int8') THEN
    ALTER TABLE public.menu_items
      ALTER COLUMN stock_quantity TYPE numeric(12, 3)
      USING stock_quantity::numeric;
  END IF;
END $$;

-- Keep the new compatibility columns linked to tenants without validating old
-- rows immediately. This lets existing data be read back and reconciled first.
DO $$
DECLARE
  target_table text;
  constraint_name text;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'users',
    'menu_categories',
    'categories',
    'menu_items',
    'orders',
    'order_items'
  ] LOOP
    IF to_regclass(format('public.%I', target_table)) IS NULL THEN
      CONTINUE;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = target_table
        AND c.column_name = 'tenant_id'
    ) THEN
      CONTINUE;
    END IF;

    constraint_name := format('omni_%s_tenant_id_fkey', target_table);
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = constraint_name
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) NOT VALID',
        target_table,
        constraint_name
      );
    END IF;
  END LOOP;
END $$;

-- 2. Channel connection and audit tables. credential_ref is a reference to a
-- deployment secret, never the token itself.
CREATE TABLE IF NOT EXISTS public.channel_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN (
    'meta_catalog',
    'line_oa',
    'google_business_profile',
    'tiktok_shop'
  )),
  external_account_id text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'error')),
  scopes text[] NOT NULL DEFAULT '{}'::text[],
  credential_ref text NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_sync_at timestamptz,
  last_error text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT channel_connections_tenant_provider_account_key
    UNIQUE (tenant_id, provider, external_account_id)
);

CREATE TABLE IF NOT EXISTS public.catalog_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  channel_connection_id uuid NOT NULL REFERENCES public.channel_connections(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL,
  external_item_id text NOT NULL,
  content_hash text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed', 'disabled')),
  last_good_hash text,
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT catalog_publications_connection_item_key
    UNIQUE (channel_connection_id, menu_item_id),
  CONSTRAINT catalog_publications_connection_external_key
    UNIQUE (channel_connection_id, external_item_id)
);

CREATE TABLE IF NOT EXISTS public.channel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  channel_connection_id uuid NOT NULL REFERENCES public.channel_connections(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN (
    'meta_catalog',
    'line_oa',
    'google_business_profile',
    'tiktok_shop'
  )),
  external_event_id text NOT NULL,
  idempotency_key text NOT NULL,
  external_order_id text,
  event_type text NOT NULL,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'processed', 'ignored', 'failed')),
  payload_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  last_error text,
  CONSTRAINT channel_events_connection_event_key
    UNIQUE (channel_connection_id, external_event_id),
  CONSTRAINT channel_events_connection_idempotency_key
    UNIQUE (channel_connection_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS public.channel_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  channel_connection_id uuid NOT NULL REFERENCES public.channel_connections(id) ON DELETE CASCADE,
  operation text NOT NULL CHECK (operation IN ('catalog_publish', 'order_import', 'reconcile')),
  mode text NOT NULL DEFAULT 'dry_run' CHECK (mode IN ('dry_run', 'live')),
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'succeeded', 'partial', 'failed')),
  item_count integer NOT NULL DEFAULT 0,
  success_count integer NOT NULL DEFAULT 0,
  failure_count integer NOT NULL DEFAULT 0,
  result_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_summary text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.inventory_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  order_id uuid NOT NULL,
  menu_item_id uuid NOT NULL,
  quantity numeric(12, 3) NOT NULL CHECK (quantity > 0),
  status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'released', 'committed')),
  idempotency_key text NOT NULL,
  release_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz,
  committed_at timestamptz,
  CONSTRAINT inventory_reservations_order_item_key
    UNIQUE (tenant_id, order_id, menu_item_id),
  CONSTRAINT inventory_reservations_idempotency_key
    UNIQUE (tenant_id, idempotency_key)
);

ALTER TABLE public.inventory_reservations
  ADD COLUMN IF NOT EXISTS inventory_decremented boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_channel_connections_tenant_status
  ON public.channel_connections (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_catalog_publications_tenant_status
  ON public.catalog_publications (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_channel_events_tenant_received
  ON public.channel_events (tenant_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_sync_runs_tenant_started
  ON public.channel_sync_runs (tenant_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_order_status
  ON public.inventory_reservations (order_id, status);
CREATE INDEX IF NOT EXISTS idx_catalog_publications_tenant_connection
  ON public.catalog_publications (tenant_id, channel_connection_id);
CREATE INDEX IF NOT EXISTS idx_catalog_publications_tenant_menu_item
  ON public.catalog_publications (tenant_id, menu_item_id);
CREATE INDEX IF NOT EXISTS idx_channel_events_tenant_connection
  ON public.channel_events (tenant_id, channel_connection_id);
CREATE INDEX IF NOT EXISTS idx_channel_sync_runs_tenant_connection
  ON public.channel_sync_runs (tenant_id, channel_connection_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_tenant_order
  ON public.inventory_reservations (tenant_id, order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_tenant_menu_item
  ON public.inventory_reservations (tenant_id, menu_item_id);

-- Every child relationship carries the same tenant key as its parent. The
-- composite constraints prevent an otherwise valid UUID from crossing tenant
-- boundaries. NOT VALID preserves existing rows for the explicit audit pass.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = to_regclass('public.channel_connections')
      AND conname = 'channel_connections_tenant_id_key'
  ) THEN
    ALTER TABLE public.channel_connections
      ADD CONSTRAINT channel_connections_tenant_id_key UNIQUE (tenant_id, id);
  END IF;

  IF to_regclass('public.menu_items') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM pg_constraint
       WHERE conrelid = to_regclass('public.menu_items')
         AND conname = 'menu_items_tenant_id_key'
     ) THEN
    ALTER TABLE public.menu_items
      ADD CONSTRAINT menu_items_tenant_id_key UNIQUE (tenant_id, id);
  END IF;

  IF to_regclass('public.orders') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM pg_constraint
       WHERE conrelid = to_regclass('public.orders')
         AND conname = 'orders_tenant_id_key'
     ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_tenant_id_key UNIQUE (tenant_id, id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = to_regclass('public.catalog_publications')
      AND conname = 'catalog_publications_tenant_connection_fkey'
  ) THEN
    ALTER TABLE public.catalog_publications
      ADD CONSTRAINT catalog_publications_tenant_connection_fkey
      FOREIGN KEY (tenant_id, channel_connection_id)
      REFERENCES public.channel_connections (tenant_id, id)
      ON DELETE CASCADE NOT VALID;
  END IF;

  IF to_regclass('public.menu_items') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint
       WHERE conrelid = to_regclass('public.catalog_publications')
         AND conname = 'catalog_publications_tenant_menu_item_fkey'
     ) THEN
    ALTER TABLE public.catalog_publications
      ADD CONSTRAINT catalog_publications_tenant_menu_item_fkey
      FOREIGN KEY (tenant_id, menu_item_id)
      REFERENCES public.menu_items (tenant_id, id)
      ON DELETE CASCADE NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = to_regclass('public.channel_events')
      AND conname = 'channel_events_tenant_connection_fkey'
  ) THEN
    ALTER TABLE public.channel_events
      ADD CONSTRAINT channel_events_tenant_connection_fkey
      FOREIGN KEY (tenant_id, channel_connection_id)
      REFERENCES public.channel_connections (tenant_id, id)
      ON DELETE CASCADE NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = to_regclass('public.channel_sync_runs')
      AND conname = 'channel_sync_runs_tenant_connection_fkey'
  ) THEN
    ALTER TABLE public.channel_sync_runs
      ADD CONSTRAINT channel_sync_runs_tenant_connection_fkey
      FOREIGN KEY (tenant_id, channel_connection_id)
      REFERENCES public.channel_connections (tenant_id, id)
      ON DELETE CASCADE NOT VALID;
  END IF;

  IF to_regclass('public.orders') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint
       WHERE conrelid = to_regclass('public.inventory_reservations')
         AND conname = 'inventory_reservations_tenant_order_fkey'
     ) THEN
    ALTER TABLE public.inventory_reservations
      ADD CONSTRAINT inventory_reservations_tenant_order_fkey
      FOREIGN KEY (tenant_id, order_id)
      REFERENCES public.orders (tenant_id, id)
      ON DELETE CASCADE NOT VALID;
  END IF;

  IF to_regclass('public.menu_items') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint
       WHERE conrelid = to_regclass('public.inventory_reservations')
         AND conname = 'inventory_reservations_tenant_menu_item_fkey'
     ) THEN
    ALTER TABLE public.inventory_reservations
      ADD CONSTRAINT inventory_reservations_tenant_menu_item_fkey
      FOREIGN KEY (tenant_id, menu_item_id)
      REFERENCES public.menu_items (tenant_id, id)
      ON DELETE CASCADE NOT VALID;
  END IF;
END $$;

-- Keep provider/source values closed to the adapter contract while allowing
-- old rows to be audited before the constraints are validated.
DO $$
BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = to_regclass('public.orders')
        AND conname = 'omni_orders_channel_source_check'
    ) THEN
      ALTER TABLE public.orders
        ADD CONSTRAINT omni_orders_channel_source_check
        CHECK (channel_source IN (
          'pos', 'liff', 'line_oa', 'facebook_messenger',
          'facebook_catalog', 'instagram', 'google_business_profile',
          'tiktok_shop', 'tiktok'
        )) NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = to_regclass('public.orders')
        AND conname = 'omni_orders_channel_provider_check'
    ) THEN
      ALTER TABLE public.orders
        ADD CONSTRAINT omni_orders_channel_provider_check
        CHECK (channel_provider IS NULL OR channel_provider IN (
          'meta_catalog', 'line_oa', 'google_business_profile', 'tiktok_shop'
        )) NOT VALID;
    END IF;
  END IF;
END $$;

-- The external order uniqueness contract is kept on the central orders table.
-- The connection identifies the provider account, so two accounts may use the
-- same provider-side order id without colliding.
DO $$
BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    CREATE UNIQUE INDEX IF NOT EXISTS orders_channel_external_order_key
      ON public.orders (channel_connection_id, external_order_id)
      WHERE channel_connection_id IS NOT NULL AND external_order_id IS NOT NULL;
  END IF;
END $$;

-- 3. Tenant helpers for RLS. These are SECURITY INVOKER functions: they do not
-- bypass row-level security or expose service-role behavior to browser clients.
CREATE OR REPLACE FUNCTION public.omni_is_tenant_member(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users AS u
    WHERE u.id = (SELECT auth.uid())
      AND u.tenant_id = p_tenant_id
  );
$$;

CREATE OR REPLACE FUNCTION public.omni_is_tenant_operator(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users AS u
    WHERE u.id = (SELECT auth.uid())
      AND u.tenant_id = p_tenant_id
      AND COALESCE(u.role, 'staff') IN ('owner', 'manager', 'super_admin')
  );
$$;

-- 4. Atomic reservation primitives. The established stock_quantity/
-- track_inventory columns remain the inventory source of truth. The additive
-- stock and inventory_managed columns are kept in sync for compatibility.
CREATE OR REPLACE FUNCTION public.omni_reserve_stock(
  p_tenant_id uuid,
  p_order_id uuid,
  p_menu_item_id uuid,
  p_quantity numeric,
  p_idempotency_key text
)
RETURNS public.inventory_reservations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  existing_reservation public.inventory_reservations;
  order_belongs_to_tenant boolean;
  current_stock numeric;
  current_stock_quantity numeric;
  is_inventory_managed boolean;
BEGIN
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'reservation quantity must be positive' USING ERRCODE = '22023';
  END IF;

  IF NULLIF(BTRIM(p_idempotency_key), '') IS NULL THEN
    RAISE EXCEPTION 'reservation idempotency key is required' USING ERRCODE = '22023';
  END IF;

  IF to_regclass('public.orders') IS NULL THEN
    RAISE EXCEPTION 'orders table is required for stock reservation' USING ERRCODE = '42P01';
  END IF;

  EXECUTE 'SELECT EXISTS (
    SELECT 1
    FROM public.orders
    WHERE id = $1
      AND tenant_id = $2
  )'
  INTO order_belongs_to_tenant
  USING p_order_id, p_tenant_id;

  IF NOT order_belongs_to_tenant THEN
    RAISE EXCEPTION 'order does not belong to this tenant' USING ERRCODE = '42501';
  END IF;

  SELECT *
  INTO existing_reservation
  FROM public.inventory_reservations
  WHERE tenant_id = p_tenant_id
    AND idempotency_key = p_idempotency_key;

  IF FOUND THEN
    RETURN existing_reservation;
  END IF;

  SELECT COALESCE(mi.inventory_managed, false) OR COALESCE(mi.track_inventory, false),
         mi.stock_quantity,
         mi.stock
  INTO is_inventory_managed, current_stock_quantity, current_stock
  FROM public.menu_items AS mi
  WHERE mi.id = p_menu_item_id
    AND mi.tenant_id = p_tenant_id
    AND COALESCE(mi.is_available, true)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'menu item is unavailable for this tenant' USING ERRCODE = 'P0002';
  END IF;

  is_inventory_managed := COALESCE(is_inventory_managed, false);
  IF is_inventory_managed AND COALESCE(current_stock_quantity, current_stock, 0) < p_quantity THEN
    RAISE EXCEPTION 'insufficient stock' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.inventory_reservations (
    tenant_id,
    order_id,
    menu_item_id,
    quantity,
    idempotency_key,
    inventory_decremented
  )
  VALUES (
    p_tenant_id,
    p_order_id,
    p_menu_item_id,
    p_quantity,
    p_idempotency_key,
    is_inventory_managed
  )
  RETURNING * INTO existing_reservation;

  IF is_inventory_managed THEN
    UPDATE public.menu_items
    SET stock_quantity = COALESCE(stock_quantity, stock, 0) - p_quantity,
        stock = COALESCE(stock, stock_quantity, 0) - p_quantity,
        updated_at = now()
    WHERE id = p_menu_item_id
      AND tenant_id = p_tenant_id;
  END IF;

  RETURN existing_reservation;
EXCEPTION
  WHEN unique_violation THEN
    SELECT *
    INTO existing_reservation
    FROM public.inventory_reservations
    WHERE tenant_id = p_tenant_id
      AND idempotency_key = p_idempotency_key;

    IF FOUND THEN
      RETURN existing_reservation;
    END IF;

    RAISE;
END;
$$;

CREATE OR REPLACE FUNCTION public.omni_release_order_reservations(
  p_order_id uuid,
  p_reason text DEFAULT 'order_cancelled'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  released_count integer;
BEGIN
  WITH released AS (
    UPDATE public.inventory_reservations
    SET status = 'released',
        release_reason = p_reason,
        released_at = now()
    WHERE order_id = p_order_id
      AND status = 'reserved'
    RETURNING tenant_id, menu_item_id, quantity, inventory_decremented
  ), restored AS (
    UPDATE public.menu_items AS mi
    SET stock_quantity = COALESCE(mi.stock_quantity, mi.stock, 0) + released.quantity,
        stock = COALESCE(mi.stock, mi.stock_quantity, 0) + released.quantity,
        updated_at = now()
    FROM released
    WHERE mi.id = released.menu_item_id
      AND mi.tenant_id = released.tenant_id
      AND released.inventory_decremented
    RETURNING mi.id
  )
  SELECT COUNT(*) INTO released_count FROM released;

  RETURN COALESCE(released_count, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.omni_commit_order_reservations(p_order_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH committed AS (
    UPDATE public.inventory_reservations
    SET status = 'committed',
        committed_at = now()
    WHERE order_id = p_order_id
      AND status = 'reserved'
    RETURNING id
  )
  SELECT COUNT(*)::integer FROM committed;
$$;

CREATE OR REPLACE FUNCTION public.omni_release_cancelled_order_reservations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF OLD.status::text IS DISTINCT FROM 'cancelled'
     AND OLD.status::text IS DISTINCT FROM 'canceled'
     AND OLD.status::text IS DISTINCT FROM 'refunded' THEN
    PERFORM public.omni_release_order_reservations(NEW.id, 'order_cancelled');
  END IF;
  RETURN NEW;
END;
$$;

-- The trigger is installed after the function is defined so migration replay
-- works on databases where orders is provisioned by a later compatibility path.
DO $$
BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS omni_release_cancelled_order_reservations ON public.orders;
    CREATE TRIGGER omni_release_cancelled_order_reservations
      AFTER UPDATE OF status ON public.orders
      FOR EACH ROW
      WHEN (NEW.status::text IN ('cancelled', 'canceled', 'refunded'))
      EXECUTE FUNCTION public.omni_release_cancelled_order_reservations();
  END IF;
END $$;

-- 5. Explicit grants and RLS. Browser clients can read tenant-scoped status;
-- only the server/service-role path can write connections, events, sync runs,
-- or reservations.
ALTER TABLE public.channel_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS omni_channel_connections_read ON public.channel_connections;
CREATE POLICY omni_channel_connections_read
  ON public.channel_connections FOR SELECT TO authenticated
  USING (public.omni_is_tenant_member(tenant_id));

DROP POLICY IF EXISTS omni_catalog_publications_read ON public.catalog_publications;
CREATE POLICY omni_catalog_publications_read
  ON public.catalog_publications FOR SELECT TO authenticated
  USING (public.omni_is_tenant_member(tenant_id));

DROP POLICY IF EXISTS omni_channel_events_read ON public.channel_events;
CREATE POLICY omni_channel_events_read
  ON public.channel_events FOR SELECT TO authenticated
  USING (public.omni_is_tenant_member(tenant_id));

DROP POLICY IF EXISTS omni_channel_sync_runs_read ON public.channel_sync_runs;
CREATE POLICY omni_channel_sync_runs_read
  ON public.channel_sync_runs FOR SELECT TO authenticated
  USING (public.omni_is_tenant_member(tenant_id));

DROP POLICY IF EXISTS omni_inventory_reservations_read ON public.inventory_reservations;
CREATE POLICY omni_inventory_reservations_read
  ON public.inventory_reservations FOR SELECT TO authenticated
  USING (public.omni_is_tenant_member(tenant_id));

REVOKE ALL ON TABLE
  public.channel_connections,
  public.catalog_publications,
  public.channel_events,
  public.channel_sync_runs,
  public.inventory_reservations
FROM anon;

REVOKE ALL ON TABLE
  public.channel_connections,
  public.catalog_publications,
  public.channel_events,
  public.channel_sync_runs,
  public.inventory_reservations
FROM authenticated;

GRANT SELECT ON TABLE
  public.channel_connections,
  public.catalog_publications,
  public.channel_events,
  public.channel_sync_runs,
  public.inventory_reservations
TO authenticated;

GRANT ALL ON TABLE
  public.channel_connections,
  public.catalog_publications,
  public.channel_events,
  public.channel_sync_runs,
  public.inventory_reservations
TO service_role;

REVOKE ALL ON FUNCTION public.omni_reserve_stock(uuid, uuid, uuid, numeric, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.omni_release_order_reservations(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.omni_commit_order_reservations(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.omni_release_cancelled_order_reservations() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.omni_is_tenant_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.omni_is_tenant_operator(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.omni_is_tenant_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.omni_is_tenant_operator(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.omni_reserve_stock(uuid, uuid, uuid, numeric, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.omni_release_order_reservations(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.omni_commit_order_reservations(uuid) TO service_role;

COMMENT ON TABLE public.channel_connections IS 'Tenant-scoped provider accounts. credential_ref points to a deployment secret; token values are never stored here.';
COMMENT ON TABLE public.catalog_publications IS 'Last-known external catalog mapping and last-good content hash per channel account.';
COMMENT ON TABLE public.channel_events IS 'Idempotent provider event receipt and processing audit; payload_metadata must be sanitized.';
COMMENT ON TABLE public.channel_sync_runs IS 'Dry-run/live catalog and order synchronization audit.';
COMMENT ON TABLE public.inventory_reservations IS 'Atomic stock reservations shared by owned checkout and native marketplace orders.';
COMMENT ON COLUMN public.orders.external_order_id IS 'Provider-side order id; unique with channel_connection_id when populated.';
COMMENT ON COLUMN public.orders.currency IS 'Tenant-configured order currency; 2525minishop defaults to JPY.';
