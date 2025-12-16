# ARC-0003: Offline-First Protocol

**Owner:** Architect Prime
**Status:** DRAFT

## Objective
Ensure 100% data integrity even when the restaurant internet fluctuates.

## The Protocol

### 1. The "Optimistic" Promise
When a user clicks "Order":
1.  **Immediate**: UI shows "Order Received" animation.
2.  **Storage**: Order blob saved to `IndexedDB` table `pending_orders`.
3.  **Attempt**: Try HTTP POST to `/api/order/submit`.

### 2. Failure Handling (Offline)
- If HTTP fails (Network Error):
    - Flag order as `status: 'offline_pending'` in UI.
    - Register **Background Sync** tag (if supported) or start `setInterval` poller.

### 3. The Sync Event
- When `navigator.onLine` becomes `true`:
- **Looper**: Iterate through `pending_orders`.
- **Replay**: Send POST requests sequentially (FIFO).
- **Cleanup**: On 200 OK, remove from `IndexedDB`.
- **Conflict**: If stock ran out while offline -> Push Notification "Sorry, item out of stock".

## Schema (IndexedDB)
```typescript
interface PendingOrder {
  id: string; // UUID (generated on client)
  payload: OrderPayload;
  timestamp: number;
  retryCount: number;
}
```
