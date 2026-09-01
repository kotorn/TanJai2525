# Database migration audit

## Current state

The repository currently contains several historical schema paths in the
active `public` schema:

- `restaurant_id` starts in the 2024 restaurant/profile/order path.
- `tenant_id` is introduced by the 2025 tenant/menu/ERP path.
- Later migrations recreate `orders`, `order_items`, `menu_categories`, and
  inventory features with incompatible column sets.
- Some files use non-idempotent `CREATE TABLE`, `CREATE TYPE`, policy, index,
  and trigger statements with names that overlap another path.

This means a fresh local reset is not a reliable proof of the current
production schema until the historical chain is reconciled. The exact legacy
files are intentionally not deleted or rewritten in this Foundation PR: doing
so would make an already-applied database impossible to compare against its
migration history.

## Foundation decision

The Foundation migration is additive and keeps the `public` schema. It:

1. Adds nullable `tenant_id` compatibility columns where a legacy
   `restaurant_id` column exists and backfills only UUID-to-UUID mappings.
2. Adds a `NOT VALID` foreign key for later validation after a tenant read-back.
3. Adds the channel, publication, event, sync-run, and reservation contracts.
4. Adds a unique central-order index on `(channel_connection_id,
   external_order_id)`.
5. Adds atomic stock reservation and cancellation-release functions.

No legacy column is dropped, renamed, or made non-null in this migration.

## Required pre-staging gate

Before a Supabase project is linked, the owner must choose one of these
reconciliation paths:

- validate and squash the legacy history on a disposable project, then use the
  canonical baseline for a new environment; or
- retain the existing history and run a reviewed expand/contract migration,
  validate the `NOT VALID` constraints, and record the database read-back.

The deploy workflow fails closed when `SUPABASE_PROJECT_REF` or the protected
database credentials are absent. It must not guess a project from a local
config file or from Gmail.

## Local verification boundary

`supabase db reset --local` is an acceptance gate. It requires Docker Desktop;
without a running Docker daemon the command is reported as blocked, not as a
successful schema validation. Remote dry-run/apply remains separately gated
by explicit environment variables and protected approval.
