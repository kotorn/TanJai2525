# 🍜 Tanjai POS - Complete Development Checklist

## 📋 Project Status: Foundation Complete (Days 1-3) → MVP Launch (90 Days)

---

## ✅ Phase 0: Foundation (Days 1-3) - COMPLETED

### Infrastructure Setup
- [x] Next.js 16 App Router configured with Tailwind CSS
- [x] Feature-driven architecture (`src/features`, `src/lib`)
- [x] PWA setup with `@serwist/next` for offline capability
- [x] AI development context (`.cursorrules`)
- [x] Shadcn UI + Radix primitives integrated

### Database & Security
- [x] Supabase client/server utilities
- [x] Database schema (tenants, orders, inventory)
- [x] Row-Level Security (RLS) policies
- [x] Composite indexing strategy

### Real-time & Offline
- [x] `useRealtimeSubscription` hook
- [x] `PersistQueryClientProvider` with IndexedDB
- [x] Server Actions scaffolding
- [x] Edge Config for feature flags

---

## 🏗️ Phase 1: Core MVP (Days 4-30) - Month 1

### Week 1 (Days 4-10): Restaurant Management System

#### Epic 1.1: Restaurant Setup
- [ ] **Restaurant Registration Flow**
  - [ ] Create `/onboarding` page with phone verification
  - [ ] Implement SMS OTP via Twilio/Thai provider
  - [ ] Restaurant profile form (name, address, cuisine type)
  - [ ] Logo/banner upload to Supabase Storage
  - [ ] Complete setup in <5 minutes flow
  - [ ] Welcome email/Line message template

- [ ] **Menu Management Dashboard**
  - [ ] Create `/dashboard/menu` page
  - [ ] CRUD operations for menu categories
    - [ ] Add category modal
    - [ ] Edit category (name, sort order)
    - [ ] Delete category (with confirmation)
  - [ ] CRUD operations for menu items
    - [ ] Add item form (name, price, category, image)
    - [ ] Image upload with preview
    - [ ] Edit item modal
    - [ ] Delete item (soft delete)
    - [ ] Bulk actions (duplicate, disable)
  - [ ] Drag-and-drop reordering (dnd-kit)
  - [ ] Thai language input validation
  - [ ] Mobile-responsive menu preview

- [ ] **Option Groups System**
  - [ ] Create option groups for items
    - [ ] Required vs optional groups
    - [ ] Single select vs multi-select
    - [ ] Min/max selections
  - [ ] Add options with price modifiers
  - [ ] Default option selection
  - [ ] Reorder options within groups
  - [ ] Preview how options appear to customers

- [ ] **Table Management & QR Generation**
  - [ ] Create `/dashboard/tables` page
  - [ ] Add tables (number, name, capacity, location)
  - [ ] Generate unique QR codes (qrcode.js)
  - [ ] QR code format: `order.tanjai.app/r/{restaurantId}/t/{tableId}`
  - [ ] Download individual QR (PNG, 300dpi)
  - [ ] Bulk download (printable A4 sheet)
  - [ ] QR code customization (logo overlay)
  - [ ] Print-ready templates

**Week 1 Deliverables:**
- [ ] Restaurant can complete onboarding in 5 minutes
- [ ] Add 20+ menu items with options
- [ ] Generate QR codes ready for printing
- [ ] Test on actual mobile device (Thai language)

---

### Week 2 (Days 11-17): Customer Ordering Flow

#### Epic 1.2: Mobile Ordering Experience

- [ ] **Scan & Browse Menu Page**
  - [ ] Create `/r/[restaurantId]/t/[tableId]/page.tsx`
  - [ ] Fetch restaurant & menu data (with caching)
  - [ ] Display restaurant banner & name
  - [ ] Category tabs (horizontal scroll)
  - [ ] Menu item grid with:
    - [ ] Item photo (optimized WebP)
    - [ ] Name & price
    - [ ] "Out of Stock" overlay
  - [ ] Search functionality (Thai + English)
  - [ ] Filter by category
  - [ ] Skeleton loading states
  - [ ] Error handling (restaurant closed, invalid QR)

