# 🚀 คู่มือการใช้งาน Antigravity + Gemini 3 Pro

## 📋 ขั้นตอนการเริ่มต้น

### 1️⃣ เปิด Antigravity Editor
```
1. เข้าไปที่ Antigravity Console
2. เลือก Model: "Gemini 3 Pro"
3. เปิด "Start Conversation" หรือ "Editor Window"
```

### 2️⃣ วางคำสั่งหลัก (Master Prompt)
คัดลอก Prompt ด้านล่างนี้ทั้งหมด แล้ววางใน Chat Box:

```
🎯 EXECUTE TANJAI POS STRESS TEST

Context:
- Project: Tanjai POS (Thai Street Food Point of Sale)
- Tech Stack: Next.js 15, Supabase, Playwright
- Location: http://localhost:3000
- Database: Already seeded with schema

Your Mission (3-Part Agent Orchestration):

PART 1: GENERATE TEST CODE
Create a complete Playwright test suite in TypeScript:

File 1: playwright.config.ts
- headed: true (visible browser)
- slowMo: 1000 (1 second delay per action)
- screenshot: 'only-on-failure'
- trace: 'on-first-retry'
- projects: ['Admin', 'Customer Mobile', 'Kitchen Tablet']

File 2: e2e/stress-test.spec.ts
Implement these 6 stress test scenarios:

LEVEL 1: Concurrent Rush
- 3 customers scan QR simultaneously
- All submit orders within 10 seconds
- Verify: Kitchen receives 3 orders correctly

LEVEL 2: Incremental Ordering (สั่งเบิ้ล)
- Customer scans -> Orders drink -> Leaves
- Returns 2 minutes later -> Scans again -> Orders food
- Verify: SINGLE bill with both orders

LEVEL 3: Multi-Device Same Table
- 2 people at Table 2, different phones
- Both order simultaneously
- Verify: Merged into 1 order

LEVEL 4: Order Cancellation
- Customer orders 2 items
- Kitchen receives order
- Staff removes 1 item from KDS
- Verify: Final bill reflects change

LEVEL 5: Stockout Race
- Set "Grilled Chicken" stock = 2
- Customer A orders 2, Customer B orders 1
- Staff marks out-of-stock
- Both submit at same time
- Verify: One succeeds, one gets error

LEVEL 6: Chaos Loop (10 Iterations)
- Random table selection (1-4)
- Random actions (order/cancel/abandon)
- Random delays (10-60 seconds)
- Verify: No data corruption

File 3: helpers/test-utils.ts
Create reusable functions:
- addItemToCart(page, itemName)
- submitOrder(page)
- navigateToKitchen(page, slug)
- processPayment(page, tableNumber)
- markItemOutOfStock(page, itemName)

PART 2: RUN & OBSERVE
Execute: npx playwright test e2e/stress-test.spec.ts --headed

Monitor in visible browser:
- Log each step to console
- Capture screenshots on failure
- Save error details to JSON

PART 3: AUTO-DEBUG LOOP
IF test fails:
  1. Analyze error log + screenshot
  2. Identify root cause:
     - Locator failure? -> Use getByRole/getByTestId
     - Timing issue? -> Add waitForNetworkIdle
     - Race condition? -> Add mutex/lock
  3. Rewrite failing code block
  4. Save fix to debug-log.json
  5. RESTART from PART 2
REPEAT until all tests pass

SUCCESS CRITERIA:
✅ All 6 levels pass without errors
✅ No data corruption
✅ Kitchen updates in <2 seconds
✅ Error messages in Thai
✅ System recovers from stockouts

DELIVERABLES:
1. Complete Playwright config
2. Full stress test suite (all 6 levels)
3. Helper functions file
4. Debug log with applied fixes
5. Final HTML report

NOW GENERATE THE CODE AND START EXECUTION.
```

### 3️⃣ ให้ Antigravity สร้างโค้ด

Antigravity (Gemini 3 Pro) จะ:
1. ✅ สร้างไฟล์ `playwright.config.ts`
2. ✅ สร้างไฟล์ `e2e/stress-test.spec.ts` (ทั้ง 6 levels)
3. ✅ สร้างไฟล์ `helpers/test-utils.ts`
4. ✅ แสดงคำสั่ง Terminal ที่ต้องรัน

