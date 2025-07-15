# Deployment Checklist - Environment Variables & Secrets

## Pre-Deployment Checklist

### ✅ Git Repository Status
- [ ] All environment files contain only placeholder values (no real secrets)
- [ ] `.env.local` files are properly gitignored
- [ ] `.env.production` files contain only public variables and placeholders

### ✅ Next.js Web App (`apps/web`)
**Public Variables (Safe to commit):**
- `NEXT_PUBLIC_APP_NAME=Useless Web`
- `NEXT_PUBLIC_APP_VERSION=1.0.0`
- `NEXT_PUBLIC_ENVIRONMENT=production`
- `NEXT_PUBLIC_BASE_URL=https://tryuseless.com`
- `NEXT_PUBLIC_HITMAKER_URL=https://tryuseless.com/hitmaker`
- `NEXT_PUBLIC_PRISMIC_ENVIRONMENT=tryuseless`
- `NEXT_PUBLIC_ENABLE_ANALYTICS=true`
- `NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true`

**Private Variables (Configure in Vercel Dashboard):**
- [ ] `PRISMIC_ACCESS_TOKEN` - Configure in Vercel if using private Prismic content
- [ ] `API_SECRET_KEY` - Configure if using internal APIs
- [ ] `WEBHOOK_SECRET` - Configure if using webhooks
- [ ] `DATABASE_URL` - Configure if using database
- [ ] `EXTERNAL_API_KEY` - Configure if using external APIs
- [ ] `EMAIL_SERVICE_API_KEY` - Configure if using email services

### ✅ Hitmaker App (`apps/hitmaker`)
**Public Variables (Safe to commit):**
- `REACT_APP_APP_NAME=Hitmaker`
- `REACT_APP_USE_NEW_METRONOME=true`
- `REACT_APP_ENVIRONMENT=production`
- `REACT_APP_LOG_LEVEL=error`
- `REACT_APP_ENABLE_PERFORMANCE_MONITORING=true`
- `REACT_APP_BUNDLE_ANALYZER=false`

**Analytics Variables (Update with production values):**
- [ ] `REACT_APP_POSTHOG_KEY` - Update with production PostHog key
- [ ] `REACT_APP_POSTHOG_HOST=https://eu.i.posthog.com`

**Private Variables (Configure in deployment platform):**
- [ ] `API_SECRET_KEY` - Configure if using internal APIs
- [ ] `WEBHOOK_SECRET` - Configure if using webhooks
- [ ] `EXTERNAL_API_KEY` - Configure if using external APIs

## Production Deployment Steps

### 1. Vercel Configuration
```bash
# Configure environment variables in Vercel Dashboard
# Or using Vercel CLI:
vercel env add PRISMIC_ACCESS_TOKEN production
vercel env add API_SECRET_KEY production
# ... add other secrets as needed
```

### 2. Update PostHog Keys
- [ ] Replace development PostHog key with production key in `apps/hitmaker/.env.production`
- [ ] Verify PostHog host URL is correct for production

### 3. Verify Build Configuration
- [ ] `GENERATE_SOURCEMAP=false` in production
- [ ] `NEXT_TELEMETRY_DISABLED=1` for Next.js
- [ ] `PUBLIC_URL=/hitmaker` for Hitmaker app

### 4. Test Environment Variable Scoping
- [ ] Public variables are accessible in browser
- [ ] Private variables are NOT accessible in browser
- [ ] No secrets are exposed in client-side bundles

## Post-Deployment Verification

### ✅ Security Checks
- [ ] No actual secrets committed to git
- [ ] Environment variables properly scoped (public vs private)
- [ ] Production secrets configured in deployment platform
- [ ] No cross-project variable leakage

### ✅ Functionality Tests
- [ ] Web app loads with correct environment
- [ ] Hitmaker app loads with correct environment
- [ ] Prismic CMS integration works (if applicable)
- [ ] Analytics tracking works (if enabled)
- [ ] All public URLs resolve correctly

## Current Status
✅ **READY FOR DEPLOYMENT**

**Safe to push:** All environment files contain only placeholder values or public configuration. No actual secrets are committed to the repository.

**Action Required:** Configure production secrets in your deployment platform (Vercel) before or immediately after deployment.
