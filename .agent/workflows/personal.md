---
description: Full-stack feature implementation flow for Tanjai POS: Business Logic -> Supabase -> UI -> Integration -> Playwright Tests.
---

# Tanjai POS Feature Implementation Workflow

This workflow guides the development of new features to ensure they are business-aligned, scalable, and fully tested.

## Step 1: 🏢 Business & Paywall Logic Check
- **Objective:** Define the business value and subscription tier.
- **Action:**
  - Ask: "Is this feature for Free users or Paid subscribers?"
  - If Paid: Plan where to inject the `checkSubscription()` logic or Paywall guard.
  - If Free: Ensure it drives users toward the premium upgrade path.

## Step 2: 🗄️ Data Layer (Supabase)
- **Objective:** Secure and efficient data structure.
- **Action:**
  - Define new Tables or Columns needed in Supabase.
  - **CRITICAL:** Write Row Level Security (RLS) policies immediately to secure tenant data.
  - Generate TypeScript types from the database schema.

## Step 3: 🧩 UI Component Construction
- **Objective:** Reusable and mobile-responsive UI.
- **Action:**
  - Create isolated components in the `@tanjai/ui` package first.
  - Ensure 'Mobile First' design (critical for POS Kiosks/Handhelds).
  - Use established design tokens for consistency.

## Step 4: 🔄 Logic Integration & State
- **Objective:** Connect UI to Data with strict typing.
- **Action:**
  - Implement the logic using React Hooks / Query.
  - Handle Loading and Error states explicitly.
  - Ensure all data inputs are strictly typed (TypeScript).

## Step 5: 🤖 Automation & QA (The "Process" Layer)
- **Objective:** Prevent regression and automate checks.
- **Action:**
  - Write a **Playwright E2E test** for the "Happy Path" of this feature.
  - If the feature involves a complex workflow (e.g., KDS status change), write a specific test case for that flow.

## Step 6: ✅ Final Code Review
- **Checklist:**
  - [ ] Does it respect the Paywall?
  - [ ] Are RLS policies in place?
  - [ ] Is the Playwright test passing?
  - [ ] Is the code "Cost-Efficient" (avoiding unnecessary re-renders or heavy queries)?