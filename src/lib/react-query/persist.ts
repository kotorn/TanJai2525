import { get, set, del } from "idb-keyval";
import {
    PersistedClient,
    Persister,
} from "@tanstack/react-query-persist-client";

/**
 * Creates an IndexedDB persister using idb-keyval
 */
export function createIDBPersister(idbValidKey: string = "reactQueryClient"): Persister {
    return {
        persistClient: async (client: PersistedClient) => {
            await set(idbValidKey, client);
        },
        restoreClient: async () => {
            return await get<PersistedClient>(idbValidKey);
        },
        removeClient: async () => {
            await del(idbValidKey);
        },
    };
}