### 4️⃣ รันเทสผ่าน Browser

```bash
# เปิด Terminal แรก - Start Next.js
npm run dev

# เปิด Terminal ที่สอง - Run Playwright
npx playwright test e2e/stress-test.spec.ts --headed
```

**คุณจะเห็น:**
- 🌐 Browser เปิดขึ้นมา (visible)
- ⏱️ ทุก action ช้าลง 1 วินาที (สังเกตได้ง่าย)
- 📝 Console log แสดงทุกขั้นตอน
- 📸 Screenshot auto-save เมื่อ fail

### 5️⃣ เมื่อเจอ Error (Debugger Agent เข้าทำงาน)

**ตัวอย่าง Error Log:**
```
❌ Test Failed: Level 2 - Incremental Ordering

Error: Locator 'button:has-text("Submit")' not found
Screenshot: test-results/error-incremental-table1.png

Stack Trace:
  at Page.click (stress-test.spec.ts:145)
  at submitOrder (test-utils.ts:28)
```

**คัดลอกข้อความ Error นี้ แล้ววางกลับไปใน Antigravity Chat:**

```
🐛 DEBUGGER MODE ACTIVATED

Error Log:
[PASTE ERROR HERE]

Screenshot Location:
test-results/error-incremental-table1.png

ANALYZE & FIX THIS ERROR NOW.
```

**Antigravity จะ:**
1. 🔍 วิเคราะห์สาเหตุ
2. 🛠️ เขียนโค้ดแก้ไขใหม่
3. 📝 แสดงเฉพาะส่วนที่ต้องเปลี่ยน
4. 💡 อธิบายว่าทำไมต้องแก้

**ตัวอย่าง Output:**

```typescript
// ❌ OLD CODE (Failed)
await page.getByText('Submit').click();

// ✅ NEW CODE (Fixed)
await page.getByRole('button', { name: /submit|confirm|สั่งอาหาร/i }).click();

// 💡 REASONING:
// - Text locator 'Submit' too strict (may be 'Confirm Order' in Thai)
// - Use role-based selector with regex for language flexibility
// - Case-insensitive match handles Thai/English variations
```

### 6️⃣ แก้ไขโค้ดและรันใหม่

```bash
# แก้ไขไฟล์ตามที่ Antigravity บอก
nano e2e/stress-test.spec.ts

# ลบผลลัพธ์เก่า
rm -rf test-results

# รันใหม่
npx playwright test e2e/stress-test.spec.ts --headed
```

### 7️⃣ วนซ้ำจนกว่าจะ Pass ทั้งหมด

```
Run Test -> Fail -> Copy Error -> Paste to Antigravity -> Get Fix -> Apply -> Repeat
```

**Expected Iterations:**
- รอบที่ 1: Fail 5-8 tests (locator issues, timing)
- รอบที่ 2: Fail 2-4 tests (race conditions)
- รอบที่ 3: Fail 0-1 tests (edge cases)
- รอบที่ 4: ✅ ALL PASS

---

## 🎯 ตัวอย่างผลลัพธ์ที่คาดหวัง

### ✅ เมื่อทุกอย่าง Pass

