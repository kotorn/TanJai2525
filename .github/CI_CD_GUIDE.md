# CI/CD Setup Guide - Tanjai POS

This project uses **GitHub Actions** for automated testing and deployment.

## 📋 Required Secrets

Configure these in GitHub repository settings (`Settings → Secrets and variables → Actions`):

### Supabase (Required for builds)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Production Domain
```
NEXT_PUBLIC_ROOT_DOMAIN=tanjai.app
```

### Vercel Deployment (Optional)
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

**How to get Vercel tokens**:
1. Go to https://vercel.com/account/tokens
2. Create new token
3. Get ORG_ID and PROJECT_ID from project settings

## 🚀 Workflow Triggers

**Runs on**:
- Push to `main` or `develop` branches
- Pull requests to `main`

**Jobs**:
1. **Build & Test** - Production build + Regression tests (84 tests)
2. **Lint & Type Check** - Code quality validation
3. **Deploy** - Auto-deploy to Vercel (only on `main` push after tests pass)
4. **Security** - npm audit + secret scanning

## 📊 Test Results

**Artifacts uploaded on failure**:
- `playwright-test-results/` - Screenshots, videos, traces
- `playwright-report/` - HTML test report

**Retention**: 7 days

## 🔧 Local Testing

**Test CI workflow locally** (using `act`):
```bash
# Install act
npm install -g act

# Run all jobs
act push

# Run specific job
act push -j test
```

## ⚡ Performance

**Expected durations**:
- Build & Test: ~8-10 minutes
- Lint: ~2-3 minutes
- Deploy: ~3-5 minutes
- Security: ~1-2 minutes

**Total**: ~15 minutes (jobs run in parallel)

## 🎯 Deployment Flow

```
Push to main
    ↓
Build & Test (parallel) ✅
Lint & Type Check (parallel) ✅
Security Audit (parallel) ✅
    ↓
All passed?
    ↓
Deploy to Vercel Production 🚀
```

## 🚨 Troubleshooting

### Build fails with "Missing environment variables"
→ Check GitHub Secrets are configured correctly

### Playwright tests timeout
→ Increase `timeout-minutes` in workflow or optimize tests

### Vercel deployment fails
→ Verify `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` are correct

### npm audit fails
→ Review vulnerabilities, run `npm audit fix` locally

## 📈 Monitoring

**Check workflow status**:
- GitHub repository → Actions tab
- Badge: `![CI](https://github.com/your-org/TanJai2525/workflows/Production%20Pre-flight%20%26%20Deployment/badge.svg)`

**Email notifications**:
- GitHub sends emails on workflow failures
- Configure in: Settings → Notifications
