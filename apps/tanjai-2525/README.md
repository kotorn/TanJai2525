# TanJai 2525 - LINE LIFF POS Application

> **Mission 2525: Phase 1** - LIFF Integration & Loyverse Connector for 2525minishop

## 📋 Overview

LINE Front-end Framework (LIFF) application ที่เชื่อมต่อกับ Loyverse POS สำหรับร้านอาหารญี่ปุ่น 2525minishop โดยเป็นส่วนหนึ่งของ TanJai POS Monorepo

### Features

- ✅ LINE LIFF Authentication
- ✅ Multi-language Support (Thai/English)
- ✅ Loyverse API Integration (Product Sync & Order Push)
- ✅ Supabase RLS (Row-Level Security)
- ✅ TypeScript Strict Mode
- ✅ Shared UI Components (`@tanjai/ui`)

---

## 🚀 Getting Started

### Prerequisites

1. **LINE Developers Account** - สำหรับสร้าง LIFF App
2. **Loyverse Account** - สำหรับ API Token
3. **Supabase Project** - ใช้ร่วมกับ `apps/web`

### Installation

```bash
# Navigate to app directory
cd apps/tanjai-2525

# Install dependencies
npm install --legacy-peer-deps

# Copy environment variables
cp .env.local.example .env.local
```

### Environment Setup

แก้ไขไฟล์ `.env.local`:

```env
# Supabase (Shared with apps/web)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# LINE LIFF Configuration
# 1. Create LIFF App: https://developers.line.biz/console/
# 2. Set Endpoint URL: https://your-domain.com/th (or /en)
# 3. Copy LIFF ID
NEXT_PUBLIC_LIFF_ID=1234567890-abcdefgh

# Loyverse API Configuration
# 1. Get API Token: https://r.loyverse.com/dashboard/settings/api_tokens
# 2. Find Store ID in Loyverse dashboard
LOYVERSE_API_TOKEN=your-api-token
LOYVERSE_STORE_ID=your-store-id
```

### Development

```bash
# Start dev server on port 3001
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

Open [http://localhost:3001/th](http://localhost:3001/th) in your browser (or open in LINE app for full LIFF features).

---

## 📁 Project Structure

```
src/
├── app/
│   ├── [locale]/           # i18n routing
│   │   ├── layout.tsx      # Root layout with providers
│   │   └── page.tsx        # Home page
│   └── api/
│       └── loyverse/       # Loyverse webhook & sync endpoints
├── components/             # App-specific components
├── lib/
│   └── loyverse.ts         # Loyverse API client
├── providers/
│   └── LiffProvider.tsx    # LIFF SDK context
├── types/
│   ├── liff.ts             # LIFF type definitions
│   └── loyverse.ts         # Loyverse API types
├── i18n/
│   └── request.ts          # i18n configuration
└── middleware.ts           # Locale detection
```

---

## 🔗 Integration with Monorepo

### Shared Packages

```typescript
// UI Components
import { Button, Card } from '@tanjai/ui';

// Database Types
import type { MenuItem } from '@tanjai/database';
```

### Database Schema

ใช้ schema ร่วมกับ `apps/web` โดยแยก tenant ด้วย `tenant_id`:

- `menu_items` - Product catalog (synced from Loyverse)
- `sales_receipts` - Orders
- `tenants` - Store configuration

---

## 🛠 Development Workflow

### 1. LIFF Testing

**In Browser (Development):**
- LIFF จะ initialize แต่ไม่สามารถ login ได้ (ต้องเปิดใน LINE)
- สามารถทดสอบ UI และ i18n ได้ปกติ

**In LINE App (Production):**
1. Deploy to Vercel/Production
2. Register LIFF Endpoint URL in LINE Console
3. Open LIFF URL in LINE chat
4. Test LINE Login flow

### 2. Loyverse Integration

**Product Sync (Import):**
```typescript
import { createLoyverseClient } from '@/lib/loyverse';

const client = createLoyverseClient();
const items = await client.getItems();
```

**Order Push (Export):**
```typescript
const receipt = await client.createReceipt({
  receipt_type: 'SELL',
  store_id: process.env.LOYVERSE_STORE_ID,
  // ... receipt data
});
```

### 3. i18n Language Switching

```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations();
  
  return <h1>{t('common.welcome')}</h1>;
}

// URL-based: /th or /en
```

---

## 📝 Mission 2525 Roadmap

### ✅ Phase 1: Foundation (Completed)
- [x] LIFF SDK Integration
- [x] i18n Setup (Thai/English)
- [x] Loyverse API Client
- [x] Project Structure
- [x] Shared Package Integration

### 🔄 Phase 2: Core Features (Next)
- [ ] LINE Login with Supabase Auth
- [ ] Product Catalog UI
- [ ] Shopping Cart
- [ ] Order Management

### 🔜 Phase 3: Loyverse Sync
- [ ] Product Sync Cron Job
- [ ] Inventory Tracking
- [ ] Order Push on Ship

### 🔜 Phase 4: Packing Station
- [ ] KDS-inspired Packing UI
- [ ] "Pack & Ship" Trigger
- [ ] Auto Stock Deduction

---

## 🐛 Troubleshooting

### LIFF Not Initializing

```
Error: LIFF ID not configured
```
**Solution:** ตรวจสอบว่า `NEXT_PUBLIC_LIFF_ID` ถูกต้องใน `.env.local`

### next-intl Dependency Error

```
ERESOLVE unable to resolve dependency tree
```
**Solution:** ใช้ `--legacy-peer-deps` เพราะ next-intl ยังไม่รองรับ Next.js 16 อย่างเป็นทางการ

### Shared Package Import Error

```
Cannot find module '@tanjai/ui'
```
**Solution:** รัน `npm install` ใน root workspace และ verify turbo cache

---

## 📚 References

- [LINE LIFF Documentation](https://developers.line.biz/en/docs/liff/)
- [Loyverse API Docs](https://developer.loyverse.com/docs/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [next-intl](https://next-intl-docs.vercel.app/)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

---

## 👥 Team

**Project:** TanJai POS  
**Mission:** 2525 - LIFF Integration & Loyverse Connector  
**Stack:** Next.js 16 + LIFF + Supabase + Loyverse

---

**Last Updated:** 2025-12-19  
**Status:** ✅ Phase 1 Complete - Ready for Phase 2