- [ ] **Item Details Modal**
  - [ ] Bottom sheet modal (mobile-optimized)
  - [ ] Item photo gallery (swipeable)
  - [ ] Description
  - [ ] Required option groups (radio buttons)
  - [ ] Optional add-ons (checkboxes)
  - [ ] Quantity selector (+/- buttons)
  - [ ] Real-time price calculation
  - [ ] Special instructions textarea (100 char limit)
  - [ ] "Add to Cart" button (disabled if required options not selected)
  - [ ] Haptic feedback (if supported)

- [ ] **Cart System**
  - [ ] Cart state management (Zustand)
  - [ ] Cart badge with item count
  - [ ] Cart drawer (slide from bottom)
  - [ ] Cart items with:
    - [ ] Item name & selected options
    - [ ] Quantity controls
    - [ ] Remove item button
    - [ ] Edit item (reopens modal)
  - [ ] Cart totals (subtotal, any fees)
  - [ ] Empty cart state
  - [ ] "Continue Shopping" button
  - [ ] Persist cart in localStorage

- [ ] **Order Submission**
  - [ ] Review order screen
  - [ ] Table number confirmation
  - [ ] Special instructions for entire order
  - [ ] "Submit Order" button
  - [ ] Loading state during submission
  - [ ] Success confirmation with order number
  - [ ] Option to add more items
  - [ ] Error handling (out of stock, restaurant closed)

**Week 2 Deliverables:**
- [ ] Customer can scan QR → browse → add to cart → submit
- [ ] End-to-end test: Order reaches database
- [ ] Load time <2 seconds on 4G
- [ ] Works on iOS Safari & Android Chrome

---

### Week 3 (Days 18-24): Kitchen Display System

#### Epic 1.3: Real-time Kitchen Display

- [ ] **Kitchen Display Page**
  - [ ] Create `/dashboard/kitchen/[restaurantId]/page.tsx`
  - [ ] WebSocket connection for real-time orders
  - [ ] Kanban board layout (New → Preparing → Done)
  - [ ] Order cards with:
    - [ ] Table number (large text)
    - [ ] Order number
    - [ ] Items list with quantities
    - [ ] Selected options (highlighted)
    - [ ] Special instructions (bold)
    - [ ] Wait time (color-coded)
  - [ ] Sound notification on new order
  - [ ] Auto-refresh every 2 seconds (fallback)

- [ ] **Multi-Station Routing**
  - [ ] Admin: Assign items to stations (Bar, Hot Kitchen, Cold Kitchen)
  - [ ] Split orders by station automatically
  - [ ] Each station sees only their items
  - [ ] Station filter dropdown
  - [ ] All stations view (for manager)

- [ ] **Order Status Management**
  - [ ] Tap order card → Mark "Preparing"
  - [ ] Visual state change (card color)
  - [ ] Tap again → Mark "Done"
  - [ ] Done orders auto-hide after 5 minutes
  - [ ] Recall done orders (undo feature)
  - [ ] Order history log

- [ ] **Priority Queue Algorithm**
  - [ ] Sort orders by:
    - [ ] Wait time (oldest first)
    - [ ] Station (drinks before food)
    - [ ] Order type (dine-in vs delivery)
  - [ ] Visual priority indicators
  - [ ] Manual override (drag to reorder)

