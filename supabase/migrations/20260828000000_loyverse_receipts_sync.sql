-- Direct Loyverse API receipt ingestion and daily reporting foundation.
-- The importer uses the service role only; no public/authenticated read access is granted here.

CREATE TABLE IF NOT EXISTS public.loyverse_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  store_id TEXT NOT NULL,
  receipt_number TEXT NOT NULL,
  receipt_type TEXT NOT NULL DEFAULT 'UNKNOWN',
  receipt_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  source TEXT,
  order_name TEXT,
  customer_id TEXT,
  employee_id TEXT,
  total_money NUMERIC(12, 2),
  total_tax NUMERIC(12, 2),
  total_discount NUMERIC(12, 2),
  total_gross_sales NUMERIC(12, 2),
  total_cost NUMERIC(12, 2),
  raw_payload JSONB NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT loyverse_receipts_store_number_key UNIQUE (store_id, receipt_number)
);

CREATE TABLE IF NOT EXISTS public.loyverse_receipt_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES public.loyverse_receipts(id) ON DELETE CASCADE,
  line_index INTEGER NOT NULL CHECK (line_index >= 0),
  external_line_id TEXT,
  item_id TEXT,
  variant_id TEXT,
  item_name TEXT,
  variant_name TEXT,
  quantity NUMERIC(12, 3) NOT NULL DEFAULT 0,
  price NUMERIC(12, 2),
  cost NUMERIC(12, 2),
  gross_total_money NUMERIC(12, 2),
  total_money NUMERIC(12, 2),
  raw_payload JSONB NOT NULL,
  CONSTRAINT loyverse_receipt_lines_receipt_index_key UNIQUE (receipt_id, line_index)
);

CREATE TABLE IF NOT EXISTS public.loyverse_receipt_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES public.loyverse_receipts(id) ON DELETE CASCADE,
  payment_index INTEGER NOT NULL CHECK (payment_index >= 0),
  external_payment_id TEXT,
  payment_type_id TEXT,
  payment_type TEXT,
  money NUMERIC(12, 2),
  raw_payload JSONB NOT NULL,
  CONSTRAINT loyverse_receipt_payments_receipt_index_key UNIQUE (receipt_id, payment_index)
);

CREATE TABLE IF NOT EXISTS public.loyverse_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  store_id TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  lookback_days INTEGER NOT NULL DEFAULT 2 CHECK (lookback_days >= 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'succeeded', 'failed')),
  pages INTEGER NOT NULL DEFAULT 0,
  receipts_fetched INTEGER NOT NULL DEFAULT 0,
  receipts_upserted INTEGER NOT NULL DEFAULT 0,
  lines_upserted INTEGER NOT NULL DEFAULT 0,
  payments_upserted INTEGER NOT NULL DEFAULT 0,
  skipped_receipts INTEGER NOT NULL DEFAULT 0,
  error_message TEXT
 );

