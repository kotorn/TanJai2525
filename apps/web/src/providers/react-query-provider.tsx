'use client';

import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useState, useEffect } from 'react';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache time for 24 hours (for offline capability)
            gcTime: 1000 * 60 * 60 * 24,
            staleTime: 1000 * 60 * 5, // 5 minutes stale
          },
        },
      })
  );

  const [persister, setPersister] = useState<any>(null);

  useEffect(() => {
    // Ensure we only run on client
    if (typeof window !== 'undefined') {
      const localStoragePersister = createSyncStoragePersister({
        storage: window.localStorage,
      });
      setPersister(localStoragePersister);
    }
  }, []);

  // Use a stable provider structure to avoid "Rendered more hooks" error #310
  // during hydration/re-render transitions.
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: persister || {
          persistClient: async () => { },
          restoreClient: async () => undefined,
          removeClient: async () => { },
        }
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
