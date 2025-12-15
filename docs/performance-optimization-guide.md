# 📊 Performance Optimization Guide (คู่มือเพิ่มประสิทธิภาพ)

## 1. Next.js & React Optimization

### Server Components (RSC)
- **Default to Server**: Keep components as Server Components by default to reduce client-side JavaScript bundle size.
  ใช้ Server Component เป็นค่าเริ่มต้นเพื่อลดขนาด JS
- **`"use client"` sparingly**: Only add `"use client"` at the leaves of the component tree where interactivity (useState, useEffect) is strictly needed.
  ใช้ `"use client"` เท่าที่จำเป็นจริงๆ (เฉพาะส่วนที่ต้องโต้ตอบกับผู้ใช้)

### Image Optimization (ปรับแต่งรูปภาพ)
- Use `next/image` for all images to ensure:
  - Automatic WebP/AVIF serving. (แปลงไฟล์อัตโนมัติ)
  - Lazy loading (default). (โหลดเฉพาะเมื่อเลื่อนถึง)
  - Explicit size attributes to avoid Cumulative Layout Shift (CLS). (ระบุขนาดเพื่อป้องกันหน้ากระตุก)

### Font Optimization (ปรับแต่งฟอนต์)
- Use `next/font` (Google Fonts) to self-host fonts automatically and prevent layout shifts (FOUT/FOIT).
  ใช้ `next/font` เพื่อลดเวลาโหลดและป้องกันฟอนต์กระพริบ

```tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
```

## 2. PWA & Caching (Serwist)

- **Service Worker Strategy**:
  - **Stale-While-Revalidate**: For assets that change infrequently (CSS, JS, Logos). (สำหรับไฟล์ที่ไม่เปลี่ยนบ่อย)
  - **Network-First**: For API calls that need fresh data. (สำหรับข้อมูล API ที่ต้องใหม่อยู่เสมอ)
- **Precaching**: Ensure critical shell assets are precached for offline start.
- **Cache Size**: Monitor cache storage usage to prevent bloating user devices.

## 3. Database Performance (Supabase)

- **Indexing**:
  - Add indexes to columns frequently queried in `WHERE`, `ORDER BY`, or `JOIN` clauses.
    ทำ Index ให้คอลัมน์ที่ค้นหาบ่อย
  - Example: `CREATE INDEX idx_orders_created_at ON orders(created_at DESC);`
- **Selectivity**: Avoid `SELECT *`. Explicitly select columns needed: `.select('id, name, price')`.
  เลือกเฉพาะคอลัมน์ที่ใช้ อย่าดึงมาทั้งหมด
- **Relationship Rendering**: Be cautious with deep nesting in queries. Fetch only what is required.

## 4. Bundle Analysis (วิเคราะห์ขนาดแอป)

- Run `npm run build` locally to see bundle sizes.
- Use `@next/bundle-analyzer` if the app/page size exceeds recommendations (>128kB gzipped).

## 5. Measurements (Core Web Vitals)
**ค่าชี้วัดความเร็ว**
- **LCP (Largest Contentful Paint)**: Target < 2.5s. (เวลาโหลดเนื้อหาหลัก)
- **FID (First Input Delay)** / **INP (Interaction to Next Paint)**: Target < 200ms. (เวลาตอบสนองเมื่อคลิก)
- **CLS (Cumulative Layout Shift)**: Target < 0.1. (ความนิ่งของหน้าเว็บ ไม่กระตุกไปมา)
