# Tanjai POS - Developer Guide

## Prerequisities
- Node.js 18+
- npm 10+
- PowerShell (for Windows)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repo_url>
   cd tanjai-pos
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env.local` in `apps/web`.
   - Update `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000`.

## Monorepo Structure
- `apps/web`: The main Next.js application.
- `packages/ui`: Shared UI components (based on Shadcn/UI).
- `packages/database`: Database schema and utilities.

## Testing
- **E2E Tests**: `npm run test:e2e` (Runs Playwright).
- **Simulation**: `npm run simulate` (Runs "One Day at Tanjai" scenario).
