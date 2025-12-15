# 🔒 Tanjai POS Security Audit Checklist (รายการตรวจสอบความปลอดภัย)

## 1. Frontend Security (Next.js & React)

- [ ] **Content Security Policy (CSP)**
  - [ ] Implement strict CSP headers in `next.config.ts` or middleware.
  - [ ] mitigate XSS by restricting script sources (e.g., `script-src 'self'`). (ป้องกัน XSS โดยจำกัดแหล่งที่มาของสคริปต์)
- [ ] **Input Sanitization (การกรองข้อมูลนำเข้า)**
  - [ ] Ensure all user inputs are validated using Zod schemas before processing. (ตรวจสอบข้อมูลด้วย Zod เสมอ)
  - [ ] Use React's built-in escaping to prevent XSS (avoid `dangerouslySetInnerHTML`). (หลีกเลี่ยง `dangerouslySetInnerHTML`)
- [ ] **Authentication State**
  - [ ] Verify Supabase session persistence is secure. (ตรวจสอบความปลอดภัยของการเก็บ Session)
  - [ ] Handle token expiration gracefully. (จัดการเมื่อ Token หมดอายุให้ดี)
- [ ] **Dependency Audit**
  - [ ] Run `npm audit` regularly to check for vulnerable packages. (ตรวจสอบช่องโหว่ของไลบรารีสม่ำเสมอ)

## 2. Backend & Database Security (Supabase)

- [ ] **Row Level Security (RLS)**
  - [ ] **CRITICAL**: Verify RLS is enabled on ALL tables (`ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`).
    **สำคัญมาก**: ต้องเปิด RLS ทุกตาราง
  - [ ] Test policies for all roles (Owner, Manager, Staff) to ensure no data leakage between tenants.
    ทดสอบ Policy ว่าข้อมูลร้านไม่รั่วไหลข้ามกัน
  - [ ] Ensure `service_role` key is NEVER exposed to the client.
    ห้ามเปิดเผย `service_role` key ให้ฝั่ง Client เด็ดขาด
- [ ] **Authentication & Authorization**
  - [ ] Enforce strong password policies. (บังคับรหัสผ่านที่ปลอดภัย)
  - [ ] Enable MFA (if applicable for admin accounts). (เปิด 2-Factor Auth ถ้าทำได้)
  - [ ] Validate standard email confirmation flows.
- [ ] **Database Hardening**
  - [ ] Restrict direct database access; use connection pooling (Supavisor) properly.
  - [ ] Review PostgreSQL extensions; enable only what is necessary.

## 3. Infrastructure & Deployment (Vercel)

- [ ] **Environment Variables**
  - [ ] `NEXT_PUBLIC_` prefix used ONLY for non-sensitive data.
    ใช้ `NEXT_PUBLIC_` เฉพาะข้อมูลที่ไม่เป็นความลับ
  - [ ] Service keys (Supabase Service Role, Stripe Secret) stored in Vercel Encrypted Environment Variables.
- [ ] **Protection features**
  - [ ] Enable Vercel Attack Challenge Mode or Firewall if required.
- [ ] **Logging & Monitoring**
  - [ ] Set up log drains if needed for audit trails.
  - [ ] Monitor for unusual spike in calls to sensitive API endpoints. (เฝ้าระวังการเรียก API ที่ผิดปกติ)

## 4. Compliance & Data Privacy (ความถูกต้องตามกฎหมาย)

- [ ] **PDPA / GDPR**
  - [ ] Ensure user consent forms are present for data collection. (มีฟอร์มขอความยินยอม)
  - [ ] mechanism for users to request data deletion. (มีระบบลบข้อมูลผู้ใช้ตามคำขอ)
- [ ] **Payments (การชำระเงิน)**
  - [ ] If handling payments, ensure PCI-DSS compliance (use Stripe Elements/SDKs to avoid handling raw card data).
    ห้ามเก็บข้อมูลบัตรเครดิตเอง ให้ใช้ SDK ของผู้ให้บริการ
