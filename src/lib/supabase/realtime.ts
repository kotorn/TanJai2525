"use client";

import { useEffect } from "react";
import { createClient } from "./client";
import { useRouter } from "next/navigation";

// Generic payload type for better safety
type RealtimePayload<T> = {
    new: T;
    old: T;
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    // ... other Supabase fields
}

type SubscriptionOptions<T> = {
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    schema?: string;
    table?: string;
    filter?: string;
    callback: (payload: any) => void; 
};

export function useRealtimeSubscription<T = any>(
    table: string,
    options: SubscriptionOptions<T>
) {
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        
        const channel = supabase
            .channel(`public:${table}:${options.event}`)
            .on(
                'postgres_changes',
                {
                    event: options.event as any,
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
    }, [table, options.event, options.filter]); // Removed callback from dep array
}

// Specialized Hook for Orders (KDS)
export function useOrdersSubscription(restaurantId: string, onOrderUpdate: () => void) {
    useRealtimeSubscription('orders', {
        event: '*',
        filter: `restaurant_id=eq.${restaurantId}`,
        callback: (payload) => {
            console.log("Order Update:", payload);
            onOrderUpdate();
        }
    });
}
