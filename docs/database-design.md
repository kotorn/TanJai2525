# 🗄️ Database Design Guide (คู่มือการออกแบบฐานข้อมูล)

## Overview (ภาพรวม)
Tanjai POS uses **PostgreSQL** hosted on Supabase. Security is enforced at the database level using Row Level Security (RLS).
Tanjai POS ใช้ **PostgreSQL** บน Supabase และรักษาความปลอดภัยด้วย Row Level Security (RLS)

## 1. Schema Design Principles (หลักการออกแบบ Schema)

- **UUIDs**: Use `uuid` as the primary key for all tables (`gen_random_uuid()`).
  ใช้ UUID เป็นคีย์หลักสำหรับทุกตาราง
- **Timestamps**: All tables must have `created_at` (default `now()`) and `updated_at`.
  ทุกตารางต้องมีเวลาสร้างและเวลาแก้ไขล่าสุด
- **Soft Deletes**: Use a `deleted_at` column for critical data (Orders, Products) instead of physical deletion.
  ใช้การลบแบบ Soft Delete (ซ่อนข้อมูล) แทนการลบจริงสำหรับข้อมูลสำคัญ

## 2. Row Level Security (RLS)
**ระบบความปลอดภัยระดับแถว**

RLS is the primary security layer. The application connects as an authenticated user, and Postgres policies filter data access.
RLS เป็นเลเยอร์ความปลอดภัยหลัก แอปพลิเคชันจะเชื่อมต่อในฐานะผู้ใช้ที่ยืนยันตัวตนแล้ว และ Postgres จะกรองข้อมูลตามนโยบาย

### Tenant Isolation (Multi-tenant)
Every table containing tenant-specific data MUST have a `restaurant_id` (or `organization_id`) column.
ทุกตารางที่เป็นข้อมูลเฉพาะร้านค้าต้องมีคอลัมน์ `restaurant_id`
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

### Role-Based Access (การเข้าถึงตามบทบาท)
- **Roles**: Owner, Manager, Staff, Kitchen.
- Roles are stored in a `profiles` or `user_roles` table linked to `auth.users`.
- Policies should check the user's role before allowing `INSERT`, `UPDATE`, or `DELETE`.

## 3. Indexing Strategy (กลยุทธ์การทำ Index)

To ensure sub-second response times, we index columns used frequently in filters and joins.
เพื่อให้ตอบสนองได้เร็ว (ต่ำกว่า 1 วินาที) เราจะทำ Index ให้กับคอลัมน์ที่ถูกค้นหาบ่อยๆ

- **Primary Keys**: Automatically indexed. (Index อัตโนมัติ)
- **Foreign Keys**: ALWAYS index foreign keys (e.g., `restaurant_id`, `user_id`). (ต้องทำ Index เสมอ)
- **Timestamps**: Index `created_at` for sorting (e.g., "Recent Orders"). (สำหรับเรียงลำดับ)
- **Search**: Use GIN indexes for JSONB columns or Full Text Search capabilities if needed. (สำหรับค้นหาข้อความ)

## 4. Backup & Recovery (การสำรองและกู้คืนข้อมูล)

- **Daily Backups**: Automated by Supabase (Pro plan). (สำรองรายวันอัตโนมัติ)
- **PITR (Point-in-Time Recovery)**: Enabled for production to allow restoring to any second in the last 7 days. (กู้คืนย้อนหลังได้ทุกวินาทีใน 7 วัน)
- **Disaster Recovery**:
  - Periodically verify backups by restoring to a separate project. (ตรวจสอบไฟล์สำรองเป็นระยะ)

## 5. Offline Sync (Supabase)
**การซิงค์ข้อมูลออฟไลน์**
- We use Supabase Realtime for live updates. (ใช้ Supabase Realtime สำหรับอัปเดตสด)
- For offline support, the client uses `tanstack-query` with local storage persistence to queue mutations and sync when back online. (ใช้ local storage เก็บข้อมูลคิวและซิงค์เมื่อออนไลน์)
