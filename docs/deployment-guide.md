# 🚀 Deployment Guide (คู่มือการ Deploy)

## Overview (ภาพรวม)
Tanjai POS is deployed on [Vercel](https://vercel.com), leveraging its native support for Next.js. CI/CD is automated via Vercel's Git Integration.
Tanjai POS Deploy บน Vercel โดยใช้ระบบ CI/CD อัตโนมัติผ่าน Git

## 1. Prerequisites (สิ่งที่ต้องเตรียม)
- GitHub Repository connected to Vercel. (เชื่อมต่อ GitHub กับ Vercel)
- Supabase Project created (Development and Production environments recommended). (สร้างโปรเจกต์ Supabase)

## 2. Environment Variables Configuration (การตั้งค่าตัวแปรระบบ)

Configure the following variables in Vercel Project Settings > Environment Variables:

| Variable | Description | Exposed to Client? |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role (Admin) | **NO** |
| `NEXT_PUBLIC_APP_URL` | Canonical URL of the app | Yes |

> [!IMPORTANT]
> Never commit `.env` files to version control. Use `.env.example` for a template.
> ห้ามอัปโหลดไฟล์ `.env` ขึ้น Git ให้ใช้ `.env.example` เป็นตัวอย่างแทน

## 3. CI/CD Pipeline (Vercel)

### Automatic Deployments (Deploy อัตโนมัติ)
- **Push to `main`**: Triggers a **Production** deployment. (Deploy ขึ้น Production ทันทีเมื่ออัปเดต branch main)
- **Pull Requests**: Triggers a **Preview** deployment. Vercel generates a unique URL for testing. (สร้างเว็บทดสอบสำหรับทุก Pull Request)

### Build Verification (ตรวจสอบการ Build)
The build command runs the following before deployment succeeds:
คำสั่ง Build จะรันตรวจสอบดังนี้:
```bash
turbo run build
```

> [!NOTE]
> In Vercel Project Settings, ensure the **Root Directory** is set to `apps/web` if you are deploying the web app individually, or properly configure the Monorepo settings.
> ในการตั้งค่า Vercel อย่าลืมตั้ง Root Directory เป็น `apps/web`

Ensure `next.config.ts` handles build errors strictly (e.g., TypeScript or ESLint errors will fail the build if not ignored, which is good practice).

## 4. Post-Deployment Verification (ตรวจสอบหลัง Deploy)
After a successful deployment:
1. **Health Check**: Visit the URL and ensure the landing page loads. (เข้าหน้าเว็บดูว่าโหลดได้ไหม)
2. **PWA Check**: Open DevTools > Application > Service Workers to verify SW installation. (เช็คว่า PWA ทำงานไหม)
3. **Database Connection**: Attempt a login to verify Supabase connectivity. (ลอง Login เพื่อเช็คฐานข้อมูล)

## 5. Rollbacks (การย้อนเวอร์ชัน)
If a critical bug is found:
หากเจอบั๊กร้ายแรง:
1. Go to Vercel Dashboard > Deployments.
2. Find the previous stable deployment. (หาเวอร์ชันก่อนหน้าที่ใช้งานได้ปกติ)
3. Click **"Redeploy"** or **"Promote to Production"** to rollback instantly. (กด Redeploy เพื่อย้อนกลับทันที)
