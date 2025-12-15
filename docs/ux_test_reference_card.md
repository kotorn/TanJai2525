# 📋 UX/UI Testing Quick Reference Card

## 🎯 สรุป LEVEL 7: UX/UI Tests

### 📹 7.1 Full Journey Videos
**Duration:** 8-10 minutes total  
**Output:** 3 video files (~135 MB)

| Journey | Duration | File Size | Key Moments |
|---------|----------|-----------|-------------|
| Owner Onboarding | 2-3 min | ~45 MB | Login → Create Restaurant → Success |
| Menu Setup | 2-3 min | ~38 MB | Add 3 Items → Upload Photos → Publish |
| Customer Ordering | 3-4 min | ~52 MB | Scan QR → Browse → Add to Cart → Submit → Success |

**Use Cases:**
- 📊 Demo to stakeholders
- 📚 User documentation
- 🐛 Bug reproduction evidence
- ✅ QA approval

---

### 📸 7.2 Visual Regression
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

**Detection:** Max 100 pixels difference allowed  
**Tolerance:** 20% threshold

---

### ⚡ 7.3 Performance Testing
**Metrics Tracked:** 4 pages, 3 metrics each

| Page | Load Time | LCP | CLS | Status |
|------|-----------|-----|-----|--------|
| Customer Menu | <3s | <2.5s | <0.1 | ✅ |
| Cart | <3s | <2.5s | <0.1 | ✅ |
| Kitchen Display | <3s | <2.5s | <0.1 | ✅ |
| Admin Dashboard | <3s | <2.5s | <0.1 | ✅ |

**Output File:** `performance-metrics.json`

**Example Data:**
```json
{
  "page": "Customer Menu",
  "loadTime": 2150,
  "lcp": 1843,
  "cls": 0.048,
  "timestamp": "2025-12-15T10:30:00Z"
}
```

---

### ♿ 7.4 Accessibility Audit
**Standard:** WCAG 2.1 Level AA  
**Tool:** axe-core/playwright

**Violation Severity:**
- 🔴 **Critical:** MUST fix (fail test)
- 🟠 **Serious:** Should fix (logged)
- 🟡 **Moderate:** Nice to have
- 🔵 **Minor:** Optional

**Common Issues Checked:**
- Missing alt text on images
- Insufficient color contrast
- Missing form labels
- Keyboard navigation barriers
- Missing ARIA labels
- Focus order issues

**Output File:** `accessibility-report.json`

---

### 📱 7.5 Responsive Design
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

### 🎨 7.6 UI State Testing
**States Verified:** 4 critical states

| State | Trigger | Expected Behavior |
|-------|---------|-------------------|
| **Loading** | Network delay (3s) | Skeleton loader appears |
| **Empty** | No cart items | "Cart is empty" message |
| **Error** | API failure | Error message in Thai |
| **Success** | Order submitted | Success message + order number |

**Output:** 4 screenshots in `ux-snapshots/state-*.png`

---

### 🌐 7.7 Thai Language Rendering
**Text Samples:**
- ส้มตำไทย
- ตะกร้าสินค้า
- ครัว
- จัดการเมนู

**Verification:**
- ✅ No garbled characters (ดอกบัว → ���)
- ✅ Font renders correctly
- ✅ Line breaks respect Thai rules
- ✅ No Unicode issues

---

### 🎬 7.8 Animation Testing
**Interactions Tested:**

| Element | Interaction | Expected |
|---------|-------------|----------|
| Cart Badge | Item added | Bounce animation |
| Add Button | Hover | Color change + scale |
| Modal | Open/Close | Fade + slide animation |
| Toast | Show | Slide in from top |

**Frame Rate:** 60fps target  
**No Jank:** Smooth transitions

---

## 🚀 Quick Commands

### Run Full Suite
```bash
npx playwright test e2e/stress-test.spec.ts --headed
```

### Run Only UX Tests
```bash
npx playwright test e2e/stress-test.spec.ts --grep "Level 7" --headed
```

