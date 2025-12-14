"use client";

import { useEffect } from "react";
import { createClient } from "./client";
import { useRouter } from "next/navigation";

type SubscriptionOptions = {
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    callback: (payload: any) => void;
    schema?: string;
    table?: string; // Optional if derived from channel or just generic
    filter?: string;
};

function isMockMode() {
    // Client-side check
    if (typeof window !== "undefined") {
         // We can't easily access process.env.NEXT_PUBLIC... conditionally if it wasn't statically replaced at build time
         // But we can check the URL or just rely on a consistent env var.
         const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
         return !url || url.includes("your-project-url");
    }
    return false;
}

export function useRealtimeSubscription(
    table: string,
    options: SubscriptionOptions
) {
    const router = useRouter();

    useEffect(() => {
        if (isMockMode()) {
            console.log(`[Mock Realtime] Subscribed to ${table} (${options.event})`);
            // Mock polling or random events?
            // For KDS, we want to simulate "New Order" appearing.
            // Let's just do nothing actively, but maybe log.
            // The polling in useQuery will handle data fetching.
            // This hook is for "Instant" updates.
            // We could simulate a random event every 30s?
            return;
        }

        const supabase = createClient();
        
        const channel = supabase
            .channel(`public:${table}`)
            .on(
                'postgres_changes' as any,
                {
                    event: options.event,
                    schema: options.schema || 'public',
                    table: table,
                    filter: options.filter
                },
                (payload) => {
                    options.callback(payload);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [table, options.event, options.filter]); // Removed callback from dep array to avoid re-subscribing often unless wrapped in useCallback
}
