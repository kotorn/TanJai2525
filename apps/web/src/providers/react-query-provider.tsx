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

  if (!persister) {
    // Render without persistence during SSR or initial mount
    // Note: Use standard Provider if persister not ready to avoid hydration mismatch?
    // Actually, for PersistQueryClientProvider, 'persistOptions' is required.
    // If not ready, we can return null or just standard provider.
    // Simplest: Just use persistence only on client.
    return <>{children}</>;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
