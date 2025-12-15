# 🐛 Debugging & Troubleshooting Guide (คู่มือการแก้ปัญหา)

## 1. Development Debugging (การแก้ปัญหาขณะพัฒนา)

### Next.js Server vs Client
- **Server Logs**: Check the terminal where `npm run dev` is running for server-side errors (RSC, API Routes).
  ดู Terminal สำหรับ Error ฝั่ง Server
- **Client Logs**: Check Browser Console (F12) for client-side errors (Hydration mismatches, Event handlers).
  ดู Browser Console (F12) สำหรับ Error ฝั่ง Client
- **Hydration Errors**: Often caused by invalid HTML nesting (e.g., `<div>` inside `<p>`) or random values (Date.now()) generated during render. Use `useEffect` or `suppressHydrationWarning` if necessary.
  ปัญหานี้เกิดจาก HTML ฝั่ง Server ไม่ตรงกับ Client (เช่น ใช้ random id)

### Supabase Debugging
- **401 Unauthorized**: Usually RLS policy failure. (มักเกิดจาก RLS Policy ไม่ผ่าน)
  - Check `Policies` tab in Supabase Dashboard.
  - Ensure the user is actually signed in (`supabase.auth.getSession()`).
- **Data missing**: Check RLS policies. If using `select()`, RLS might filter out rows silently. (ถ้าหาข้อมูลไม่เจอ ให้เช็ค RLS)
- **Network Tab**: Inspect the XHR/Fetch requests to `supabase.co`. Look at the Response Preview for detailed JSON error messages.

## 2. PWA & Offline Debugging

- **Service Worker Updates**: Browser DevTools > Application > Service Workers.
  - Check "Update on reload" during development to force SW updates.
- **Manifest Issues**: Chrome DevTools > Application > Manifest.
  - Verify "Installability" warnings.
- **Offline Data**: Check IndexedDB storage in DevTools to verify if transactions are being saved locally when offline.
  เช็ค IndexedDB ว่าข้อมูลถูกบันทึกตอนออฟไลน์ไหม

## 3. Common Error Scenarios (ปัญหาที่พบบ่อย)

| Error Message | Possible Cause | Solution |
| :--- | :--- | :--- |
| `Hydration failed because...` | Server HTML != Client HTML | Check for invalid nesting or random data generation. |
| `module not found` | Import path errors | Check absolute imports (`@/components/...`) vs relative. |
| `Database error: new row violates...` | RLS or Constraint | Check Postgres policies and Table Constraints (Foreign Keys). |
| `504 Gateway Timeout` (Vercel) | Long running API | Vercel Serverless Function limit (10s/60s). Optimize query or use Edge Functions. |

## 4. Tools (เครื่องมือช่วย)
- **React Developer Tools**: Inspect component hierarchy and props.
- **Redux/Zustand DevTools**: Inspect state changes if using a store.
- **Lighthouse**: Run audit for PWA and Performance scores.
