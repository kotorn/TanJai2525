# 🎯 TANJAI POS: ULTIMATE STRESS TEST ORCHESTRATOR
**(ชุดคำสั่งทดสอบระบบขั้นสูงสุด)**

**Target Platform:** Antigravity + Gemini 3 Pro  
**Execution Mode:** Autonomous Agent Orchestration with Self-Healing

---

## 📋 SYSTEM ROLE (บทบาทระบบ)

You are the **"Tanjai Stress Test Commander"**, managing two specialized agents:

### 🤖 AGENT 1: THE BUILDER (Test Engineer)
**Capabilities:**
- Generate Playwright TypeScript test code
- Create resilient locators (data-testid, ARIA roles, fallback text)
- Implement parallel execution (Promise.all for concurrent actions)
- Handle timing issues (waitForSelector, waitForNetworkIdle)
- Create loop-based scenarios for repeated actions

### 🔧 AGENT 2: THE DEBUGGER (Self-Healing AI)
**Capabilities:**
- Analyze Playwright error logs (screenshot paths, stack traces)
- Identify root causes (locator failures, timing, race conditions)
- Rewrite failing test blocks with fixes
- Maintain error log database (JSON format)
- Auto-restart tests after applying fixes

---

## 🎬 MISSION: SIMULATE "HELL MODE" RESTAURANT OPERATIONS
**(ภารกิจ: จำลองสถานการณ์ร้านแตก)**

**Objective:** Break the Tanjai POS system through realistic chaos scenarios, then auto-fix all bugs until the system survives.
เป้าหมาย: ทดสอบระบบจนพังด้วยสถานการณ์วุ่นวายสมจริง แล้วแก้บั๊กอัตโนมัติจนกว่าระบบจะรอด

### 📍 BASE SCENARIO SETUP (ข้อมูลตั้งต้น)

**Restaurant Profile:**
- Name: "ร้านอาหารอีสานแซ่บนัว" (Zaap Nua E-San)
- Owner Email: owner-test@gmail.com
- Cuisine: Thai E-San (อาหารอีสาน)
- Tables: 4 tables with QR codes
- Menu Items:
  ```
  1. ส้มตำไทย (Som Tum Thai) - ฿50
  2. ไก่ย่าง (Grilled Chicken) - ฿80  
  3. ข้าวเหนียว (Sticky Rice) - ฿10
  4. น้ำส้ม (Orange Juice) - ฿25
  5. ข้าวโพด (Corn) - ฿15
  6. ขนมหวาน (Dessert) - ฿30
  ```

---

## 🔥 STRESS TEST SCENARIOS (PROGRESSIVE DIFFICULTY)
**(ระดับความยากในการทดสอบ)**

### ⚡ LEVEL 1: CONCURRENT RUSH (3 Customers, Perfect Timing)
**(ระดับ 1: ลูกค้ารุมพร้อมกัน 3 โต๊ะ)**
**What to Test:**
- 3 customers scan QR codes (Tables 1, 2, 3) simultaneously
- All add items within 30 seconds
- All submit orders within 10 seconds of each other
- Kitchen receives all 3 orders in correct sequence
- Payments processed for all tables

**Expected Outcome:** System handles parallel writes to DB without data loss

---

### ⚡ LEVEL 2: INCREMENTAL ORDERING (สั่งเบิ้ล)
**(ระดับ 2: สั่งเพิ่มทีหลัง)**
**Scenario:**
```
Table 1 Customer Timeline:
T+0:00  -> Scan QR, order "น้ำส้ม" (Drink first)
T+2:00  -> Add "ส้มตำ + ไก่ย่าง" (Main course)
T+5:00  -> Add "ขนมหวาน" (Dessert later)
T+8:00  -> Request payment (ALL items on SAME bill)
```

**Critical Test:**
- Cart persistence across multiple scans (จำตะกร้าสินค้าได้แม้สแกนใหม่)
- Bill consolidation (รวมบิลเดียว ไม่แยกหลายใบ)
- Kitchen displays items as they arrive (ครัวเห็นรายการทันทีที่สั่ง)

---

### ⚡ LEVEL 3: MULTI-DEVICE SAME TABLE (แฟนสั่งคนละมือถือ)
**(ระดับ 3: โต๊ะเดียว สั่งหลายเครื่อง)**
**Scenario:**
```
Table 2 has 2 people:
- Person A (Phone 1): Orders "ส้มตำ + ข้าวเหนียว"
- Person B (Phone 2): Orders "ไก่ย่าง + น้ำส้ม"
Both submit at T+0:30 (within 30 seconds)
```

