# 🔌 API Integration Guide (คู่มือการเชื่อมต่อ API)

## Overview (ภาพรวม)
This guide defines standards for creating internal API routes and integrating with external services.
คู่มือนี้กำหนดมาตรฐานสำหรับการสร้าง API ภายในและการเชื่อมต่อกับบริการภายนอก

## 1. Internal API Routes (Next.js App Router)
**เส้นทาง API ภายใน**

Located in `apps/web/app/api/...`.
ไฟล์อยู่ที่ `apps/web/app/api/...`

### Standards (มาตรฐาน)
- **RESTful Design**: Use standard HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`).
- **Response Format** (รูปแบบการตอบกลับ):
  ```json
  {
    "data": { ... },     // Success payload (ข้อมูลเมื่อสำเร็จ)
    "error": null        // Error details if any (ข้อผิดพลาดถ้ามี)
  }
  ```
- **Error Handling** (การจัดการข้อผิดพลาด):
  - 200: OK (สำเร็จ)
  - 400: Bad Request (คำขอไม่ถูกต้อง)
  - 401: Unauthorized (ไม่มีสิทธิ์)
  - 403: Forbidden (ถูกห้ามเข้าถึง)
  - 500: Internal Server Error (ข้อผิดพลาดจากเซิร์ฟเวอร์)

### Authentication (การยืนยันตัวตน)
- All API routes must verify the Supabase session:
  API ทั้งหมดต้องตรวจสอบ Session ของ Supabase:
  ```ts
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  ```

## 2. External Integrations (การเชื่อมต่อภายนอก)

### Rate Limiting (การจำกัดจำนวนคำขอ)
- Use `upstash/ratelimit` or similar middleware if exposing APIs to third parties.
- Standard limit: 100 requests / minute / IP. (100 คำขอ/นาที/ไอพี)

### Webhooks
- **Stripe/Payment Gateways**:
  - Endpoint: `/api/webhooks/stripe`.
  - Security: Verify signature header to ensure authenticity. (ตรวจสอบลายเซ็นเพื่อความปลอดภัย)
  - Idempotency: Handle duplicate webhook events gracefully. (รองรับเหตุการณ์ซ้ำซ้อน)

## 3. Deprecation Policy (นโยบายการเลิกใช้งาน)
- Do not make breaking changes to stable API versions. (ห้ามเปลี่ยนแปลงที่ส่งผลกระทบต่อเวอร์ชันเสถียร)
- If a breaker is needed, introduce a new version path (e.g., `/api/v2/...`). (ถ้าจำเป็นต้องเปลี่ยน ให้สร้างเวอร์ชันใหม่)

## 4. Documentation (เอกสาร)
- Use OpenAPI/Swagger if public API surface grows.
- Keep this guide updated with new endpoints. (อัปเดตคู่มือนี้เสมอเมื่อมี API ใหม่)
