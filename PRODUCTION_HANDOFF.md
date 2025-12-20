# 🏁 Production Hand-off Guide

This document outlines the final steps to transition **Tanjai POS** from the current "Ready for Prod" state (using mock data) to a live production environment with real data.

## 1. Supabase Project Setup

1. **Create a New Project**: Go to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. **Database Schema**: Apply the database schema (tables, RLS policies, functions). 
   - *Note: Check `packages/database` or `supabase/migrations` if available in the repository.*
3. **Seed Data**: Populate `system_plans` and `menu_categories` to match the application's logic.

## 2. Environment Variables [.env.local]

Replace the mock values in `apps/web/.env.local` with your actual Supabase credentials:

```bash
# --- CRITICAL: Production Credentials ---
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]

# --- Domain ---
NEXT_PUBLIC_ROOT_DOMAIN=tanjai.app
```

**⚠️ Important**: After updating `.env.local`, you MUST restart the dev server or rebuild the application.

## 3. Verify Configuration

Run the automated validator to ensure everything is set up correctly:

```bash
cd apps/web
npm run validate-env
```

## 4. Run Regression Tests

Before going live, run the regression suite against your production Supabase instance:

```bash
# Terminal 1
npm run start

# Terminal 2
npm run test:regression
```

## 5. Deployment Options

### ✅ Vercel (Recommended)
1. Link your GitHub repository to Vercel.
2. Add the environment variables from `.env.local` to Vercel Project Settings.
3. Vercel will auto-deploy based on the GitHub Actions workflow we set up.

### ✅ Manual VPS (Docker/PM2)
1. Build the project: `npm run build`
2. Start with PM2: `pm2 start npm --name "tanjai-web" -- start`

## 🛡️ Security Reminders

- **Supabase RLS**: Ensure Row Level Security (RLS) is enabled on all tables.
- **Service Role Key**: NEVER use `SUPABASE_SERVICE_ROLE_KEY` in client-side code (`src/lib/supabase/client.ts`). It should only be used in Server Actions or API routes.
- **Branch Protection**: We recommend enabling "Require status checks to pass before merging" in GitHub for the `main` branch to ensure CI tests always pass.

---

**Congratulations!** Tanjai POS is now optimized, tested, and ready for your first customer. 🚀