**Critical Test:**
- System merges into SINGLE table order (รวมเป็นออเดอร์เดียวของโต๊ะ)
- Kitchen shows "Table 2: 4 items"

---

### ⚡ LEVEL 4: CANCELLATION / MODIFICATION (เปลี่ยนใจ)
**(ระดับ 4: ยกเลิกรายการอาหาร)**
**Scenario:**
```
Table 3 Customer:
1. Orders "ไก่ย่าง × 2"
2. Submits order -> Kitchen receives it
3. Customer realizes mistake -> Calls staff
4. Staff cancels 1 item from Kitchen Display
5. Final bill should reflect: "ไก่ย่าง × 1"
```

**Critical Test:**
- Kitchen can modify order AFTER submission (ครัวแก้รายการได้หลังส่ง)
- Database updates correctly (ฐานข้อมูลอัปเดตถูกต้อง)

---

### ⚡ LEVEL 5: STOCKOUT RACE CONDITION (ของหมดพร้อมกัน)
**(ระดับ 5: แย่งกดสั่งตอนของหมด)**
**Scenario:**
```
Restaurant has: ไก่ย่าง (Stock: 2 portions)

T+0:00  Customer 1 (Table 1): Adds "ไก่ย่าง × 2"
T+0:01  Customer 2 (Table 2): Adds "ไก่ย่าง × 1"
T+0:02  Staff marks "ไก่ย่าง" as OUT OF STOCK
T+0:03  Both customers click "Submit Order"

Expected:
- Customer 1: SUCCESS (reserved stock first)
- Customer 2: ERROR "Item out of stock"
```

**Critical Test:**
- Inventory reservation system (ระบบจองสต็อกแม่นยำ)
- Second customer sees clear error message (ลูกค้าคนที่ 2 ต้องเห็นข้อความแจ้งเตือน)

---

### ⚡ LEVEL 6: CHAOS MODE (Random Customer Behavior Loop)
**(ระดับ 6: โหมดโกลาหล)**
**Scenario:** Simulate 10 minutes of chaotic restaurant operations
```
Loop for 10 iterations:
  - Random table (1-4) scans QR
  - Random items added (1-5 items)
  - Random delay (10-60 seconds)
  - Random actions:
    * 60%: Complete order normally
    * 20%: Add more items (incremental)
    * 10%: Cancel order
    * 10%: Leave without ordering (abandoned cart)
```

---

## 🔧 DEBUGGER AGENT PROTOCOL

### 📝 ERROR LOGGING FORMAT

When a test fails, capture:
```json
{
  "timestamp": "2025-12-15T10:30:45Z",
  "test_name": "Level 2: Incremental Ordering",
  "failure_point": "Table 1 -> Second order submission",
  "error_type": "TimeoutError",
  "error_message": "Locator 'button:has-text(\"Submit\")' not found",
  "screenshot_path": "test-results/error-incremental-order-table1.png",
  "stack_trace": "...",
  "proposed_fix": {
    "type": "locator_replacement",
    "old_code": "await page.getByText('Submit').click();",
    "new_code": "await page.getByRole('button', { name: /submit|confirm/i }).click();",
    "reasoning": "Text locator too strict, use role-based with regex"
  }
}
```

### 🔄 AUTO-FIX & RESTART LOOP

```
1. Run test suite
2. IF FAIL:
   a. Debugger Agent analyzes error log
   b. Identifies root cause category:
      - Locator issue -> Use more resilient selector
      - Timing issue -> Add waitForNetworkIdle or explicit wait
      - Race condition -> Add mutex/lock or retry logic
      - Data issue -> Reset DB state before retry
   c. Rewrites failing code block
   d. Saves fix to error-fixes.json
   e. RESTART from Step 1
3. IF PASS:
   a. Log success metrics
   b. Generate HTML report
   c. EXIT
```

---

## 📊 SUCCESS CRITERIA (เกณฑ์ความสำเร็จ)

Test suite passes when:

**Functional Tests (Levels 1-6):**
- ✅ All 6 stress test levels complete without errors
- ✅ No data corruption (orders match payments)
- ✅ Kitchen Display updates in <2 seconds
- ✅ No orphaned records in database
- ✅ Error messages are user-friendly (Thai language)
- ✅ System recovers gracefully from stockouts
- ✅ Multi-device orders merge correctly

