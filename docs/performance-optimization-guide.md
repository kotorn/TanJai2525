# 📊 Performance Optimization Guide

## 1. Next.js & React Optimization

### Server Components (RSC)
- **Default to Server**: Keep components as Server Components by default to reduce client-side JavaScript bundle size.
- **`"use client"` sparingly**: Only add `"use client"` at the leaves of the component tree where interactivity (useState, useEffect) is strictly needed.

### Image Optimization
- Use `next/image` for all images to ensure:
  - Automatic WebP/AVIF serving.
  - Lazy loading (default).
  - Explicit size attributes to avoid Cumulative Layout Shift (CLS).

### Font Optimization
- Use `next/font` (Google Fonts) to self-host fonts automatically and prevent layout shifts (FOUT/FOIT).

```tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
```

## 2. PWA & Caching (Serwist)

- **Service Worker Strategy**:
  - **Stale-While-Revalidate**: For assets that change infrequently (CSS, JS, Logos).
  - **Network-First**: For API calls that need fresh data.
- **Precaching**: Ensure critical shell assets are precached for offline start.
- **Cache Size**: Monitor cache storage usage to prevent bloating user devices.

## 3. Database Performance (Supabase)

- **Indexing**:
  - Add indexes to columns frequently queried in `WHERE`, `ORDER BY`, or `JOIN` clauses.
  - Example: `CREATE INDEX idx_orders_created_at ON orders(created_at DESC);`
- **Selectivity**: Avoid `SELECT *`. Explicitly select columns needed: `.select('id, name, price')`.
- **Relationship Rendering**: Be cautious with deep nesting in queries. Fetch only what is required.

## 4. Bundle Analysis

- Run `npm run build` locally to see bundle sizes.
- Use `@next/bundle-analyzer` if the app/page size exceeds recommendations (>128kB gzipped).

## 5. Measurements (Core Web Vitals)
- **LCP (Largest Contentful Paint)**: Target < 2.5s.
- **FID (First Input Delay)** / **INP (Interaction to Next Paint)**: Target < 200ms.
- **CLS (Cumulative Layout Shift)**: Target < 0.1.
