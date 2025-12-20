# Production Deployment

## Live URLs

### Primary Production
**URL:** https://tan-jai2525.vercel.app/  
**Environment:** Vercel Production  
**Last Updated:** 2025-12-20  
**Status:** ✅ Active

### QA Reference
- **Local Dev:** http://localhost:3000
- **Live Prod:** https://tan-jai2525.vercel.app/

## Quick Access
| Feature | Local | Production |
|---------|-------|------------|
| Customer Menu | http://localhost:3000 | https://tan-jai2525.vercel.app/ |
| Admin QR | http://localhost:3000/admin/qr | https://tan-jai2525.vercel.app/admin/qr |
| Login | http://localhost:3000/login | https://tan-jai2525.vercel.app/login |
| ERP | http://localhost:3002 | (Separate deployment) |

## Deployment Info
- **Platform:** Vercel
- **Framework:** Next.js
- **Build Command:** `npx turbo run build --filter=web`
- **Config:** See `vercel.json`
