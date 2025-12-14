# 🔒 Tanjai POS Security Audit Checklist

## 1. Frontend Security (Next.js & React)

- [ ] **Content Security Policy (CSP)**
  - [ ] Implement strict CSP headers in `next.config.ts` or middleware.
  - [ ] mitigate XSS by restricting script sources (e.g., `script-src 'self'`).
- [ ] **Input Sanitization**
  - [ ] Ensure all user inputs are validated using Zod schemas before processing.
  - [ ] Use React's built-in escaping to prevent XSS (avoid `dangerouslySetInnerHTML`).
- [ ] **Authentication State**
  - [ ] Verify Supabase session persistence is secure (HttpOnly cookies preferred over localStorage for tokens where possible, though Supabase default is localStorage).
  - [ ] Handle token expiration gracefully.
- [ ] **Dependency Audit**
  - [ ] Run `npm audit` regularly to check for vulnerable packages.

## 2. Backend & Database Security (Supabase)

- [ ] **Row Level Security (RLS)**
  - [ ] **CRITICAL**: Verify RLS is enabled on ALL tables (`ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`).
  - [ ] Test policies for all roles (Owner, Manager, Staff) to ensure no data leakage between tenants.
  - [ ] Ensure `service_role` key is NEVER exposed to the client.
- [ ] **Authentication & Authorization**
  - [ ] Enforce strong password policies (via Supabase Auth settings).
  - [ ] Enable MFA (if applicable for admin accounts).
  - [ ] Validate standard email confirmation flows.
- [ ] **Database Hardening**
  - [ ] Restrict direct database access; use connection pooling (Supavisor) properly.
  - [ ] Review PostgreSQL extensions; enable only what is necessary (e.g., `pgcrypto`, `uuid-ossp`).

## 3. Infrastructure & Deployment (Vercel)

- [ ] **Environment Variables**
  - [ ] `NEXT_PUBLIC_` prefix used ONLY for non-sensitive data.
  - [ ] Service keys (Supabase Service Role, Stripe Secret) stored in Vercel Encrypted Environment Variables.
- [ ] **Protection features**
  - [ ] Enable Vercel Attack Challenge Mode or Firewall if required.
  - [ ] Configure DDoS mitigation settings (standard on Vercel).
- [ ] **Logging & Monitoring**
  - [ ] Set up log drains (e.g., to Datadog or specialized logging) if needed for audit trails.
  - [ ] Monitor for unusual spike in calls to sensitive API endpoints.

## 4. Compliance & Data Privacy

- [ ] **PDPA / GDPR**
  - [ ] Ensure user consent forms are present for data collection.
  - [ ] mechanism for users to request data deletion (Right to match `DELETE` policies).
- [ ] **Payments**
  - [ ] If handling payments, ensure PCI-DSS compliance (use Stripe Elements/SDKs to avoid handling raw card data).
