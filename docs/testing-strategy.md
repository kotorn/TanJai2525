# 🧪 Testing Strategy (กลยุทธ์การทดสอบ)

## Overview (ภาพรวม)
We aim for a balanced testing pyramid:
เราเน้นการทดสอบที่สมดุล 3 ระดับ:
1. **Unit Tests** (Fast, Isolated) - ทดสอบระดับย่อย
2. **Integration Tests** (Component interactions) - ทดสอบการทำงานร่วมกัน
3. **E2E Tests** (Critical User Flows) - ทดสอบการใช้งานจริงตั้งแต่ต้นจนจบ

## 1. Unit Testing (Jest / Vitest)
**การทดสอบระดับย่อย**

- **Scope**: Utility functions, hooks, helper classes.
- **Tool**: `Vitest` (preferred for Vite/Next.js ecosystem).
- **Naming**: `filename.test.ts`.

### What to test? (ทดสอบอะไรบ้าง?)
- Price calculation logic (Tax, discounts). (การคำนวณราคา)
- Data transformation helpers. (การแปลงข้อมูล)
- Validation functions. (การตรวจสอบความถูกต้อง)

## 2. Integration Testing (React Testing Library)
**การทดสอบการทำงานร่วมกัน**

- **Scope**: Reusable UI components, Forms.
- **Tool**: `@testing-library/react`.

### Best Practices (ข้อแนะนำ)
- Test **behavior**, not implementation details. (ทดสอบพฤติกรรม ไม่ใช่โค้ดภายใน)
- Use `screen.getByRole` to query elements (promotes accessibility). (ค้นหาด้วย Role เพื่อรองรับ Accessibility)
- Mock network requests (Supabase calls) using `msw` or simple jest mocks. (จำลองการเรียก API)

## 3. End-to-End (E2E) Testing (Playwright)
**การทดสอบแบบ End-to-End**

- **Scope**: Critical user journeys that MUST work. (เส้นทางการใช้งานหลักที่ต้องห้ามพัง)
- **Tool**: Playwright.

### Critical Flows to Cover (เส้นทางสำคัญ)
1. **Authentication**: Login, Logout, Password Reset.
2. **POS Transaction**: Add item -> Checkout -> Payment Success.
3. **Offline Mode**: Disconnect network -> Create Order -> Reconnect -> Verify Sync.

### Running E2E Locally (การรันเทสบนเครื่อง)
```bash
npx playwright test -c apps/web/playwright.config.ts
```

## 4. Manual QA Checklist (รายการตรวจสอบด้วยคน)
Before a major release, verify:
ก่อนปล่อยเวอร์ชันใหญ่ ต้องตรวจสอบ:
- [ ] Responsive Design (Mobile, Tablet, Desktop). (รองรับทุกขนาดหน้าจอ)
- [ ] Dark/Light mode consistency. (ธีมมืด/สว่าง)
- [ ] Error handling (Network disconnect, Server error). (การจัดการข้อผิดพลาด)
- [ ] Accessibility (Keyboard navigation, Screen reader). (การใช้งานสำหรับผู้พิการ)
