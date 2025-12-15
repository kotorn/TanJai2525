# 🚀 Deployment Guide (CI/CD Pipeline)

## Overview
Tanjai POS is deployed on [Vercel](https://vercel.com), leveraging its native support for Next.js. CI/CD is automated via Vercel's Git Integration.

## 1. Prerequisites
- GitHub Repository connected to Vercel.
- Supabase Project created (Development and Production environments recommended).

## 2. Environment Variables Configuration

Configure the following variables in Vercel Project Settings > Environment Variables:

| Variable | Description | Exposed to Client? |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role (Admin) | **NO** |
| `NEXT_PUBLIC_APP_URL` | Canonical URL of the app | Yes |

> [!IMPORTANT]
> Never commit `.env` files to version control. Use `.env.example` for a template.

## 3. CI/CD Pipeline (Vercel)

### Automatic Deployments
- **Push to `main`**: Triggers a **Production** deployment.
- **Pull Requests**: Triggers a **Preview** deployment. Vercel generates a unique URL for testing.

### Build Verification
The build command runs the following before deployment succeeds:
```bash
turbo run build
```

> [!NOTE]
> In Vercel Project Settings, ensure the **Root Directory** is set to `apps/web` if you are deploying the web app individually, or properly configure the Monorepo settings.

Ensure `next.config.ts` handles build errors strictly (e.g., TypeScript or ESLint errors will fail the build if not ignored, which is good practice).

## 4. Post-Deployment Verification
After a successful deployment:
1. **Health Check**: Visit the URL and ensure the landing page loads.
2. **PWA Check**: Open DevTools > Application > Service Workers to verify SW installation.
3. **Database Connection**: Attempt a login to verify Supabase connectivity.

## 5. Rollbacks
If a critical bug is found:
1. Go to Vercel Dashboard > Deployments.
2. Find the previous stable deployment.
3. Click **"Redeploy"** or **"Promote to Production"** to rollback instantly.
