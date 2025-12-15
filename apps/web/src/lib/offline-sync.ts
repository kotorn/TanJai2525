import { openDB, DBSchema } from 'idb';

interface SyncSchema extends DBSchema {
  mutation_queue: {
    key: string;
    value: {
      id: string;
      type: 'CREATE_ORDER' | 'UPDATE_MENU_ITEM'; // Add more types as needed
      payload: any;
      timestamp: number;
    };
    indexes: { 'timestamp': number };
  };
}

const DB_NAME = 'tanjai-sync-db';
const STORE_NAME = 'mutation_queue';

export async function initSyncDB() {
  return openDB<SyncSchema>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
    },
  });
}

export async function addToSyncQueue(type: 'CREATE_ORDER' | 'UPDATE_MENU_ITEM', payload: any) {
  const db = await initSyncDB();
  const id = crypto.randomUUID();
  await db.add(STORE_NAME, {
    id,
    type,
    payload,
    timestamp: Date.now(),
  });
  console.log(`[Offline Sync] Queued mutation: ${type} (${id})`);
  return id;
}

export async function getSyncQueue() {
  const db = await initSyncDB();
  return db.getAllFromIndex(STORE_NAME, 'timestamp'); // Or just getAll if no index needed
}

export async function clearSyncQueueItem(id: string) {
  const db = await initSyncDB();
  await db.delete(STORE_NAME, id);
}

export async function flushSyncQueue(processor: (item: any) => Promise<boolean>) {
  const db = await initSyncDB();
  const items = await db.getAll(STORE_NAME);

  if (items.length === 0) return;

  console.log(`[Offline Sync] Flushing ${items.length} items...`);

  for (const item of items.sort((a, b) => a.timestamp - b.timestamp)) {
    try {
      const success = await processor(item);
      if (success) {
        await db.delete(STORE_NAME, item.id);
        console.log(`[Offline Sync] Synced item: ${item.id}`);
      } else {
        console.error(`[Offline Sync] Failed to sync item: ${item.id}`);
        // Keep in queue or move to 'dead letter' store? keeping for retry.
      }
    } catch (error) {
      console.error(`[Offline Sync] Error syncing item ${item.id}:`, error);
    }
  }
}