**Week 3 Deliverables:**
- [ ] Kitchen receives orders in <2 seconds
- [ ] Orders split correctly by station
- [ ] Status updates reflected in real-time
- [ ] Test on tablet (iPad/Android 10")

---

### Week 4 (Days 25-30): Payment System

#### Epic 1.4: Payment Processing

- [ ] **Bill Generation**
  - [ ] Create `/dashboard/orders/[orderId]/bill` page
  - [ ] Fetch order details
  - [ ] Line items with quantities & prices
  - [ ] Selected options displayed
  - [ ] Subtotal calculation
  - [ ] Service charge (optional, configurable %)
  - [ ] Total amount (large, bold)
  - [ ] Print receipt button
  - [ ] Bluetooth printer integration

- [ ] **Cash Payment Flow**
  - [ ] Calculator-style number pad
  - [ ] Amount received input
  - [ ] Auto-calculate change
  - [ ] Large display: Received / Bill / Change
  - [ ] "Exact Amount" quick button
  - [ ] Confirm payment button
  - [ ] Mark order as "Paid - Cash"
  - [ ] Print receipt automatically
  - [ ] Close table

- [ ] **PromptPay QR Generation**
  - [ ] Generate PromptPay QR (EMVCo format)
  - [ ] Embed: Restaurant phone + exact amount
  - [ ] Display large QR code
  - [ ] Show: "โอนมาที่ [phone], จำนวน ฿[amount]"
  - [ ] Copy amount button
  - [ ] Timer (5 minutes before expiry)
  - [ ] Resend QR option

- [ ] **Slip Verification (Multi-Provider)**
  - [ ] Customer uploads slip photo
  - [ ] Image upload to Supabase Storage
  - [ ] Try Provider 1: EasySlip (3s timeout)
    - [ ] API integration
    - [ ] Parse response (amount, date, account)
  - [ ] Fallback Provider 2: SlipOK (3s timeout)
    - [ ] API integration
    - [ ] Parse response
  - [ ] Fallback Provider 3: GPT-4 Vision (5s timeout)
    - [ ] OpenAI API integration
    - [ ] Extract slip data with AI
    - [ ] Validate against expected amount
  - [ ] If all fail → Manual review queue
  - [ ] Deduct credits from restaurant balance
  - [ ] Mark order as "Paid - Transfer"
  - [ ] Send notification to customer

- [ ] **Manual Slip Review**
  - [ ] Create `/dashboard/payments/review` page
  - [ ] Queue of pending slips
  - [ ] Display slip image (zoom, rotate)
  - [ ] Show order details & expected amount
  - [ ] Approve button
  - [ ] Reject button (with reason)
  - [ ] Notify customer via Line

**Week 4 Deliverables:**
- [ ] Cash payment works end-to-end
- [ ] PromptPay QR generates correctly
- [ ] Slip verification auto-approves 90%+
- [ ] Manual review for edge cases

**Month 1 Milestone:**
- [ ] Complete order flow: Scan → Order → Kitchen → Pay
- [ ] 5 pilot restaurants onboarded
- [ ] Process 20+ real orders
- [ ] No critical bugs for 3 days

---

## 🚀 Phase 2: Offline & Optimization (Days 31-60) - Month 2

### Week 5 (Days 31-37): Offline-First Architecture

#### Epic 2.1: PWA Enhancements

- [ ] **Service Worker Optimization**
  - [ ] Cache menu images (7-day TTL)
  - [ ] Cache menu data (1-hour TTL)
  - [ ] Cache app shell (HTML, CSS, JS)
  - [ ] Network-first strategy for orders
  - [ ] Cache-first strategy for static assets

- [ ] **IndexedDB Order Queue**
  - [ ] Create `OfflineOrderQueue` class
  - [ ] Store orders locally when offline
  - [ ] Display "Queued" status to customer
  - [ ] Auto-sync when connection restored
  - [ ] Retry logic (exponential backoff)
  - [ ] Handle conflicts (menu changed)
  - [ ] Show sync status indicator

- [ ] **LAN-based Kitchen Display**
  - [ ] Optional: Local WebSocket server
  - [ ] Customer → WiFi → Kitchen (bypass cloud)
  - [ ] Sync to cloud asynchronously
  - [ ] Fallback to cloud if LAN unavailable
  - [ ] Setup wizard for restaurant network

**Week 5 Deliverables:**
- [ ] Orders can be placed offline
- [ ] Sync happens within 10 seconds of reconnection
- [ ] Kitchen display works on LAN only
- [ ] Test: Disconnect internet mid-order

---

### Week 6 (Days 38-44): Enhanced Payment

#### Epic 2.2: Payment Improvements

- [ ] **Credit Management System**
  - [ ] Create `/dashboard/credits` page
  - [ ] Display current credit balance
  - [ ] Credit packages (100฿ → 200 credits)
  - [ ] Buy credits via PromptPay
  - [ ] Auto-top-up option (threshold + amount)
  - [ ] Usage history table
  - [ ] Low balance alert (<50 credits)

- [ ] **Provider Monitoring Dashboard**
  - [ ] Track success rate per provider
  - [ ] Average response time
  - [ ] Cost per verification
  - [ ] Switch provider order based on performance
  - [ ] Alert if provider down

- [ ] **Cash Reconciliation**
  - [ ] End-of-day cash count
  - [ ] Count by denomination (1000฿, 500฿, etc.)
  - [ ] Compare expected vs actual
  - [ ] Discrepancy report
  - [ ] Save shift summary

**Week 6 Deliverables:**
- [ ] Restaurant can buy credits seamlessly
- [ ] Provider failover works (test by disabling API)
- [ ] Cash reconciliation accurate to ±1฿

---

### Week 7 (Days 45-51): Basic Inventory

#### Epic 2.3: Stock Management

- [ ] **Ingredient Management**
  - [ ] Create `/dashboard/inventory` page
  - [ ] Add ingredients (name, unit, current stock)
  - [ ] Set minimum stock threshold
  - [ ] Cost per unit
  - [ ] Supplier information

- [ ] **Recipe Management**
  - [ ] Link ingredients to menu items
  - [ ] Define quantity needed per serving
  - [ ] Calculate cost per dish

- [ ] **Stock Deduction**
  - [ ] Reserve stock when order placed
  - [ ] Commit stock when order completed
  - [ ] Release stock if order cancelled
  - [ ] Low stock alert (<20%)
  - [ ] Auto mark item unavailable when stock depleted

- [ ] **Manual Stock Adjustment**
  - [ ] Add stock (purchase)
  - [ ] Deduct stock (waste, sample)
  - [ ] Adjustment log (who, when, why)

**Week 7 Deliverables:**
- [ ] Inventory tracks correctly for 10 items
- [ ] Out-of-stock items blocked from ordering
- [ ] Alert sent when stock low

---

### Week 8 (Days 52-60): Dashboard & Analytics

#### Epic 2.4: Basic Dashboard

- [ ] **Sales Dashboard**
  - [ ] Create `/dashboard` (home page)
  - [ ] Today's revenue (large card)
  - [ ] Number of orders
  - [ ] Average order value
  - [ ] Revenue by payment method (chart)
  - [ ] Best-selling items (Top 5)
  - [ ] Hourly breakdown (bar chart)

- [ ] **Reports**
  - [ ] Daily sales report (PDF export)
  - [ ] Weekly summary
  - [ ] Monthly summary
  - [ ] Filter by date range
  - [ ] CSV data export

**Month 2 Milestone:**
- [ ] Offline mode tested in 3 restaurants
- [ ] 70 restaurants onboarded
- [ ] Process 500+ orders/day (combined)
- [ ] Payment auto-approval >95%

---

## 🌟 Phase 3: Launch Preparation (Days 61-90) - Month 3

### Week 9 (Days 61-67): Onboarding & UX

#### Epic 3.1: Smooth Onboarding

- [ ] **Onboarding Wizard**
  - [ ] Welcome screen with video
  - [ ] Step 1: Restaurant details
  - [ ] Step 2: Add 5 menu items (guided)
  - [ ] Step 3: Generate QR codes
  - [ ] Step 4: Setup payment (PromptPay)
  - [ ] Step 5: Test order (walkthrough)
  - [ ] Completion celebration

- [ ] **Help Center**
  - [ ] Create `/help` page
  - [ ] FAQ sections
  - [ ] Video tutorials (1-2 min each)
  - [ ] Searchable articles
  - [ ] Contact support button

- [ ] **Menu Setup Concierge**
  - [ ] Photo upload service
  - [ ] Admin uploads for restaurant
  - [ ] Menu template selection
  - [ ] 500฿ service fee

**Week 9 Deliverables:**
- [ ] New user completes setup in <15 minutes
- [ ] Help center has 20+ articles
- [ ] 3 video tutorials recorded

---

### Week 10 (Days 68-74): Multi-language & Accessibility

#### Epic 3.2: Internationalization

- [ ] **Thai-English Toggle**
  - [ ] Language switcher in menu
  - [ ] Store preference in localStorage
  - [ ] Translate UI labels (i18next)
  - [ ] Restaurant adds English menu names (optional)
  - [ ] Fallback to Thai if English missing

- [ ] **Accessibility**
  - [ ] Keyboard navigation
  - [ ] Screen reader labels (ARIA)
  - [ ] Color contrast (WCAG AA)
  - [ ] Font size options
  - [ ] Focus indicators

**Week 10 Deliverables:**
- [ ] Tourists can order in English
- [ ] Lighthouse accessibility score >90

---

### Week 11 (Days 75-81): Order Tracking

#### Epic 3.3: Customer Experience

- [ ] **Order Status Page**
  - [ ] Create `/r/[restaurantId]/orders/[orderId]` page
  - [ ] Display current status
  - [ ] Progress indicator (steps)
  - [ ] Estimated wait time
  - [ ] Real-time updates (WebSocket)
  - [ ] Browser push notification when ready

- [ ] **Favorites & Reorder**
  - [ ] Save order to favorites (localStorage)
  - [ ] "Reorder" button on past orders
  - [ ] Quick reorder (one tap)

**Week 11 Deliverables:**
- [ ] Customer knows exactly when food is ready
- [ ] Reorder reduces order time by 70%

---

### Week 12 (Days 82-90): Testing & Launch

#### Epic 3.4: QA & Deployment

- [ ] **End-to-End Testing**
  - [ ] Test all user flows (Playwright/Cypress)
    - [ ] Customer: Scan → Order → Status
    - [ ] Kitchen: Receive → Prepare → Done
    - [ ] Cashier: Bill → Pay (Cash/QR)
  - [ ] Test on devices:
    - [ ] iPhone (Safari)
    - [ ] Android (Chrome)
    - [ ] iPad (Kitchen Display)
    - [ ] Desktop (Dashboard)
  - [ ] Test in actual restaurant (5 hours)
  - [ ] Fix critical bugs

- [ ] **Performance Optimization**
  - [ ] Lighthouse score >90 (all pages)
  - [ ] Image optimization (next/image)
  - [ ] Code splitting
  - [ ] Database query optimization
  - [ ] CDN for images (Cloudflare)

- [ ] **Monitoring Setup**
  - [ ] Sentry error tracking
  - [ ] Vercel Analytics
  - [ ] Custom dashboard (Grafana)
  - [ ] Uptime monitoring (UptimeRobot)
  - [ ] Alert system (email/Line)

- [ ] **Security Audit**
  - [ ] SQL injection tests
  - [ ] XSS prevention
  - [ ] CSRF tokens
  - [ ] Rate limiting (10 req/sec)
  - [ ] Input validation (Zod schemas)

- [ ] **Launch Checklist**
  - [ ] Domain setup (tanjai.app)
  - [ ] SSL certificate
  - [ ] Privacy policy & terms
  - [ ] PDPA consent form
  - [ ] Support channels (Line OA, Email)
  - [ ] Status page (status.tanjai.app)
  - [ ] Press release draft
  - [ ] Social media profiles
  - [ ] Launch video (1-2 min)

**Month 3 Milestone (LAUNCH!):**
- [ ] 30 restaurants using daily
- [ ] Process 100+ orders/day
- [ ] 99.5% uptime for 7 days
- [ ] <3 bugs per day
- [ ] Positive feedback from 80%+ users

---

## 📊 Post-Launch (Days 91-180) - Months 4-6

### Phase 4: Scale & Advanced Features

#### Month 4: Growth & Stability
- [ ] Part-time support hire
- [ ] Marketing campaign launch (Facebook/IG ads)
- [ ] TikTok content (3 videos/week)
- [ ] Referral program
- [ ] A/B testing (pricing, UI)
- [ ] Customer feedback loop
- [ ] **Target: 70 restaurants**

#### Month 5: Feature Expansion
- [ ] Menu templates (5 types)
- [ ] Combo meals
- [ ] Time-based menus (breakfast/lunch/dinner)
- [ ] Staff management (multiple users)
- [ ] Advanced analytics
- [ ] **Target: 100 restaurants**

#### Month 6: Polish & Prepare for Series A
- [ ] Junior developer hired
- [ ] AI recommendations (ML model)
- [ ] Voice ordering (Whisper API)
- [ ] Loyalty program
- [ ] White-label for food courts
- [ ] **Target: 150 restaurants, Break-even**

---

## 🎯 Daily Development Workflow

### Morning (9:00 - 12:00)
1. Check overnight errors (Sentry)
2. Review customer feedback (Line OA)
3. Pick 1-2 tasks from checklist
4. Code with Claude assistance
5. Git commit every 30 minutes

### Afternoon (13:00 - 17:00)
6. Continue development
7. Write tests for new features
8. Deploy to staging
9. Manual testing on devices
10. Update documentation

### Evening (18:00 - 20:00)
11. Review pull requests (if team)
12. Plan tomorrow's tasks
13. Quick fixes for urgent bugs
14. Learning time (new tech/features)

---

## 🚨 Critical Path Items (Must Not Fail)

### Week 1
- [ ] Restaurant onboarding works perfectly
- [ ] Menu management is intuitive

### Week 2
- [ ] Customer ordering is fast (<2s load)
- [ ] Cart persists correctly

### Week 3
- [ ] Kitchen receives orders in real-time
- [ ] No orders lost in transit

### Week 4
- [ ] Payment flows work 100%
- [ ] Slip verification >90% success

### Weeks 5-8
- [ ] Offline mode is reliable
- [ ] No data loss during sync

### Weeks 9-12
- [ ] Onboarding <15 minutes
- [ ] Zero critical bugs for launch

---

## 📝 Definition of Done (DoD)

For each feature to be marked complete:
- [ ] Code written and committed
- [ ] Unit tests written (if applicable)
- [ ] Manual testing on 3 devices
- [ ] Thai language tested (no Unicode issues)
- [ ] Responsive on mobile/tablet/desktop
- [ ] Accessible (keyboard nav, screen reader)
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Success/error messages
- [ ] Logged to Sentry (if error-prone)
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] Product owner approval (if team)

