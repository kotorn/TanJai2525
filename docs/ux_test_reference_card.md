# 📋 UX/UI Testing Quick Reference Card (การ์ดช่วยจำสำหรับการทดสอบ UX/UI)

## 🎯 สรุป LEVEL 7: UX/UI Tests

### 📹 7.1 Full Journey Videos (วิดีโอการใช้งานจริง)
**Duration:** 8-10 minutes total  
**Output:** 3 video files (~135 MB)

| Journey | Duration | File Size | Key Moments |
|---------|----------|-----------|-------------|
| Owner Onboarding | 2-3 min | ~45 MB | Login → Create Restaurant → Success |
| Menu Setup | 2-3 min | ~38 MB | Add 3 Items → Upload Photos → Publish |
| Customer Ordering | 3-4 min | ~52 MB | Scan QR → Browse → Add to Cart → Submit → Success |

**Use Cases (กรณีใช้งาน):**
- 📊 Demo to stakeholders (นำเสนอผู้ถือหุ้น)
- 📚 User documentation (ทำคู่มือผู้ใช้)
- 🐛 Bug reproduction evidence (หลักฐานแจ้งบั๊ก)
- ✅ QA approval (ใช้อนุมัติงาน QA)

---

### 📸 7.2 Visual Regression (ตรวจสอบความผิดปกติของหน้าจอ)
**Total Screenshots:** 21 images  
**Coverage:** 7 screens × 3 devices

| Screen | Desktop | Mobile | Tablet |
|--------|---------|--------|--------|
| Login Page | ✅ | ✅ | ✅ |
| Onboarding Form | ✅ | ✅ | ✅ |
| Menu Management | ✅ | ✅ | ✅ |
| Customer Menu | ✅ | ✅ | ✅ |
| Cart View | ✅ | ✅ | ✅ |
| Kitchen Display | ✅ | ✅ | ✅ |
| Cashier Dashboard | ✅ | ✅ | ✅ |

**Detection:** Max 100 pixels difference allowed (ยอมให้เพี้ยนได้ไม่เกิน 100 พิกเซล)
**Tolerance:** 20% threshold

---

### ⚡ 7.3 Performance Testing (ทดสอบประสิทธิภาพ)
**Metrics Tracked:** 4 pages, 3 metrics each

| Page | Load Time | LCP | CLS | Status |
|------|-----------|-----|-----|--------|
| Customer Menu | <3s | <2.5s | <0.1 | ✅ |
| Cart | <3s | <2.5s | <0.1 | ✅ |
| Kitchen Display | <3s | <2.5s | <0.1 | ✅ |
| Admin Dashboard | <3s | <2.5s | <0.1 | ✅ |

**Output File:** `performance-metrics.json`

---

### ♿ 7.4 Accessibility Audit (ตรวจสอบการเข้าถึง)
**Standard:** WCAG 2.1 Level AA  
**Tool:** axe-core/playwright

**Violation Severity (ระดับความรุนแรง):**
- 🔴 **Critical:** MUST fix (fail test) - ต้องแก้ทันที (Test ตก)
- 🟠 **Serious:** Should fix (logged) - ควรแก้ (บันทึกไว้)
- 🟡 **Moderate:** Nice to have - แก้ก็ดี
- 🔵 **Minor:** Optional - เสริม

**Common Issues Checked (ปัญหาที่พบบ่อย):**
- Missing alt text on images (ลืมใส่คำอธิบายรูป)
- Insufficient color contrast (สีตัวหนังสือจางไป)
- Missing form labels (ลืมใส่ป้ายกำกับฟอร์ม)
- Keyboard navigation barriers (ใช้คีย์บอร์ดกดไม่ได้)

**Output File:** `accessibility-report.json`

---

### 📱 7.5 Responsive Design (ทดสอบขนาดหน้าจอต่างๆ)
**Devices Tested:** 8 viewports

| Category | Device | Resolution |
|----------|--------|------------|
| **Small** | iPhone SE | 375×667 |
| **Medium** | iPhone 14 | 390×844 |
| **Large** | iPhone 14 Pro Max | 430×932 |
| **Android** | Samsung S21 | 360×800 |
| **Tablet Small** | iPad Mini | 768×1024 |
| **Tablet Large** | iPad Pro | 1024×1366 |
| **Desktop** | HD | 1440×900 |
| **Desktop** | Full HD | 1920×1080 |

**Output:** 16 screenshots (2 pages × 8 devices)

---

