# Tanjai POS - Product Roadmap (18 Months)
**Version:** 1.0 | **Last Updated:** December 14, 2025  
**Owner:** Product/Engineering Team

---

## 📋 Table of Contents
1. [Product Vision & Strategy](#vision)
2. [Phase 1: Foundation (Month 1-3)](#phase1)
3. [Phase 2: Scale & Optimize (Month 4-6)](#phase2)
4. [Phase 3: Advanced Features (Month 7-12)](#phase3)
5. [Phase 4: Ecosystem (Month 13-18)](#phase4)
6. [Technical Architecture](#architecture)
7. [Feature Priority Matrix](#priority)
8. [Release Calendar](#calendar)

---

## 🎯 Product Vision & Strategy {#vision}

### North Star Metric
**"Number of successful orders processed per day across all restaurants"**

Target: 50 → 500 → 5,000 orders/day (Month 3 → 6 → 12)

### Product Principles
1. **Speed First:** Every interaction <3 seconds
2. **Offline-capable:** Works without internet (local network)
3. **Thai-centric:** Built for Thai payment behavior & menu complexity
4. **Mobile-first:** Optimized for 4-7" screens
5. **Zero Training:** Intuitive enough for anyone to use in 5 minutes

### Success Metrics by Phase

| Phase | Timeline | Key Metric | Target |
|-------|----------|------------|--------|
| **Phase 1** | M1-3 | System Reliability | 99.5% uptime |
| **Phase 2** | M4-6 | Customer Adoption | 70 paying restaurants |
| **Phase 3** | M7-12 | Feature Utilization | 80% use analytics |
| **Phase 4** | M13-18 | Network Effect | 10% cross-restaurant orders |

---

## 🏗️ Phase 1: Foundation (Month 1-3) {#phase1}
**Goal:** Launch MVP that solves core pain points

### Epic 1.1: Restaurant Management System
**Business Value:** Allows restaurants to self-onboard and manage menu  
**Priority:** P0 (Must Have) | **Effort:** 3 weeks | **Impact:** Critical

#### User Stories

**US-1.1.1: Restaurant Registration**
```
As a restaurant owner
I want to create an account and set up my restaurant profile
So that I can start using the POS system

Acceptance Criteria:
- [ ] Register with phone number + SMS OTP
- [ ] Fill basic info: Restaurant name, address, cuisine type
- [ ] Upload logo/banner (optional)
- [ ] Complete onboarding in <5 minutes
- [ ] Receive welcome email/Line message with next steps

Technical Notes:
- Use Supabase Auth for authentication
- Store images in Supabase Storage
- SMS via Twilio or local Thai provider (e.g., Thaibulksms)
```

**US-1.1.2: Menu Management**
```
As a restaurant owner
I want to add, edit, and organize my menu items
So that customers can see what I'm selling

Acceptance Criteria:
- [ ] Add item: name, price, image, category
- [ ] Support Thai language input (no bugs with Thai characters)
- [ ] Create option groups (e.g., "ระดับความเผ็ด": 1-5 stars)
- [ ] Multiple options per item (e.g., noodle type + soup type + spiciness)
- [ ] Set item availability (in stock / out of stock)
- [ ] Drag & drop to reorder items in category
- [ ] Preview mobile menu before publishing

Data Model:
- Categories (1:N) → Items
- Items (1:N) → OptionGroups
- OptionGroups (1:N) → Options (with price modifiers)
```

**US-1.1.3: Table/QR Code Generation**
```
As a restaurant owner
I want to generate QR codes for each table
So that customers can scan and order

Acceptance Criteria:
- [ ] Create tables: Table 1, 2, 3... or custom names
- [ ] Auto-generate unique QR code per table
- [ ] Download QR codes (PNG, 300dpi, ready to print)
- [ ] Printable A4 sheet with multiple QR codes
- [ ] QR code includes: restaurant ID + table ID

Technical Notes:
- Use qrcode.js library
- QR format: https://order.tanjai.app/r/[restaurant_id]/t/[table_id]
- Store QR code URLs in database (don't regenerate)
```

---

### Epic 1.2: Customer Ordering Flow (Mobile Web)
**Business Value:** Core ordering experience that reduces wait time  
**Priority:** P0 | **Effort:** 4 weeks | **Impact:** Critical

#### User Stories

**US-1.2.1: Scan & Browse Menu**
```
As a customer
I want to scan QR code and see the menu
So that I can decide what to order

Acceptance Criteria:
- [ ] Scan QR → Opens web app (no app install)
- [ ] Show restaurant name & banner
- [ ] Display menu items with photos, prices
- [ ] Filter by category (tabs at top)
- [ ] Search by item name (Thai language)
- [ ] Mark items "Out of Stock" with grey overlay
- [ ] Load full menu in <2 seconds (4G connection)

Performance:
- Image optimization: WebP format, lazy loading
- Cache menu data in localStorage (30-min TTL)
- Skeleton loading states
```

**US-1.2.2: Add Items to Cart**
```
As a customer
I want to select menu items with options
So that I can customize my order

Acceptance Criteria:
- [ ] Tap item → Opens modal with options
- [ ] Select required options (e.g., noodle type)
- [ ] Select optional add-ons (e.g., extra meat +20฿)
- [ ] Adjust quantity with +/- buttons
- [ ] See real-time price calculation
- [ ] Add to cart → Modal closes
- [ ] Cart badge shows item count
- [ ] Can edit/remove items in cart

UX Notes:
- Use bottom sheet modal (mobile-friendly)
- Haptic feedback on tap (if supported)
- Disable "Add to Cart" until required options selected
```

**US-1.2.3: Submit Order**
```
As a customer
I want to submit my order to the kitchen
So that food preparation can begin

Acceptance Criteria:
- [ ] Review cart: items, options, total price
- [ ] Add special instructions (optional, max 100 chars)
- [ ] Tap "สั่งอาหาร" (Confirm Order)
- [ ] See order confirmation with order number
- [ ] Option to add more items (don't close session)
- [ ] Order appears in kitchen immediately

Technical:
- WebSocket for real-time order push to kitchen
- Fallback to HTTP polling if WebSocket fails
- Store order in PostgreSQL orders table
```

---

### Epic 1.3: Kitchen Display System (KDS)
**Business Value:** Organizes order flow and reduces errors  
**Priority:** P0 | **Effort:** 3 weeks | **Impact:** High

#### User Stories

**US-1.3.1: Receive Orders in Real-time**
```
As a kitchen staff
I want to see new orders instantly
So that I can start cooking right away

Acceptance Criteria:
- [ ] Orders appear with sound notification
- [ ] Display: table number, items, options, special notes
- [ ] Color-coded by wait time (green < 5min, yellow 5-10min, red >10min)
- [ ] Auto-refresh every 2 seconds (WebSocket)
- [ ] Works on tablet (iPad/Android) or desktop

Technical:
- Socket.io for WebSocket connection
- Fallback to long-polling
- Persist connection status indicator
```

**US-1.3.2: Multi-Station Routing**
```
As a restaurant with multiple stations
I want orders to route to correct station
So that bar makes drinks and kitchen makes food

Acceptance Criteria:
- [ ] Admin can assign items to stations (Bar, Hot Kitchen, Cold Kitchen)
- [ ] Orders auto-split by station
- [ ] Each station sees only their items
- [ ] Mark items done individually
- [ ] Order marked complete when all stations done

Data Model:
- Items have station_id field
- Orders split into order_items with station assignments
```

**US-1.3.3: Order Status Management**
```
As kitchen staff
I want to mark orders as in-progress or completed
So that I can track what needs to be done

Acceptance Criteria:
- [ ] Tap order → Mark "กำลังทำ" (In Progress)
- [ ] Tap again → Mark "เสร็จแล้ว" (Complete)
- [ ] Completed orders move to "Done" column (auto-hide after 5 min)
- [ ] Can recall completed orders (in case of mistake)

States: New → In Progress → Done → Archived
```

---

### Epic 1.4: Payment Processing
**Business Value:** Core revenue collection capability  
**Priority:** P0 | **Effort:** 3 weeks | **Impact:** Critical

#### User Stories

**US-1.4.1: Generate Bill**
```
As a cashier
I want to generate bill for a table
So that customers can pay

Acceptance Criteria:
- [ ] Search by table number
- [ ] Show all orders for that table (line items)
- [ ] Calculate total: subtotal + service charge (if any)
- [ ] Support split bill (optional: future)
- [ ] Print receipt (connect Bluetooth printer)
- [ ] Mark table as "Paying"

Receipt Format:
- Restaurant name, address
- Date/time, order number
- Line items with qty × price
- Total, payment method
- Thank you message
```

**US-1.4.2: Accept Cash Payment**
```
As a cashier
I want to record cash payments
So that I can track daily revenue

Acceptance Criteria:
- [ ] Enter amount received from customer
- [ ] Calculate change automatically
- [ ] Large number display (easy to see)
- [ ] Button for exact amount (no change)
- [ ] Mark order as "Paid - Cash"
- [ ] Close table (ready for next customer)

UX:
- Calculator-style number pad
- Show: Received ฿500 | Bill ฿347 | Change ฿153
```

**US-1.4.3: PromptPay QR Payment**
```
As a cashier
I want to generate PromptPay QR
So that customers can scan and transfer

Acceptance Criteria:
- [ ] Auto-generate QR with exact bill amount
- [ ] Display large QR code on screen
- [ ] Show: "โอนมาที่ [phone number], จำนวน ฿347"
- [ ] Customer uploads slip photo
- [ ] Verify slip (API or manual)
- [ ] Mark order as "Paid - Transfer"

Technical:
- Use PromptPay QR standard (EMVCo format)
- Slip verification via EasySlip/SlipOK API
- Multi-provider fallback (see Epic 2.2)
```

---

### Epic 1.5: Offline-First Architecture
**Business Value:** System works even with poor internet  
**Priority:** P1 (High) | **Effort:** 2 weeks | **Impact:** High

#### Technical Implementation

**US-1.5.1: PWA Setup**
```
Technical Task: Configure Progressive Web App

Requirements:
- [ ] Service Worker for offline caching
- [ ] Cache menu data (images, prices)
- [ ] Cache app shell (HTML, CSS, JS)
- [ ] "Add to Home Screen" prompt (iOS/Android)
- [ ] Update cache when menu changes

Files to Cache:
- /api/menu/:restaurant_id → 1 hour TTL
- /static/css/*.css → Immutable (versioned)
- /static/js/*.js → Immutable
- Images → 7 days TTL
```

**US-1.5.2: Local Queue for Orders**
```
As a customer with poor connection
I want my order to queue locally
So that it submits when internet returns

Technical:
- [ ] Use IndexedDB to store pending orders
- [ ] Retry submission every 10 seconds
- [ ] Show "Queued" status to user
- [ ] Success notification when submitted
- [ ] Handle conflicts (menu price changed)

Edge Cases:
- Item out of stock → Show error, remove item
- Restaurant closed → Block submission
```

**US-1.5.3: LAN-based Kitchen Display**
```
Technical Task: Enable local network communication

Requirements:
- [ ] Customer phone → Local WiFi → Tablet (bypass cloud)
- [ ] Use WebRTC or local WebSocket server
- [ ] Sync to cloud for backup (async)
- [ ] 99.9% reliability even if internet down

Architecture:
- Optional: Run lightweight Node.js server on restaurant's network
- Orders saved locally then sync'd to cloud
```

---

### Epic 1.6: Admin Dashboard (Basic)
**Business Value:** Restaurant owners see key metrics  
**Priority:** P1 | **Effort:** 2 weeks | **Impact:** Medium

#### User Stories

**US-1.6.1: Daily Sales Dashboard**
```
As a restaurant owner
I want to see today's sales
So that I know how business is performing

Metrics:
- [ ] Today's revenue (฿)
- [ ] Number of orders
- [ ] Average order value
- [ ] Revenue by payment method (Cash vs Transfer)
- [ ] Best-selling items (Top 5)
- [ ] Hourly breakdown chart

Visualizations:
- Large number cards (revenue, orders)
- Bar chart (hourly sales)
- Pie chart (payment methods)
```

---

## 🚀 Phase 1 Release Plan

### Week-by-Week Breakdown

| Week | Epics | Deliverable | Status |
|------|-------|-------------|--------|
| **W1-2** | 1.1 Restaurant Setup | Restaurant can create account, add menu | 🏗️ |
| **W3-4** | 1.2 Customer Ordering | Customers can scan & order | 🏗️ |
| **W5-6** | 1.3 Kitchen Display | Kitchen receives orders real-time | 🏗️ |
| **W7-8** | 1.4 Payment | Cash + PromptPay payment works | 🏗️ |
| **W9-10** | 1.5 Offline Mode | PWA with offline queue | 🏗️ |
| **W11-12** | 1.6 Basic Dashboard + Testing | Dashboard + End-to-end testing | 🏗️ |

### Phase 1 Exit Criteria

- ✅ 5 pilot restaurants successfully using system
- ✅ Process 50+ orders/day combined
- ✅ 99.5% uptime over 2 weeks
- ✅ <5 critical bugs per week
- ✅ Average order time: Customer scan → Kitchen receives <30 seconds

---

## 📈 Phase 2: Scale & Optimize (Month 4-6) {#phase2}
**Goal:** Improve reliability, add must-have features, onboard 70 restaurants

### Epic 2.1: Advanced Menu Features
**Priority:** P1 | **Effort:** 2 weeks

**US-2.1.1: Menu Templates**
```
As a new restaurant
I want to use pre-made templates
So that setup is faster

Templates:
- [ ] ก๋วยเตี๋ยว (Noodle Shop)
- [ ] อาหารตามสั่ง (Made-to-order)
- [ ] ส้มตำ (Papaya Salad)
- [ ] ร้านกาแฟ (Coffee Shop)

Each template includes:
- Common items with Thai names
- Standard option groups
- Suggested categories
```

**US-2.1.2: Combo/Set Meals**
```
As a restaurant owner
I want to create combo meals
So that I can increase average order value

Features:
- [ ] Bundle multiple items (e.g., Combo A: Noodle + Drink + Dessert)
- [ ] Discount on combo price
- [ ] Customer can customize items in combo
```

**US-2.1.3: Time-based Menu**
```
As a restaurant owner
I want different menus for breakfast/lunch/dinner
So that I can control what's available when

Features:
- [ ] Set time windows (e.g., Breakfast: 6-11am)
- [ ] Auto-hide items outside window
- [ ] Override manually if needed
```

---

### Epic 2.2: Enhanced Payment System
**Priority:** P0 | **Effort:** 3 weeks

**US-2.2.1: Multi-provider Slip Verification**
```
Technical Task: Implement failover slip verification

Providers:
1. EasySlip (Primary)
2. SlipOK (Secondary)
3. Self-hosted OCR + GPT-4 Vision (Tertiary)

Flow:
- [ ] Try Provider 1 (3s timeout)
- [ ] If fail → Try Provider 2 (3s timeout)
- [ ] If fail → Use AI OCR + manual review queue
- [ ] Log success rate per provider
- [ ] Alert if all providers down

Cost Tracking:
- Track credits used per restaurant
- Deduct from credit balance
- Alert when balance low (<50 credits)
```

**US-2.2.2: Credit Management**
```
As a restaurant owner
I want to buy and manage slip verification credits
So that I don't run out mid-service

Features:
- [ ] View current credit balance
- [ ] Buy credit packages (100฿ → 200 credits)
- [ ] Payment via PromptPay
- [ ] Auto-top-up option (when balance <20, buy 200)
- [ ] Usage history report
```

**US-2.2.3: Manual Slip Review Queue**
```
As a cashier
I want to manually verify unclear slips
So that orders aren't stuck

Features:
- [ ] Queue shows slip image + order details
- [ ] Zoom/rotate slip photo
- [ ] Match: Amount, Time, Recipient phone
- [ ] Approve or Reject with reason
- [ ] Notify customer of status (Line message)
```

---

### Epic 2.3: Inventory Management (Basic)
**Priority:** P1 | **Effort:** 2 weeks

**US-2.3.1: Stock Tracking**
```
As a restaurant owner
I want to track ingredient stock
So that I know when to reorder

Features:
- [ ] Define ingredients (e.g., Rice 50kg, Chicken 10kg)
- [ ] Set current stock level
- [ ] Link ingredients to menu items (recipe)
- [ ] Auto-deduct stock when order placed
- [ ] Alert when stock low (<20%)
```

**US-2.3.2: Out of Stock Management**
```
As a restaurant owner
I want to mark items unavailable
So that customers don't order what I can't make

Features:
- [ ] Toggle "Out of Stock" per item
- [ ] Item greyed out on customer menu
- [ ] Option: Auto mark out of stock when ingredient depleted
- [ ] Re-enable manually
```

---

### Epic 2.4: Customer Experience Enhancements
**Priority:** P1 | **Effort:** 2 weeks

**US-2.4.1: Order Status Tracking**
```
As a customer
I want to see my order status
So that I know when food is ready

Features:
- [ ] After ordering → Show status page
- [ ] States: "รอทำ" → "กำลังทำ" → "เสร็จแล้ว"
- [ ] Real-time updates (WebSocket)
- [ ] Estimated wait time
- [ ] Notification when ready (browser push)
```

**US-2.4.2: Re-order & Favorites**
```
As a customer
I want to quickly reorder my favorites
So that I save time

Features:
- [ ] Save order to "My Favorites" (stored in localStorage)
- [ ] One-tap reorder entire previous order
- [ ] Works across restaurant visits (same device)
```

**US-2.4.3: Multi-language Support**
```
As a tourist
I want to see menu in English
So that I can understand what I'm ordering

Languages:
- [ ] Thai (default)
- [ ] English
- [ ] Chinese (Simplified) - Phase 3

Implementation:
- Restaurant can add translations per item
- Or use Google Translate API (auto-translate)
- Language switcher in menu
```

---

### Epic 2.5: Staff Management
**Priority:** P2 | **Effort:** 1 week

**US-2.5.1: Multiple Users per Restaurant**
```
As a restaurant owner
I want to add staff accounts
So that cashiers and kitchen have separate logins

Roles:
- [ ] Owner: Full access
- [ ] Manager: Menu, reports, staff
- [ ] Cashier: Orders, payments only
- [ ] Kitchen: Kitchen display only

Features:
- [ ] Invite via phone number
- [ ] Set permissions per role
- [ ] Activity log (who did what)
```

---

### Epic 2.6: Advanced Analytics
**Priority:** P2 | **Effort:** 2 weeks

**US-2.6.1: Sales Reports**
```
As a restaurant owner
I want detailed sales reports
So that I can analyze trends

Reports:
- [ ] Daily/Weekly/Monthly summary
- [ ] Revenue by time of day (heat map)
- [ ] Best & worst selling items
- [ ] Payment method breakdown
- [ ] Customer behavior (avg order value, items per order)

Export:
- [ ] PDF report
- [ ] CSV data export
```

**US-2.6.2: Profit Analysis**
```
As a restaurant owner
I want to see profit per item
So that I can adjust pricing

Features:
- [ ] Set cost per item (ingredients + labor)
- [ ] Calculate margin: (Price - Cost) / Price
- [ ] Highlight low-margin items (<30%)
- [ ] Suggestions: Increase price or reduce cost
```

---

## 🎯 Phase 2 Release Plan

| Week | Epics | Deliverable |
|------|-------|-------------|
| **W13-14** | 2.1 Advanced Menu | Templates, Combos, Time-based |
| **W15-17** | 2.2 Enhanced Payment | Multi-provider, Credits, Manual Review |
| **W18-19** | 2.3 Basic Inventory | Stock tracking, Out of stock |
| **W20-21** | 2.4 Customer UX | Order status, Reorder, Multi-language |
| **W22** | 2.5 Staff Mgmt | Multiple users, roles |
| **W23-24** | 2.6 Analytics | Sales reports, Profit analysis |

### Phase 2 Exit Criteria

- ✅ 70+ paying restaurants
- ✅ Process 500+ orders/day combined
- ✅ 99.7% uptime
- ✅ Churn rate <8%/month
- ✅ Average slip verification success rate >95%

---

## 🌟 Phase 3: Advanced Features (Month 7-12) {#phase3}
**Goal:** Become indispensable, increase stickiness

### Epic 3.1: Smart Recommendations (AI-powered)
**Priority:** P2 | **Effort:** 3 weeks

**US-3.1.1: Personalized Menu**
```
As a returning customer
I want to see recommended items
So that I discover new dishes I might like

Features:
- [ ] Track customer orders (anonymized)
- [ ] ML model: Collaborative filtering (items often ordered together)
- [ ] Show "คนอื่นสั่งบ่อย" (Popular) section
- [ ] "คุณอาจชอบ" (You might like) based on history
```

**US-3.1.2: Dynamic Pricing**
```
As a restaurant owner
I want to offer time-based discounts
So that I can increase sales during slow hours

Features:
- [ ] Set discount rules (e.g., 20% off 2-4pm)
- [ ] Flash sale banner on customer menu
- [ ] Track promotion performance
```

---

### Epic 3.2: Loyalty & Rewards
**Priority:** P2 | **Effort:** 2 weeks

**US-3.2.1: Point System**
```
As a customer
I want to earn points for orders
So that I get rewards

Features:
- [ ] Earn 1 point per ฿10 spent
- [ ] View point balance
- [ ] Redeem points for discounts (100 points = ฿50 off)
- [ ] Restaurant can customize point rules
```

---

### Epic 3.3: Table Reservation (Optional)
**Priority:** P3 | **Effort:** 2 weeks

**US-3.3.1: Book Table Online**
```
As a customer
I want to reserve table in advance
So that I don't wait

Features:
- [ ] See available time slots
- [ ] Select party size
- [ ] Confirm booking
- [ ] Reminder notification
```

---

### Epic 3.4: Delivery Integration (Optional)
**Priority:** P3 | **Effort:** 4 weeks

**US-3.4.1: Food Panda / Grab Integration**
```
As a restaurant owner
I want orders from delivery apps
So that I reach more customers

Features:
- [ ] API integration with platforms
- [ ] Orders show in KDS (marked "Delivery")
- [ ] Auto-sync menu
- [ ] Update stock across platforms
```

---

### Epic 3.5: Voice Ordering (Future)
**Priority:** P4 | **Effort:** 3 weeks

**US-3.5.1: Voice Input for Orders**
```
As a customer
I want to speak my order
So that I don't need to type

Features:
- [ ] Speech-to-text (Whisper API)
- [ ] Support Thai language
- [ ] Parse order from natural speech
- [ ] Confirm order before submitting
```

---

## 🏗️ Phase 4: Ecosystem (Month 13-18) {#phase4}
**Goal:** Network effects, platform play

### Epic 4.1: Marketplace
**Priority:** P2 | **Effort:** 4 weeks

**US-4.1.1: Discover Nearby Restaurants**
```
As a customer
I want to see all restaurants on Tanjai POS nearby
So that I can order from multiple places

Features:
- [ ] Map view of restaurants
- [ ] Filter by cuisine, distance
- [ ] Cross-restaurant cart (order from 2+ restaurants)
- [ ] Shared delivery (if in same location)
```

---

### Epic 4.2: B2B Data Platform
**Priority:** P2 | **Effort:** 3 weeks

**US-4.2.1: Supplier Dashboard**
```
As a food supplier
I want to see which restaurants order what
So that I can target sales

Features:
- [ ] Anonymized aggregate data
- [ ] Top-selling items by region
- [ ] Demand forecast
- [ ] Contact restaurants (opt-in)
```

---

### Epic 4.3: White-label Platform
**Priority:** P2 | **Effort:** 4 weeks

**US-4.3.1: Multi-tenant Food Court**
```
As a food court manager
I want to run multiple restaurants under one system
So that customers have unified experience

Features:
- [ ] Single QR → Choose restaurant
- [ ] Unified payment (pay once for all restaurants)
- [ ] Shared analytics dashboard
- [ ] Revenue split by restaurant
```

---

## 🏛️ Technical Architecture {#architecture}

### System Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              Client Layer                        │
├─────────────────────────────────────────────────┤
│                                                  │
│  Customer App (PWA)    Admin Dashboard (Web)    │
│       │                        │                 │
│       │    Kitchen Display     │                 │
│       │         (Tablet)       │                 │
│       └────────────┬───────────┘                 │
│                    │                             │
└────────────────────┼─────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │    API Gateway (Next.js) │
        │    - Rate limiting       │
        │    - Auth middleware     │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │   Backend Services       │
        ├─────────────────────────┤
        │  Order Service (Node.js) │
        │  Payment Service         │
        │  Menu Service            │
        │  Analytics Service       │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │   Database Layer         │
        ├─────────────────────────┤
        │  PostgreSQL (Supabase)   │
        │  - Restaurants           │
        │  - Orders                │
        │  - Payments              │
        │  Redis (Cache)           │
        └─────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │  External Services       │
        ├─────────────────────────┤
        │  EasySlip API            │
        │  SlipOK API              │
        │  GPT-4 Vision API        │
        │  SMS Provider            │
        └─────────────────────────┘
```

### Database Schema (Core Tables)

```sql
-- Restaurants
CREATE TABLE restaurants (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  logo_url TEXT,
  settings JSONB,
  created_at TIMESTAMP
);

-- Menu Items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  name VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  category VARCHAR(100),
  image_url TEXT,
  is_available BOOLEAN,
  station_id VARCHAR(50)
);

-- Option Groups
CREATE TABLE option_groups (
  id UUID PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id),
  name VARCHAR(255),
  is_required BOOLEAN,
  max_selections INT
);

-- Options
CREATE TABLE options (
  id UUID PRIMARY KEY,
  option_group_id UUID REFERENCES option_groups(id),
  name VARCHAR(255),
  price_modifier DECIMAL(10,2)
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  table_number VARCHAR(50),
  status VARCHAR(50), -- pending, preparing, ready, completed
  total_amount DECIMAL(10,2),
  payment_method VARCHAR(50),
  payment_status VARCHAR(50),
  created_at TIMESTAMP
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INT,
  unit_price DECIMAL(10,2),
  selected_options JSONB,
  special_instructions TEXT,
  station_id VARCHAR(50),
  item_status VARCHAR(50) -- pending, preparing, done
);
```

### Tech Stack Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14 (App Router) | SSR, API routes, TypeScript support |
| **UI Library** | Tailwind CSS | Utility-first, fast prototyping |
| **Icons** | Lucide React | Lightweight, customizable |
| **State Mgmt** | Zustand / React Context | Simple, no Redux overhead |
| **Real-time** | Socket.io | WebSocket for kitchen display |
| **Backend** | Node.js + Express | Fast, good ecosystem |
| **Database** | PostgreSQL (Supabase) | Relational, built-in auth, realtime |
| **File Storage** | Supabase Storage | Integrated with DB |
| **Cache** | Redis | Session, frequently accessed data |
| **Payment** | PromptPay QR (Custom) | No gateway fees |
| **Slip Verify** | EasySlip + SlipOK + GPT-4 | Multi-provider reliability |
| **Deployment** | Vercel (FE) + Render (BE) | Easy scaling, CI/CD |
| **Monitoring** | Sentry + UptimeRobot | Error tracking, uptime monitoring |

---

## 📊 Feature Priority Matrix {#priority}

### Prioritization Framework: RICE Score
**RICE = (Reach × Impact × Confidence) / Effort**

| Feature | Reach | Impact | Confidence | Effort | RICE | Priority |
|---------|-------|--------|------------|--------|------|----------|
| Customer Ordering Flow | 1000 | 3 | 100% | 4 | **750** | P0 |
| Kitchen Display | 1000 | 3 | 100% | 3 | **1000** | P0 |
| Payment Processing | 1000 | 3 | 100% | 3 | **1000** | P0 |
| Offline Mode | 800 | 2 | 80% | 2 | **640** | P1 |
| Multi-provider Slip | 600 | 3 | 90% | 3 | **540** | P1 |
| Basic Inventory | 400 | 2 | 70% | 2 | **280** | P1 |
| Order Status Tracking | 700 | 1 | 80% | 1 | **560** | P1 |
| Analytics Dashboard | 300 | 2 | 90% | 2 | **270** | P2 |
| AI Recommendations | 200 | 2 | 50% | 3 | **67** | P2 |
| Loyalty Program | 500 | 1 | 60% | 2 | **150** | P2 |
| Voice Ordering | 100 | 1 | 40% | 3 | **13** | P4 |
| Delivery Integration | 300 | 2 | 50% | 4 | **75** | P3 |

### Priority Definitions

- **P0 (Must Have):** Blocking launch, core functionality
- **P1 (Should Have):** Important for adoption, scale
- **P2 (Nice to Have):** Improves experience, competitive advantage
- **P3 (Future):** Low priority, experimental
- **P4 (Backlog):** Interesting but not urgent

---

## 📅 Release Calendar {#calendar}

### 2025 Release Schedule

| Release | Date | Version | Key Features |
|---------|------|---------|--------------|
| **Alpha** | Jan 15 | v0.1 | Internal testing |
| **Beta** | Feb 15 | v0.5 | 5 pilot restaurants |
| **Public v1.0** | Mar 15 | v1.0 | Phase 1 complete (Foundation) |
| **v1.1** | Apr 15 | v1.1 | Advanced menu, Payment enhancements |
| **v1.2** | May 15 | v1.2 | Inventory, Staff management |
| **v1.3** | Jun 15 | v1.3 | Analytics, Multi-language |
| **v2.0** | Sep 15 | v2.0 | Phase 3 features (AI, Loyalty) |
| **v2.5** | Dec 15 | v2.5 | Phase 4 (Marketplace beta) |

### Sprint Planning (2-week sprints)

**Sprint Structure:**
- Week 1: Development + Daily standups
- Week 2: Testing + Bug fixes + Demo
- Friday W2: Sprint retrospective + Planning next sprint

**Team Capacity:**
- Month 1-6: Solo dev = 80 story points/month
- Month 7-12: 2 devs = 160 story points/month
- Month 13+: 3 devs + PM = 240 story points/month

---

## 🎯 Success Metrics per Feature

| Feature | Metric | Target |
|---------|--------|--------|
| **Ordering Flow** | Order completion rate | >90% |
| **Kitchen Display** | Avg order prep time | <15 min |
| **Payment** | Payment success rate | >98% |
| **Slip Verification** | Auto-approval rate | >95% |
| **Offline Mode** | Orders submitted in offline | <5% |
| **Analytics** | Feature usage | >80% of restaurants |
| **Multi-language** | Non-Thai orders | >10% |
| **Loyalty** | Repeat customer rate | +25% |

---

## 🚨 Risk Management

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Slip API vendor shutdown** | High | Multi-provider from Day 1 |
| **Poor internet at restaurants** | High | Offline-first architecture |
| **Feature creep** | Medium | Strict RICE prioritization |
| **Solo dev burnout** | High | Hire Junior dev by Month 7 |
| **Competitor clones feature** | Medium | Focus on speed & Thai UX |

---

## 📝 Next Steps

1. **Week 1:** Finalize tech stack choices, setup repos
2. **Week 2:** Start Epic 1.1 (Restaurant Management)
3. **Month 1 End:** Have restaurant onboarding working
4. **Month 2 End:** End-to-end order flow complete
5. **Month 3:** Beta launch with 5 restaurants

---

**Document Owner:** [Your Name] - Product Lead  
**Last Review:** December 14, 2025  
**Next Review:** January 15, 2025