---

## 🎉 Launch Criteria (All Must Be Green)

- [ ] 5 pilot restaurants using successfully
- [ ] 100+ real orders processed
- [ ] 99.5% uptime (7 consecutive days)
- [ ] <5 critical bugs/week
- [ ] Average order time <30 seconds
- [ ] Payment success rate >98%
- [ ] Customer satisfaction >4/5
- [ ] Loading time <2s (4G)
- [ ] Mobile-responsive (100%)
- [ ] Security audit passed
- [ ] Legal compliance (PDPA)
- [ ] Support system ready

---

## 💡 Pro Tips for Solo Development

### Use AI Wisely
- [ ] Cursor/Claude for boilerplate
- [ ] ChatGPT for debugging
- [ ] GitHub Copilot for completions
- [ ] Review all AI-generated code

### Stay Focused
- [ ] Work on ONE feature at a time
- [ ] Finish before starting new
- [ ] Avoid feature creep
- [ ] Ship fast, iterate faster

### Maintain Sanity
- [ ] Take breaks every 90 minutes
- [ ] Exercise daily (30 min)
- [ ] Sleep 7-8 hours
- [ ] Talk to users weekly
- [ ] Celebrate small wins

### Emergency Protocols
- [ ] 2-3 developer friends on standby
- [ ] Backup plan for critical bugs
- [ ] Automated alerts (Sentry + PagerDuty)
- [ ] Status page for transparency

---

## 📞 Support Resources

### Technical
- [ ] Next.js docs: https://nextjs.org/docs
- [ ] Supabase docs: https://supabase.com/docs
- [ ] Tailwind docs: https://tailwindcss.com/docs
- [ ] Thai dev community: Facebook groups

### Business
- [ ] Y Combinator Startup School
- [ ] Indie Hackers community
- [ ] Thai startup ecosystem (AIS Startup)
- [ ] Restaurant owners network

---

**Good luck building Tanjai POS! 🚀**

**Remember:** Done is better than perfect. Ship the MVP, learn from users, iterate quickly.

---

**Next Immediate Actions (Today):**
1. [ ] Review this entire checklist
2. [ ] Break Week 1 into daily tasks
3. [ ] Setup dev environment (if not done)
4. [ ] Code the restaurant registration flow
5. [ ] Deploy first feature to staging
6. [ ] Share progress (social media/blog)

Let's build this! 💪