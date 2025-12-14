"use client";

import { useRealtimeSubscription } from "@/lib/supabase/realtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Placeholder type
export type Order = {
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
};

export default function RealtimeOrderList({ initialOrders }: { initialOrders: Order[] }) {
    // Subscribe to new orders insert
    useRealtimeSubscription("orders", "INSERT", (payload) => {
        // In a real app, we might update local state here or allow router.refresh() to handle it.
        // implementing a toast or just logging for this scaffold
        console.log("New order received!", payload.new);
    });

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {initialOrders.length === 0 && <p className="text-muted-foreground col-span-full">No active orders.</p>}
            {initialOrders.map((order) => (
                <Card key={order.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Order #{order.id.slice(0, 8)}</CardTitle>
                        <Badge variant={order.status === 'completed' ? 'secondary' : 'default'}>{order.status}</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{order.total_amount}</div>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleTimeString()}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