```
🎊 ========================================
🎊 STRESS TEST COMPLETED SUCCESSFULLY!
🎊 ========================================

📊 Functional Tests (Levels 1-6):
  ✅ Level 1: Concurrent Rush - PASSED
  ✅ Level 2: Incremental Ordering - PASSED
  ✅ Level 3: Multi-Device Same Table - PASSED
  ✅ Level 4: Order Cancellation - PASSED
  ✅ Level 5: Stockout Race - PASSED
  ✅ Level 6: Chaos Loop (10 iterations) - PASSED

📊 UX/UI Tests (Level 7):
  ✅ 7.1: Full Journey Videos - PASSED
      - owner-onboarding.webm (2.8 min, 45 MB)
      - menu-setup.webm (2.5 min, 38 MB)
      - customer-ordering.webm (3.7 min, 52 MB)
  ✅ 7.2: Visual Regression - PASSED (0 failures)
  ✅ 7.3: Performance Testing - PASSED
      - Avg Load Time: 2.1s
      - Avg LCP: 1.8s
      - Avg CLS: 0.05
  ✅ 7.4: Accessibility Audit - PASSED
      - Critical Violations: 0
      - Serious Violations: 2 (non-blocking)
  ✅ 7.5: Responsive Design - PASSED (8/8 devices)
  ✅ 7.6: UI States - PASSED (4/4 states verified)
  ✅ 7.7: Thai Language - PASSED (no garbled text)
  ✅ 7.8: Animations - PASSED (smooth, 60fps)

📈 Overall Metrics:
  - Total Orders Processed: 25
  - Data Corruption: 0
  - Kitchen Response Time: 1.7s (average)
  - Error Recovery Rate: 100%
  - UX Score: 98/100

📦 Generated Artifacts:
  - Videos: 3 files (135 MB total)
  - Screenshots: 57 files (42 MB total)
  - Performance Report: performance-metrics.json
  - Accessibility Report: accessibility-report.json
  - Debug Log: debug-log.json

🎊 SYSTEM IS PRODUCTION-READY!
🎊 ========================================
```

### 📊 ดู Reports และ Videos

```bash
# เปิด HTML Report (มี embedded videos)
npx playwright show-report

# ดู Journey Videos แยก
open test-results/videos/ux-journeys/owner-onboarding.webm
open test-results/videos/ux-journeys/menu-setup.webm
open test-results/videos/ux-journeys/customer-ordering.webm

# ดู Performance Metrics
cat test-results/performance-metrics.json | jq

# ดู Accessibility Report
cat test-results/accessibility-report.json | jq

# ดู Responsive Screenshots
open test-results/responsive/
```

**HTML Report จะแสดง:**
- ✅ Pass/Fail status ทุก test
- 📸 Screenshots ของ failures
- 📹 **Videos ของ test runs** (embedded player)
- 📊 Performance metrics (charts)
- ♿ Accessibility violations (with fix suggestions)
- 📱 Responsive screenshots (side-by-side comparison)
- ⏱️ Execution timeline
- 🐛 Error details พร้อม stack trace

---

## 🆘 การแก้ปัญหาที่พบบ่อย

### ❌ ปัญหา: "Port 3000 already in use"
```bash
# ค้นหา process ที่ใช้ port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Start dev server ใหม่
npm run dev
```

