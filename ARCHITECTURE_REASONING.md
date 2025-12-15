# Architecture Reasoning for Tanjai POS

## 1. Feature-Driven Architecture (FDA) & Monorepo
**Goal:** Increase Developer Velocity for Solo Developer.

-   **Why FDA?**: By grouping code by feature (`ordering`, `inventory`) rather than technical type (`components`, `hooks`), context switching is reduced. When working on "Ordering", you have the UI, State, and Actions in one folder. This fits a **Solo Developer** workflow perfectly as you typically built one vertical slice at a time.
-   **Why Monorepo (Lightweight)?**: Keeping `apps/web` and `packages/database` in one repo simplifies dependency management and ensures the Frontend always uses the latest Schema types without publishing packages.

## 2. Server Actions instead of API Layer
**Goal:** Reduce Complexity & Latency.

-   **No REST Overhead**: We skip building `app/api/orders/route.ts`. Instead, `processOrder` is called directly from the UI component. Next.js handles the marshaling.
-   **Type Safety**: Arguments to Server Actions are typed. modifying an action updates the type for the client immediately.
-   **Atomic Logic**: Moving logic to Postgres Functions (`create_order_with_stock_deduction`) means the "Backend" is effectively the Database. This eliminates the need for a heavy Node.js backend service to manage transactions.

## 3. DevOps & OpEx Reduction
**Goal:** Low Cost & Zero Maintainance.

-   **BaaS (Supabase)**: We rely on Supabase for:
    -   **Auth**: No custom Auth server.
    -   **Realtime**: KDS updates via Postgres CDC (Change Data Capture) -> Websocket. No need to host a custom `socket.io` server (saving ~$20-50/mo and maintenance headaches).
    -   **Database**: Managed Postgres.
-   **Vercel/Next.js**: Serverless hosting means no EC2 instances to patch or scale. Cost scales to zero when no one orders.

## 4. Offline-First Decisions
-   **PWA + IndexedDB**: The plan relies on client-side queuing. This is "Free" infrastructure. The heavy lifting of syncing happens on the client device, reducing server load.
