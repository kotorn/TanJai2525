"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function useRealtimeSubscription(
    table: string,
    event: "INSERT" | "UPDATE" | "DELETE" | "*" = "*",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback?: (payload: any) => void
) {
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const channel = supabase
            .channel(`public:${table}`)
            .on(
                "postgres_changes",
                {
                    event: event as "INSERT" | "UPDATE" | "DELETE" | "*",
                    schema: "public",
                    table: table,
                } as any, // Cast to any to avoid overload mismatch
                (payload) => {
                    console.log("Realtime update:", payload);
                    if (callback) {
                        callback(payload);
                    } else {
                        router.refresh(); // Default behavior: Refresh Server Components
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, table, event, router, callback]);
}
