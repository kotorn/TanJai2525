-- Omnichannel foundation
--
-- This is an additive compatibility migration. The repository contains older
-- restaurant_id and tenant_id paths, so the canonical contract is introduced
-- without dropping or renaming legacy columns. A later expand/contract
-- migration can make tenant_id NOT NULL after production read-back proves the
-- mapping is complete.

-- 1. Introduce the canonical tenant_id compatibility column where the legacy
-- table is present. Only UUID-to-UUID mappings are backfilled automatically;
-- ambiguous legacy values are left for an explicit tenant migration.
DO $$
DECLARE
  table_name text;
  has_tenant_id boolean;
  has_restaurant_id boolean;
  tenant_udt text;
  restaurant_udt text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'users',
    'menu_categories',
    'categories',
    'menu_items',
    'orders',
    'order_items'
  ] LOOP
    IF to_regclass(format('public.%I', table_name)) IS NULL THEN
      CONTINUE;
    END IF;

    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = table_name
        AND c.column_name = 'tenant_id'
    ) INTO has_tenant_id;

    IF NOT has_tenant_id THEN
      EXECUTE format(
        'ALTER TABLE public.%I ADD COLUMN tenant_id uuid',
        table_name
      );
    END IF;

    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = table_name
        AND c.column_name = 'restaurant_id'
    ) INTO has_restaurant_id;

    IF has_restaurant_id THEN
      SELECT c.udt_name
      INTO tenant_udt
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = table_name
        AND c.column_name = 'tenant_id';

      SELECT c.udt_name
      INTO restaurant_udt
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = table_name
        AND c.column_name = 'restaurant_id';

      IF tenant_udt = 'uuid' AND restaurant_udt = 'uuid' THEN
        EXECUTE format(
          'UPDATE public.%I SET tenant_id = restaurant_id WHERE tenant_id IS NULL AND restaurant_id IS NOT NULL',
          table_name
        );
      END IF;
    END IF;
  END LOOP;

  IF to_regclass('public.menu_items') IS NOT NULL THEN
    ALTER TABLE public.menu_items
      ADD COLUMN IF NOT EXISTS sku text,
      ADD COLUMN IF NOT EXISTS stock numeric(12, 3),
      ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'JPY',
      ADD COLUMN IF NOT EXISTS inventory_managed boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_available boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

    UPDATE public.menu_items
    SET sku = id::text
    WHERE sku IS NULL;
  END IF;

  IF to_regclass('public.orders') IS NOT NULL THEN
    ALTER TABLE public.orders
      ADD COLUMN IF NOT EXISTS channel_source text NOT NULL DEFAULT 'pos',
      ADD COLUMN IF NOT EXISTS channel_provider text,
      ADD COLUMN IF NOT EXISTS channel_connection_id uuid,
      ADD COLUMN IF NOT EXISTS external_order_id text,
      ADD COLUMN IF NOT EXISTS external_idempotency_key text,
      ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'JPY';
  END IF;

  IF to_regclass('public.order_items') IS NOT NULL THEN
    ALTER TABLE public.order_items
      ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'JPY';
  END IF;
END $$;

-- Keep the new compatibility columns linked to tenants without validating old
-- rows immediately. This lets existing data be read back and reconciled first.
DO $$
DECLARE
  table_name text;
  constraint_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'users',
    'menu_categories',
    'categories',
    'menu_items',
    'orders',
    'order_items'
  ] LOOP
    IF to_regclass(format('public.%I', table_name)) IS NULL THEN
      CONTINUE;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = table_name
        AND c.column_name = 'tenant_id'
    ) THEN
      CONTINUE;
    END IF;

    constraint_name := format('omni_%s_tenant_id_fkey', table_name);
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = constraint_name
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) NOT VALID',
        table_name,
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

-- 4. Atomic reservation primitives. A finite menu_items.stock value is locked
-- and decremented in the same transaction as the reservation insert. NULL
-- stock means the item is not inventory-managed yet and is audited without a
-- decrement until inventory is configured.
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
  current_stock numeric;
BEGIN
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'reservation quantity must be positive' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO existing_reservation
  FROM public.inventory_reservations
  WHERE tenant_id = p_tenant_id
    AND idempotency_key = p_idempotency_key;

  IF FOUND THEN
    RETURN existing_reservation;
  END IF;

  SELECT mi.stock
  INTO current_stock
  FROM public.menu_items AS mi
  WHERE mi.id = p_menu_item_id
    AND mi.tenant_id = p_tenant_id
    AND COALESCE(mi.is_available, true)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'menu item is unavailable for this tenant' USING ERRCODE = 'P0002';
  END IF;

  IF current_stock IS NOT NULL AND current_stock < p_quantity THEN
    RAISE EXCEPTION 'insufficient stock' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.inventory_reservations (
    tenant_id,
    order_id,
    menu_item_id,
    quantity,
    idempotency_key
  )
  VALUES (
    p_tenant_id,
    p_order_id,
    p_menu_item_id,
    p_quantity,
    p_idempotency_key
  )
  RETURNING * INTO existing_reservation;

  IF current_stock IS NOT NULL THEN
    UPDATE public.menu_items
    SET stock = stock - p_quantity,
        updated_at = COALESCE(updated_at, now())
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
    RETURNING tenant_id, menu_item_id, quantity
  ), restored AS (
    UPDATE public.menu_items AS mi
    SET stock = mi.stock + released.quantity,
        updated_at = COALESCE(mi.updated_at, now())
    FROM released
    WHERE mi.id = released.menu_item_id
      AND mi.tenant_id = released.tenant_id
      AND mi.stock IS NOT NULL
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
  IF OLD.status::text NOT IN ('cancelled', 'canceled', 'refunded') THEN
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
