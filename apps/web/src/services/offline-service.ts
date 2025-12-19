import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDB extends DBSchema {
  orders: {
    key: string;
    value: OfflineOrder;
  };
}

export type OfflineOrder = {
  id: string; // Generate a temporary ID (e.g., 'offline_' + uuid)
  createdAt: string;
  payload: any; // The CreateOrderDTO payload
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  error?: string;
};

const DB_NAME = 'tanjai-offline-db';
const STORE_NAME = 'orders';

export class OfflineService {
  private dbPromise: Promise<IDBPDatabase<OfflineDB>>;

  constructor() {
    if (typeof window === 'undefined') {
      this.dbPromise = Promise.resolve() as any; // Server-side fallback
      return;
    }

    this.dbPromise = openDB<OfflineDB>(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  /**
   * Save an order to the offline queue
   */
  async saveOrder(payload: any): Promise<OfflineOrder> {
    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const order: OfflineOrder = {
      id,
      createdAt: new Date().toISOString(),
      payload,
      status: 'PENDING',
    };

    const db = await this.dbPromise;
    await db.put(STORE_NAME, order);
    console.log('[OfflineService] Order saved locally:', id);
    return order;
  }

  /**
   * Get all pending orders
   */
  async getQueue(): Promise<OfflineOrder[]> {
    const db = await this.dbPromise;
    return await db.getAll(STORE_NAME);
  }

  /**
   * Remove an order from the queue (after successful sync)
   */
  async removeOrder(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(STORE_NAME, id);
    console.log('[OfflineService] Order removed from queue:', id);
  }

  /**
   * Clear the entire queue (use with caution)
   */
  async clearQueue(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(STORE_NAME);
  }

  /**
   * Get queue size
   */
  async getQueueSize(): Promise<number> {
    const db = await this.dbPromise;
    return await db.count(STORE_NAME);
  }
}

export const offlineService = new OfflineService();
