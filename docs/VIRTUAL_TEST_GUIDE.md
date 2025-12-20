# Virtual Test Guide (Live Production)

**Objective**: Verify system capabilities on the Live Production environment using a "Super Admin" account before enforcing Paywall restrictions.

## 1. Prerequisites
- [ ] Active Supabase Production Project.
- [ ] User account created on Production (Registration/Login completed).

## 2. Setup: Promote User to Super Admin
*This step must be done by a Developer or Database Admin.*

1.  Open **Supabase Dashboard** > **SQL Editor**.
2.  Open/Paste the script: `supabase/scripts/promote_to_super_admin.sql`.
3.  Replace `REPLACE_WITH_USER_EMAIL` with your email (e.g., `user@example.com`).
4.  **Run** the script.
5.  Verify the output says "SUCCESS".

## 3. Test Scenarios

### A. Admin Dashboard Access
1.  Navigate to `https://[YOUR_PROD_URL]/admin`.
2.  **Verify**: You can see the Admin Dashboard sidebar and content.
    - [ ] PASS / FAIL

### B. Tenant Management
1.  Navigate to `/admin/tenants`.
2.  **Verify**: You see a list of registered tenants/restaurants.
3.  **Action**: Click "View" on a tenant.
    - [ ] PASS / FAIL

### C. Subscription Bypass (Simulation)
*As a Super Admin, verify you can access features that will be locked.*
1.  Navigate to a Tenant's dashboard `/app/[slug]`.
2.  **Action**: Try to access a "premium" feature (if currently tagged) or simply ensure full access to Menu/Orders.
    - [ ] PASS / FAIL

## 4. User Experience (UX) Feedback Collection
*While testing, observe and answer the following questions to improve the product.*

### General Feel
- [ ] **Speed**: Does the Admin Dashboard load quickly? (Yes/No/Laggy)
- [ ] **Clarity**: Are the labels (e.g., "Tenants", "Subscriptions") easy to understand?

### Friction Points
- [ ] **Navigation**: Did you get lost at any point? If so, where?
    *   *Notes:* ___________________
- [ ] **Mobile**: (If testing on mobile) Is the Admin UI usable on a small screen?
    *   *Notes:* ___________________

### Wishlist
- [ ] What is **one thing** you wish you could see on the Admin Dashboard right now?
    *   *Notes:* ___________________