### ❌ ปัญหา: "Supabase connection failed"
```bash
# ตรวจสอบ .env.local
cat .env.local

# ต้องมี 3 keys นี้:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### ❌ ปัญหา: "Playwright browsers not installed"
```bash
npx playwright install chromium
```

### ❌ ปัญหา: "Test timeout"
เพิ่ม timeout ใน config:
```typescript
// playwright.config.ts
timeout: 180 * 1000, // 3 minutes
```

---

## 🎓 Tips สำหรับการใช้ Antigravity

### ✅ DO (ทำ):
1. **ใช้คำสั่งชัดเจน**: "Generate complete code" ดีกว่า "Create something"
2. **ระบุ output format**: "TypeScript with types" ดีกว่า "code"
3. **ให้ context**: บอก tech stack, project structure
4. **ขอ explanation**: "Explain why this fix works"
5. **ทดสอบทีละขั้นตอน**: อย่ารันทั้งหมดพร้อมกันถ้ายังไม่แน่ใจ

### ❌ DON'T (ไม่ควรทำ):
1. ❌ ใช้คำสั่งคลุมเครือ: "Make it work" (Gemini งง)
2. ❌ วาง error log ยาวเกิน 10,000 ตัวอักษร (ตัดให้เหลือส่วนสำคัญ)
3. ❌ รัน test แบบ headless ตั้งแต่แรก (ควรเห็น browser ก่อน debug ง่ายกว่า)
4. ❌ Skip error handling (ต้องมี try/catch ทุก test block)
5. ❌ ใช้ hardcoded delay (ใช้ waitForSelector แทน sleep)

---

## 🎯 Expected Timeline

| Phase | Duration | Activity |
|-------|----------|----------|
| **Setup** | 5 min | Install dependencies (including @axe-core/playwright), configure Supabase |
| **Code Generation** | 10 min | Antigravity generates all files (including UX tests) |
| **First Run** | 25 min | Execute stress tests (Levels 1-7, will fail) |
| **Debug Cycle 1** | 15 min | Fix 7-12 errors (functional + UX) |
| **Debug Cycle 2** | 10 min | Fix 3-6 errors |
| **Debug Cycle 3** | 5 min | Fix 0-2 errors |
| **Final Validation** | 15 min | Full pass + report generation + video processing |
| **TOTAL** | **~85 min** | Until production-ready with full UX validation |

**Video Processing Time:** +5-10 min for encoding 3 journey videos (~200 MB total)

---

## 🎉 สรุป

คุณได้เทมเพลตที่:
1. ✅ Copy-paste ครั้งเดียว ใส่ Antigravity
2. ✅ สร้างโค้ด Playwright ครบทั้งระบบ (7 levels)
3. ✅ รันผ่าน Browser จริง (visible, slow motion)
4. ✅ Auto-debug เมื่อเจอ error
5. ✅ Loop จนกว่าจะ pass ทั้งหมด
6. ✅ ทุบระบบด้วย scenario สุดโหดร้าย (Hell Mode)
7. ✅ **อัดวิดีโอ Journey ครบ 3 เส้นทาง (Owner, Menu, Customer)**
8. ✅ **จับภาพหน้าจอเปรียบเทียบ (Visual Regression)**
9. ✅ **วัดประสิทธิภาพ (Performance Metrics)**
10. ✅ **ตรวจสอบ Accessibility (WCAG 2.1)**
11. ✅ **ทดสอบ Responsive ทุกขนาดหน้าจอ**
12. ✅ **ตรวจสอบ Thai Font Rendering**

**Artifacts ที่จะได้:**
```
test-results/
├── videos/
│   └── ux-journeys/
│       ├── owner-onboarding.webm      (2-3 min, ~45 MB)
│       ├── menu-setup.webm            (2-3 min, ~38 MB)
│       └── customer-ordering.webm     (3-4 min, ~52 MB)
├── responsive/
│   ├── iPhone-14-menu.png
│   ├── iPad-Pro-cart.png
│   └── Desktop-HD-kitchen.png
│   └── ... (16 total)
├── screenshots/                       (Visual regression baselines)
│   ├── login-page-desktop.png
│   ├── customer-menu-mobile.png
│   └── ... (21 total)
├── performance-metrics.json           (Load time, LCP, CLS data)
├── accessibility-report.json          (WCAG violations)
└── debug-log.json                     (Error fixes applied)

ux-snapshots/                          (UI state documentation)
├── 01-login-page.png
├── 02-onboarding-form.png
├── state-loading.png
├── state-error.png
└── ... (20+ images)

playwright-report/
└── index.html                         (Interactive report with embedded videos)
```

**Total Output Size:** ~250-300 MB (mostly videos)

**เริ่มได้เลย! วางใน Antigravity แล้วดู AI ทำงานอัตโนมัติ 🚀**

---

## 📹 พิเศษ: วิธีแชร์ผลลัพธ์

หลังจากรันเสร็จ คุณสามารถแชร์ผลลัพธ์ได้:

```bash
# รวมทุกอย่างเป็น ZIP
zip -r tanjai-test-results.zip test-results/ ux-snapshots/ playwright-report/

# อัปโหลดไปที่ (ตัวอย่าง):
# - Google Drive
# - Dropbox
# - AWS S3
# - หรือ internal file server

# แชร์ HTML Report (ไม่ต้องรัน server)
cd playwright-report
python3 -m http.server 8080
# เปิด: http://localhost:8080

# หรือ deploy ไป Vercel/Netlify
vercel deploy playwright-report/ --prod
```

**ใช้กรณี:**
- 📊 แสดงผล Stakeholders (เห็นวิดีโอ flow จริง)
- 🐛 รายงาน Bug (มีวิดีโอและ screenshot proof)
- 📚 Documentation (User Journey videos)
- ✅ QA Sign-off (ครบถ้วน evidence)

**เริ่มทดสอบเลย! 🎬**