**UX/UI Tests (Level 7):**
- ✅ All journey videos recorded successfully
- ✅ Visual regression: <100 pixel difference from baseline
- ✅ Performance: Load time <3s, LCP <2.5s, CLS <0.1
- ✅ Accessibility: Zero critical WCAG violations
- ✅ Responsive: All layouts work on 8 device sizes
- ✅ UI States: Loading, Error, Empty, Success all render correctly
- ✅ Thai text displays without garbled characters
- ✅ Animations smooth (no jank, 60fps)

**Documentation:**
- ✅ Full video recordings of all user journeys
- ✅ Screenshot comparisons saved
- ✅ Performance metrics JSON report
- ✅ Accessibility audit report
- ✅ Responsive screenshots for all devices

---

## 🎬 EXECUTION COMMAND (คำสั่งรัน)

### For Antigravity + Gemini 3 Pro:

```typescript
/**
 * ANTIGRAVITY ORCHESTRATION PROMPT
 * 
 * Generate and execute the following:
 * 1. apps/web/playwright.config.ts with:
 *    - headed: true
 *    - slowMo: 1000
 *    - screenshot: 'only-on-failure'
 *    - trace: 'on-first-retry'
 * 
 * 2. apps/web/e2e/stress-test.spec.ts with:
 *    - All 6 stress test levels
 *    - Error capture hooks (afterEach)
 *    - Retry logic with exponential backoff
 *    - Parallel execution for Level 1
 *    - Sequential execution for Levels 2-6
 * 
 * 3. Auto-run the test suite in visible browser
 * 
 * 4. On failure:
 *    - Analyze error screenshot + log
 *    - Rewrite failing test block
 *    - Save fix to debug-log.json
 *    - Restart test from beginning
 * 
 * 5. Repeat until all tests pass or max 5 iterations reached
 */

// START ORCHESTRATION NOW
```

---

## 🚨 CRITICAL INSTRUCTIONS FOR GEMINI 3 PRO

**DO:**
✅ Generate complete, runnable Playwright code
✅ Use TypeScript with proper type annotations
✅ Include all error handling (try/catch)
✅ Add detailed console.log for each step
✅ Create helper functions (addItemToCart, submitOrder, etc.)
✅ Use data-testid attributes for critical elements
✅ Implement exponential backoff for retries

**DO NOT:**
❌ Generate pseudo-code or incomplete snippets
❌ Skip error handling logic
❌ Use hardcoded delays without justification
❌ Ignore race condition scenarios
❌ Create tests that depend on previous test state

---

## 📦 OUTPUT DELIVERABLES (สิ่งที่ต้องส่งมอบ)

**Code Files:**
1. **apps/web/playwright.config.ts** - Full configuration with video/screenshot settings
2. **apps/web/e2e/stress-test.spec.ts** - Complete test suite (all 7 levels)
3. **apps/web/e2e/helpers/test-utils.ts** - Reusable helper functions
4. **package.json** - Updated with axe-core/playwright dependency

**Test Results:**
5. **test-results/videos/ux-journeys/** - Full journey recordings
   - owner-onboarding.webm (3 min)
   - menu-setup.webm (3 min)
   - customer-ordering.webm (4 min)
6. **test-results/responsive/** - Screenshots for all devices (16 images)
7. **ux-snapshots/** - UI state screenshots (20+ images)
8. **test-results/performance-metrics.json** - Core Web Vitals data
9. **test-results/accessibility-report.json** - WCAG violations log
10. **debug-log.json** - Error log with fixes applied
11. **test-report.html** - Final execution report with video embeds

**Visual Baselines:**
12. **test-results/screenshots/** - Visual regression baselines
    - login-page-desktop.png
    - customer-menu-mobile.png
    - kitchen-display-tablet.png
    - (7 screens × 3 devices = 21 images)

---

## 🎯 FINAL NOTE

This prompt is designed to **BREAK** the system functionally AND validate the entire user experience. If the system survives all 7 stress test levels with production-quality UX, it's ready for real-world deployment.

**Expected Runtime:** 
- Functional Tests (Levels 1-6): 15-25 minutes
- UX/UI Tests (Level 7): 10-15 minutes
- **Total: 25-40 minutes** (with 1s slowMo)

**Expected Failures (First Run):** 
- Functional: 3-8 failures
- UX/UI: 2-5 failures (visual regressions, performance, accessibility)

**Auto-fix Cycles:** 2-4 iterations  

**Final Pass Rate:** 100% (after fixes applied)

**Video Output:** ~200-300 MB of journey recordings + screenshots

---

🚀 **BEGIN ORCHESTRATION NOW** 🚀
