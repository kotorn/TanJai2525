# 🗄️ Database Design Guide

## Overview
Tanjai POS uses **PostgreSQL** hosted on Supabase. Security is enforced at the database level using Row Level Security (RLS).

## 1. Schema Design Principles

- **UUIDs**: Use `uuid` as the primary key for all tables (`gen_random_uuid()`).
- **Timestamps**: All tables must have `created_at` (default `now()`) and `updated_at`.
- **Soft Deletes**: Use a `deleted_at` column for critical data (Orders, Products) instead of physical deletion.

## 2. Row Level Security (RLS)

RLS is the primary security layer. The application connects as an authenticated user, and Postgres policies filter data access.

### Tenant Isolation (Multi-tenant)
Every table containing tenant-specific data MUST have a `restaurant_id` (or `organization_id`) column.
- **Policy Example (Select)**:
  ```sql
  create policy "Users can view data for their restaurant"
  on "orders"
  for select using (
    restaurant_id in (
      select restaurant_id from profiles where id = auth.uid()
    )
  );
  ```

### Role-Based Access
- **Roles**: Owner, Manager, Staff, Kitchen.
- Roles are stored in a `profiles` or `user_roles` table linked to `auth.users`.
- Policies should check the user's role before allowing `INSERT`, `UPDATE`, or `DELETE`.

## 3. Indexing Strategy

To ensure sub-second response times, we index columns used frequently in filters and joins.

- **Primary Keys**: Automatically indexed.
- **Foreign Keys**: ALWAYS index foreign keys (e.g., `restaurant_id`, `user_id`).
- **Timestamps**: Index `created_at` for sorting (e.g., "Recent Orders").
- **Search**: Use GIN indexes for JSONB columns or Full Text Search capabilities if needed.

## 4. Backup & Recovery

- **Daily Backups**: Automated by Supabase (Pro plan).
- **PITR (Point-in-Time Recovery)**: Enabled for production to allow restoring to any second in the last 7 days.
- **Disaster Recovery**:
  - Periodically verify backups by restoring to a separate project.

## 5. Offline Sync (Supabase)
- We use Supabase Realtime for live updates.
- For offline support, the client uses `tanstack-query` with local storage persistence to queue mutations and sync when back online.
