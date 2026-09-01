# Direct Loyverse API + Scheduler

This integration imports Loyverse receipts into Supabase from a protected server-side Vercel Cron route.

## Runtime flow

1. Vercel Cron calls `GET /api/cron/loyverse` in Production.
2. The route validates `Authorization: Bearer $CRON_SECRET`.
3. The server requests Loyverse receipts updated within a rolling date window and follows API cursors.
4. Receipt headers, line items, payments, and the original JSON payload are upserted into Supabase.
5. `loyverse_daily_sales` and `loyverse_daily_item_sales` provide reporting-ready views.

## Required server-side environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
LOYVERSE_API_TOKEN=your-loyverse-access-token
LOYVERSE_STORE_ID=your-loyverse-store-id
CRON_SECRET=your-long-random-cron-secret
```

Optional configuration:

```env
LOYVERSE_TENANT_ID=your-tanjai-tenant-uuid
LOYVERSE_TIME_ZONE=Asia/Tokyo
LOYVERSE_SYNC_LOOKBACK_DAYS=2
LOYVERSE_SYNC_MAX_PAGES=100
LOYVERSE_API_TIMEOUT_MS=30000
```

Never expose `LOYVERSE_API_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, or `CRON_SECRET` to client-side code, Git, or chat. Add them as Vercel Production environment variables.

## Schedule

The committed schedule is `30 12 * * *` (21:30 Japan time when Vercel evaluates the cron in UTC). It is intentionally after the shop's normal closing time and uses a two-day updated-at lookback so recent edits or refunds are re-read.

Vercel Cron runs the route in Production. A manual smoke test can be made without revealing the secret in the command history:

```bash
curl -sS -H "Authorization: Bearer ${CRON_SECRET}" https://your-production-domain/api/cron/loyverse
```

## Database deployment

Apply the migration before the first scheduled run:

```bash
npx supabase db push
```

The ingestion tables are RLS-enabled and have no `anon` or `authenticated` grants. The route requires `SUPABASE_SERVICE_ROLE_KEY`; reporting access should be added later through a tenant-scoped server action.

## Backfill and reconciliation

The importer is idempotent on `(store_id, receipt_number)` and re-imports the rolling lookback window on every run. For a historical backfill, temporarily increase `LOYVERSE_SYNC_LOOKBACK_DAYS` or run a controlled one-off importer. Validate the first run against Loyverse Back Office Sales Summary, including sales, refunds, tax, discounts, payment methods, and item quantities.