### Run Specific UX Test
```bash
# Video Recording Only
npx playwright test -g "7.1: Record Complete"

# Performance Only
npx playwright test -g "7.3: Performance"

# Accessibility Only
npx playwright test -g "7.4: Accessibility"
```

### View Results
```bash
# HTML Report (with videos)
npx playwright show-report

# Performance Metrics
cat test-results/performance-metrics.json | jq

# Accessibility Report
cat test-results/accessibility-report.json | jq

# Watch Videos
open test-results/videos/ux-journeys/
```

---

## 📊 Interpreting Results

### ✅ PASS Criteria

**Functional (Levels 1-6):**
- Zero data corruption
- All orders processed correctly
- Kitchen response <2s
- Payments match orders

**UX/UI (Level 7):**
- Visual regression: <100 pixels diff
- Performance: All metrics within threshold
- Accessibility: Zero critical violations
- Responsive: All layouts intact
- Thai text: No garbled characters
- Animations: Smooth (60fps)

### ❌ FAIL Actions

**Visual Regression Failure:**
```
Update baseline:
npx playwright test --update-snapshots
```

**Performance Failure:**
```
1. Check Network tab (slow API?)
2. Check bundle size (too large?)
3. Check image sizes (unoptimized?)
```

**Accessibility Failure:**
```
1. Open accessibility-report.json
2. Fix highest impact violations first
3. Rerun: npx playwright test -g "7.4"
```

---

## 💡 Pro Tips

### 1. Video Quality vs Size
```typescript
// High Quality (larger file)
recordVideo: {
  dir: 'videos',
  size: { width: 1920, height: 1080 }
}

// Balanced (smaller file)
recordVideo: {
  dir: 'videos',
  size: { width: 1280, height: 720 }
}
```

### 2. Skip Videos on CI
```typescript
// playwright.config.ts
video: process.env.CI ? 'off' : 'on'
```

### 3. Parallel UX Tests
```typescript
// Run visual regression in parallel
test.describe.configure({ mode: 'parallel' });
```

### 4. Debug Visual Regression
```bash
# Compare before/after
npx playwright test --trace on
npx playwright show-trace trace.zip
```

---

## 🎯 Success Checklist

Before marking UX tests as complete:

- [ ] All 3 journey videos play correctly
- [ ] Visual regression screenshots match baseline
- [ ] Performance metrics < thresholds
- [ ] Zero critical accessibility violations
- [ ] All 8 device screenshots captured
- [ ] All 4 UI states verified
- [ ] Thai text renders without issues
- [ ] Animations smooth (no stuttering)
- [ ] HTML report generated
- [ ] All artifacts saved to test-results/

---

## 📦 Deliverables Checklist

- [ ] `test-results/videos/ux-journeys/` (3 videos)
- [ ] `test-results/responsive/` (16 screenshots)
- [ ] `test-results/screenshots/` (21 baselines)
- [ ] `ux-snapshots/` (20+ state images)
- [ ] `performance-metrics.json`
- [ ] `accessibility-report.json`
- [ ] `playwright-report/index.html`

**Total Size:** ~250-300 MB

---

## 🆘 Troubleshooting

### Problem: Videos not recording
```typescript
// Check context creation
const context = await browser.newContext({
  recordVideo: { dir: 'test-results/videos' } // ✅
});
```

### Problem: Screenshots differ
```bash
# Accept new baseline
npx playwright test --update-snapshots

# Or adjust tolerance
maxDiffPixels: 200  // Increase if needed
```

### Problem: Performance metrics missing
```typescript
// Ensure PerformanceObserver runs
await page.waitForTimeout(3000); // Wait for metrics
```

### Problem: Accessibility scan fails
```bash
# Install axe-core
npm install -D @axe-core/playwright

# Import in test
import AxeBuilder from '@axe-core/playwright';
```

---

## 🎬 Ready to Start?

**Copy Master Prompt → Paste to Antigravity → Get ALL tests + UX validation! 🚀**
