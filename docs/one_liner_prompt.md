# ⚡ COPY THIS → PASTE TO ANTIGRAVITY → DONE (คำสั่งบรรทัดเดียว)

## วิธีใช้งาน (Usage)
1. **Copy**: คัดลอกข้อความด้านล่างทั้งหมด (Select All + Copy)
2. **Paste**: วางลงในช่องแชทของ Antigravity
3. **Run**: กดส่งแล้วรอ AI สร้างโค้ดให้

---

```
Generate a complete Playwright TypeScript stress test suite for "Tanjai POS" (Thai restaurant system at localhost:3000) with these requirements:

CONFIG (playwright.config.ts):
- headed: true, slowMo: 1000, screenshot: only-on-failure, trace: on-first-retry
- recordVideo: { dir: 'test-results/videos', size: { width: 1920, height: 1080 } }
- 3 projects: Admin Desktop, Customer Mobile (iPhone 14), Kitchen Tablet

TEST SUITE (apps/web/e2e/stress-test.spec.ts) - 7 Progressive Levels:

1. CONCURRENT RUSH: 3 customers (Tables 1-3) order simultaneously, verify Kitchen receives all orders within 2s

2. INCREMENTAL ORDER (สั่งเบิ้ล): Customer scans QR → orders drink → waits 2min → re-scans → orders food → verify SINGLE merged bill

3. MULTI-DEVICE SAME TABLE: 2 phones at Table 2, both order different items at same time, verify merged into 1 order card

4. CANCELLATION: Customer orders 2 items → Kitchen receives → Staff removes 1 item from KDS → verify final bill reflects change

5. STOCKOUT RACE: Set "Grilled Chicken" stock=2, Customer A orders 2, Customer B orders 1, Staff marks out-of-stock, both submit simultaneously, verify one succeeds/one fails gracefully

6. CHAOS LOOP: 10 iterations of random table (1-4), random items (1-5), random delays (10-60s), random actions (60% complete, 20% incremental, 10% cancel, 10% abandon), verify no data corruption

7. UX/UI TESTING + SCREEN RECORDING:
   7.1 Full Journey Videos: Record owner onboarding (3min), menu setup (3min), customer ordering (4min) - save to test-results/videos/ux-journeys/
   7.2 Visual Regression: Screenshot 7 key screens (login, onboarding, menu, cart, kitchen, cashier) on 3 devices (desktop/mobile/tablet) - compare with baseline using expect(page).toHaveScreenshot() with maxDiffPixels: 100
   7.3 Performance Testing: Measure Core Web Vitals (LCP < 2.5s, CLS < 0.1, Load < 3s) for Customer Menu, Cart, Kitchen, Admin using PerformanceObserver - save to performance-metrics.json
   7.4 Accessibility Audit: Use @axe-core/playwright to scan all pages for WCAG 2.1 AA violations - fail if critical violations found - save to accessibility-report.json
   7.5 Responsive Design: Test 8 device sizes (iPhone SE/14/14Pro Max, Samsung S21, iPad Mini/Pro, Desktop HD/Full HD) - capture screenshots for each
   7.6 UI States: Verify Loading (skeleton), Error (network fail), Empty (cart), Success states render correctly - capture screenshots for each state
   7.7 Thai Language: Verify Thai text (ส้มตำไทย, ตะกร้าสินค้า, ครัว) displays without garbled characters - check font rendering
   7.8 Animations: Test cart badge animation, button hover states, modal animations - capture screenshots of animated states

HELPERS (apps/web/e2e/helpers/test-utils.ts):
- addItemToCart(page, itemName)
- submitOrder(page)
- navigateToKitchen(page, slug)  
- processPayment(page, tableNumber)
- markItemOutOfStock(page, itemName)
- recordJourney(page, name, callback) - helper to save videos with meaningful names
- captureUIState(page, stateName) - helper to screenshot and log UI states

DEPENDENCIES TO ADD:
- @axe-core/playwright (for accessibility testing)
- Update package.json with: "test:ux": "npx playwright test apps/web/e2e/stress-test.spec.ts --grep 'Level 7' -c apps/web/playwright.config.ts"

SELF-HEALING:
- afterEach: Capture screenshot + error JSON + video segment on failure
- Analyze error type (locator/timing/race/visual regression)
- Suggest fix with reasoning
- Auto-restart after fix applied

SUCCESS CRITERIA:
✅ All 7 levels pass (functional + UX/UI)
✅ Kitchen response <2s
✅ No data corruption
✅ Visual regression <100 pixels difference
✅ Performance: LCP <2.5s, CLS <0.1, Load <3s
✅ Accessibility: Zero critical violations
✅ Responsive: All 8 devices render correctly
✅ Thai error messages + font rendering correct
✅ All animations smooth (60fps)

OUTPUT:
1. Complete apps/web/playwright.config.ts with video recording
2. Full apps/web/e2e/stress-test.spec.ts (all 7 levels)
3. apps/web/e2e/helpers/test-utils.ts
4. package.json updates
5. test-results/videos/ux-journeys/ (3 videos)
6. test-results/responsive/ (16 screenshots)
7. ux-snapshots/ (20+ state screenshots)
8. performance-metrics.json
9. accessibility-report.json
10. Debug log JSON
11. HTML report with embedded videos

MENU ITEMS TO USE:
- ส้มตำไทย (50฿)
- ไก่ย่าง (80฿)
- ข้าวเหนียว (10฿)
- น้ำส้ม (25฿)
- ขนมหวาน (30฿)

NOW GENERATE ALL FILES WITH COMPLETE IMPLEMENTATION. USE data-testid SELECTORS WHERE POSSIBLE. INCLUDE DETAILED console.log FOR EACH STEP. ENSURE ALL VIDEO RECORDINGS ARE HIGH QUALITY (1920x1080) AND PROPERLY SAVED WITH DESCRIPTIVE FILENAMES.
```