CREATE INDEX IF NOT EXISTS idx_loyverse_receipts_store_created
  ON public.loyverse_receipts (store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyverse_receipts_store_updated
  ON public.loyverse_receipts (store_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyverse_receipt_lines_item
  ON public.loyverse_receipt_lines (item_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_loyverse_sync_runs_store_started
  ON public.loyverse_sync_runs (store_id, started_at DESC);

ALTER TABLE public.loyverse_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyverse_receipt_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyverse_receipt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyverse_sync_runs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.loyverse_receipts FROM anon, authenticated;
REVOKE ALL ON TABLE public.loyverse_receipt_lines FROM anon, authenticated;
REVOKE ALL ON TABLE public.loyverse_receipt_payments FROM anon, authenticated;
REVOKE ALL ON TABLE public.loyverse_sync_runs FROM anon, authenticated;

CREATE OR REPLACE VIEW public.loyverse_daily_sales AS
SELECT
  tenant_id,
  store_id,
  (receipt_date AT TIME ZONE 'Asia/Tokyo')::DATE AS sale_date,
  COUNT(*) AS receipt_count,
  COUNT(*) FILTER (WHERE UPPER(receipt_type) <> 'REFUND') AS sale_receipts,
  COUNT(*) FILTER (WHERE UPPER(receipt_type) = 'REFUND') AS refund_receipts,
  COUNT(DISTINCT customer_id) FILTER (WHERE customer_id IS NOT NULL) AS unique_customers,
  SUM(CASE WHEN UPPER(receipt_type) = 'REFUND' THEN -ABS(COALESCE(total_gross_sales, total_money, 0)) ELSE COALESCE(total_gross_sales, total_money, 0) END) AS gross_sales,
  SUM(CASE WHEN UPPER(receipt_type) = 'REFUND' THEN -ABS(COALESCE(total_discount, 0)) ELSE COALESCE(total_discount, 0) END) AS discounts,
  SUM(CASE WHEN UPPER(receipt_type) = 'REFUND' THEN -ABS(COALESCE(total_tax, 0)) ELSE COALESCE(total_tax, 0) END) AS taxes,
  SUM(CASE WHEN UPPER(receipt_type) = 'REFUND' THEN -ABS(COALESCE(total_cost, 0)) ELSE COALESCE(total_cost, 0) END) AS cost_of_goods,
  SUM(CASE WHEN UPPER(receipt_type) = 'REFUND' THEN -ABS(COALESCE(total_money, 0)) ELSE COALESCE(total_money, 0) END) AS net_sales,
  MAX(COALESCE(updated_at, created_at, receipt_date)) AS last_receipt_at,
  MAX(imported_at) AS last_imported_at
FROM public.loyverse_receipts
WHERE receipt_date IS NOT NULL
GROUP BY tenant_id, store_id, (receipt_date AT TIME ZONE 'Asia/Tokyo')::DATE;

CREATE OR REPLACE VIEW public.loyverse_daily_item_sales AS
SELECT
  r.tenant_id,
  r.store_id,
  (r.receipt_date AT TIME ZONE 'Asia/Tokyo')::DATE AS sale_date,
  l.item_id,
  l.variant_id,
  l.item_name,
  SUM(CASE WHEN UPPER(r.receipt_type) = 'REFUND' THEN -ABS(l.quantity) ELSE l.quantity END) AS net_quantity,
  SUM(CASE WHEN UPPER(r.receipt_type) = 'REFUND' THEN -ABS(COALESCE(l.total_money, l.price * l.quantity, 0)) ELSE COALESCE(l.total_money, l.price * l.quantity, 0) END) AS net_sales
FROM public.loyverse_receipts AS r
JOIN public.loyverse_receipt_lines AS l ON l.receipt_id = r.id
WHERE r.receipt_date IS NOT NULL
GROUP BY r.tenant_id, r.store_id, (r.receipt_date AT TIME ZONE 'Asia/Tokyo')::DATE, l.item_id, l.variant_id, l.item_name;

REVOKE ALL ON public.loyverse_daily_sales FROM anon, authenticated;
REVOKE ALL ON public.loyverse_daily_item_sales FROM anon, authenticated;

COMMENT ON TABLE public.loyverse_receipts IS 'Raw and normalized Loyverse receipt headers imported by the protected server-side scheduler.';
COMMENT ON TABLE public.loyverse_receipt_lines IS 'Flattened Loyverse receipt line items for product-level analytics.';
COMMENT ON TABLE public.loyverse_receipt_payments IS 'Flattened Loyverse receipt payments for payment-method analytics.';
COMMENT ON TABLE public.loyverse_sync_runs IS 'Audit log for each Loyverse receipt sync window.';
COMMENT ON VIEW public.loyverse_daily_sales IS 'Daily Loyverse receipt totals in Asia/Tokyo business time.';
COMMENT ON VIEW public.loyverse_daily_item_sales IS 'Daily Loyverse item quantities and net sales in Asia/Tokyo business time.';
