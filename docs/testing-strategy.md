# 🧪 Testing Strategy

## Overview
We aim for a balanced testing pyramid:
1. **Unit Tests** (Fast, Isolated)
2. **Integration Tests** (Component interactions)
3. **E2E Tests** (Critical User Flows)

## 1. Unit Testing (Jest / Vitest)
- **Scope**: Utility functions, hooks, helper classes.
- **Tool**: `Vitest` (preferred for Vite/Next.js ecosystem).
- **Naming**: `filename.test.ts`.

### What to test?
- Price calculation logic (Tax, discounts).
- Data transformation helpers.
- Validation functions.

## 2. Integration Testing (React Testing Library)
- **Scope**: Reusable UI components, Forms.
- **Tool**: `@testing-library/react`.

### Best Practices
- Test **behavior**, not implementation details.
- Use `screen.getByRole` to query elements (promotes accessibility).
- Mock network requests (Supabase calls) using `msw` or simple jest mocks.

## 3. End-to-End (E2E) Testing (Playwright)
- **Scope**: Critical user journeys that MUST work.
- **Tool**: Playwright.

### Critical Flows to Cover
1. **Authentication**: Login, Logout, Password Reset.
2. **POS Transaction**: Add item -> Checkout -> Payment Success.
3. **Offline Mode**: Disconnect network -> Create Order -> Reconnect -> Verify Sync.

### Running E2E Locally
```bash
npx playwright test -c apps/web/playwright.config.ts
```

## 4. Manual QA Checklist
Before a major release, verify:
- [ ] Responsive Design (Mobile, Tablet, Desktop).
- [ ] Dark/Light mode consistency.
- [ ] Error handling (Network disconnect, Server error).
- [ ] Accessibility (Keyboard navigation, Screen reader).
