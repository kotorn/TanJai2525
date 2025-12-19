# 🚀 Mission: Project Merger & Loyverse Integration (TanJai2525 x tanjai-pos)

## 🎯 Context & Objective
เราต้องการควบรวมโปรเจค **`TanJai2525`** (Line LIFF App สำหรับร้าน 2525minishop ญี่ปุ่น) เข้าสู่โครงสร้าง Monorepo ของ **`tanjai-pos`** เพื่อยกระดับความสามารถ (Security, Offline-first, UI System) และเพิ่มฟีเจอร์เชื่อมต่อกับ **Loyverse POS**

- **Source Base (Architecture):** `tanjai-pos` (Enterprise Monorepo, Supabase RLS, Shared UI)
- **Client Logic (To Migrate):** `TanJai2525` (Current business logic, Line LIFF flow)
- **New Requirement:** เชื่อมต่อ Loyverse (Product Sync & Order Push at Packing)

---

## 🛠 Action Plan for Agent

### Phase 1: Workspace & Structure Setup
- [ ] **Analyze Monorepo:** เข้าใจโครงสร้าง `apps/` และ `packages/` ของ `tanjai-pos`
- [ ] **Create New App:** สร้าง `apps/tanjai-2525` ใน Monorepo โดยใช้ Next.js config แบบเดียวกับ `apps/web`
- [ ] **Dependency Setup:** ติดตั้ง dependencies ที่จำเป็นใน `apps/tanjai-2525` (เช่น liff-sdk) และ link กับ internal packages (`@tanjai/ui`, `@tanjai/database`)

### Phase 2: Migration & Refactoring (Client App)
- [ ] **Migrate Pages:** ย้ายหน้าจอหลักจาก `TanJai2525` มายัง `apps/tanjai-2525`
  - *Constraint:* เปลี่ยนการใช้ CSS/Tailwind แบบเดิม ให้มาใช้ Components จาก `packages/ui` (Button, Card, Input) เพื่อให้ Design System เป็นหนึ่งเดียว
- [ ] **Implement Auth:** ปรับระบบ Login ให้รองรับทั้ง LINE LIFF และระบบ RLS ของ Supabase (อ้างอิงจาก `apps/web/src/features/auth`)
- [ ] **Database Alignment:** ตรวจสอบ Schema ของ `TanJai2525` และเขียน Migration Script เพื่อนำข้อมูลเข้าสู่ Schema มาตรฐานของ `tanjai-pos` (โดยใช้ `tenant_id` แยกสาขา)

### Phase 3: Loyverse Connector Module (Backend/Integration)
- [ ] **Create Service:** สร้าง `packages/loyverse-bridge` หรือ Service ภายใน app เพื่อจัดการ API
- [ ] **Product Sync (Import):**
  - สร้าง Cron Job หรือ Manual Trigger เพื่อดึง Item/Inventory จาก Loyverse API มา update ลง Supabase `menu_items`
- [ ] **Order Push (Export):**
  - เตรียม Function สำหรับส่ง `sales_receipt` กลับไปยัง Loyverse เมื่อออเดอร์เสร็จสมบูรณ์

### Phase 4: Packing Station & Stock Cut (Staff App)
- [ ] **Clone KDS Feature:** คัดลอก Logic จาก `apps/web/src/features/kds` มาปรับปรุง
- [ ] **Customize for Packing:**
  - เปลี่ยน UI จาก "Kitchen View" เป็น "Packing View" (เน้น Checklist สินค้า)
  - เพิ่มปุ่ม "Pack & Ship"
- [ ] **Trigger Logic:** เมื่อกด "Pack & Ship":
  1. Update status ใน Supabase เป็น `shipped`
  2. Call Loyverse API เพื่อตัด Stock ทันที

---

## 📝 Coding Guidelines (Strict)
1.  **Do not break existing `tanjai-pos` apps:** การแก้ไขต้องไม่กระทบ `apps/web` หรือ `apps/erp` เดิม
2.  **Use Shared Packages:** ห้ามสร้าง UI Component พื้นฐานใหม่ ให้ import จาก `packages/ui` เท่านั้น
3.  **Type Safety:** ทุกส่วนต้องเป็น Strict TypeScript
4.  **Supabase RLS:** ทุก query ต้องผ่าน RLS Policy ห้ามใช้ Service Role key ใน Client side

## 🔗 Reference Files
- Structure: `tanjai-pos/apps/web`
- UI Components: `tanjai-pos/packages/ui`
- Database: `tanjai-pos/packages/database`
- KDS Logic: `tanjai-pos/apps/web/src/features/kds`

---

**Start the mission by initializing `apps/tanjai-2525` structure first.**