# ARC-0001: System Architecture Blueprint

**Owner:** Architect Prime
**Status:** DRAFT

## 1. High-Level Diagram

```mermaid
graph TD
    User[Customer PWA] -->|HTTPS/WS| CloudRun[Next.js App (Cloud Run)]
    User -->|Reads| CDN[Edge Cache]
    
    CloudRun -->|Auth/Data| Supabase[Supabase (PostgreSQL)]
    CloudRun -->|Logs| Logging[Google Cloud Logging]
    
    Supabase -->|Realtime| KDS_Devices[Kitchen Display (Tablets)]
    Supabase -->|Storage| AssetBucket[Menu Images]
```

## 2. Core Components

### Frontend (PWA)
- **Framework**: Next.js 14 (App Router).
- **State**: Zustand (Global Store) + TanStack Query (Server State).
- **Storage**: IndexedDB (Offline Orders) + LocalStorage (Session).

### Backend (The "Brain")
- **Database**: PostgreSQL 16 (on Supabase).
- **Auth**: Anonymous User (Guest) + RLS Policies.
- **Edge Functions**: Used for High-Concurrency tasks (e.g., Inventory Cutting).

### Offline Strategy
- **Read**: Service Worker checks Cache -> Network.
- **Write**: Optimistic UI update -> Queue in IndexedDB -> Sync Background Job.

## 3. Scaling Strategy
- **Vertical**: Cloud Run auto-scales instances based on CPU/Request count.
- **Horizontal**: Read Replicas for Postgres (Future Phase).
