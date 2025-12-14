"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createIDBPersister } from "./persist";
import React, { useState } from "react";

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Garbage collect after 24 hours (Keep cache for offline usage)
                        gcTime: 1000 * 60 * 60 * 24,
                        // Data is considered stale after 1 minute (re-fetch when online)
                        staleTime: 1000 * 60,
                    },
                },
            })
    );

    const [persister] = useState(() => createIDBPersister("tanjai-pos-db"));

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}
            onSuccess={() => {
                // Optional: Resume paused mutations here
                console.log("React Query cache restored from IndexedDB");
            }}
        >
            {children}
        </PersistQueryClientProvider>
    );
}