### 🎨 7.6 UI State Testing (ทดสอบสถานะ UI)
**States Verified:** 4 critical states

| State | Trigger | Expected Behavior |
|-------|---------|-------------------|
| **Loading** | Network delay (3s) | Skeleton loader appears (แสดงโครงร่างโหลด) |
| **Empty** | No cart items | "Cart is empty" message (แสดงข้อความตะกร้าว่าง) |
| **Error** | API failure | Error message in Thai (แสดงข้อความ Error ภาษาไทย) |
| **Success** | Order submitted | Success message + order number (แสดงจอสำเร็จ + เลขออเดอร์) |

**Output:** 4 screenshots in `ux-snapshots/state-*.png`

---

### 🌐 7.7 Thai Language Rendering (การแสดงผลภาษาไทย)
**Text Samples:**
- ส้มตำไทย
- ตะกร้าสินค้า
- ครัว
- จัดการเมนู

**Verification:**
- ✅ No garbled characters (ดอกบัว → ) - ห้ามเป็นภาษาต่างดาว
- ✅ Font renders correctly - ฟอนต์ถูกต้อง
- ✅ Line breaks respect Thai rules - ตัดคำถูกต้อง
- ✅ No Unicode issues - ไม่มีปัญหา Unicode

---

### 🎬 7.8 Animation Testing (ทดสอบอนิเมชัน)
**Interactions Tested:**

| Element | Interaction | Expected |
|---------|-------------|----------|
| Cart Badge | Item added | Bounce animation (เด้งดึ๋ง) |
| Add Button | Hover | Color change + scale (เปลี่ยนสี + ขยาย) |
| Modal | Open/Close | Fade + slide animation (จาง + เลื่อน) |
| Toast | Show | Slide in from top (เลื่อนลงมาจากบน) |

**Frame Rate:** 60fps target  
**No Jank:** Smooth transitions (ต้องลื่นไหล ไม่กระตุก)

---

## 🚀 Quick Commands (คำสั่งด่วน)

### Run Full Suite
```bash
npx playwright test apps/web/e2e/stress-test.spec.ts --headed -c apps/web/playwright.config.ts
```

### Run Only UX Tests
```bash
npx playwright test apps/web/e2e/stress-test.spec.ts --grep "Level 7" --headed -c apps/web/playwright.config.ts
```

### View Results
```bash
# HTML Report (with videos)
npx playwright show-report apps/web/playwright-report
```

---

## 📊 Interpreting Results (การอ่านผลลัพธ์)

### ✅ PASS Criteria (เกณฑ์ผ่าน)

**Functional (Levels 1-6):**
- Zero data corruption (ข้อมูลไม่ผิดพลาด)
- All orders processed correctly (ออเดอร์ครบถ้วน)
- Kitchen response <2s (ครัวได้รับออเดอร์ใน 2 วิ)
- Payments match orders (ยอดเงินตรง)

**UX/UI (Level 7):**
- Visual regression: <100 pixels diff (ภาพเพี้ยนไม่เกิน 100 จุด)
- Performance: All metrics within threshold (ความเร็วผ่านเกณฑ์)
- Accessibility: Zero critical violations (ไม่มีปัญหา Accessibility ร้ายแรง)
- Responsive: All layouts intact (หน้าจอไม่พังในมือถือ)
- Thai text: No garbled characters (ภาษาไทยอ่านรู้เรื่อง)
- Animations: Smooth (60fps) (อนิเมชันลื่น)

---

## 🆘 Troubleshooting (การแก้ปัญหาเบื้องต้น)

### Problem: Videos not recording (วิดีโอไม่บันทึก)
```typescript
// Check context creation
const context = await browser.newContext({
  recordVideo: { dir: 'test-results/videos' } // ✅ ต้องตั้งค่าตรงนี้
});
```

### Problem: Screenshots differ (ภาพไม่ตรงกัน)
```bash
# Accept new baseline (ยอมรับภาพปัจจุบันเป็นค่ามาตรฐานใหม่)
npx playwright test --update-snapshots
```

### Problem: Performance metrics missing (ไม่เห็นค่าความเร็ว)
```typescript
// Ensure PerformanceObserver runs
await page.waitForTimeout(3000); // Wait for metrics (รอให้วัดผลเสร็จ)
```

---

## 🎬 Ready to Start?

**Copy Master Prompt → Paste to Antigravity → Get ALL tests + UX validation! 🚀**
**เริ่มเลย! ก๊อปปี้ Master Prompt แล้ววางให้ Antigravity ทำงานให้คุณ**
