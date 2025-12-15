"use client";

import { useState, useCallback } from "react";
import { OrderCard } from "./OrderCard";
import { fetchKitchenOrders } from "../actions";
import { useOrdersSubscription } from "@/lib/supabase/realtime";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function KitchenBoard({ 
    restaurantId, 
    initialOrders 
}: { 
    restaurantId: string;
    initialOrders: any[];
}) {
    const [orders, setOrders] = useState(initialOrders);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshOrders = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const data = await fetchKitchenOrders(restaurantId);
            setOrders(data);
        } catch (error) {
            console.error("Failed to refresh orders", error);
        } finally {
            setIsRefreshing(false);
        }
    }, [restaurantId]);

    // Update local state when realtime event occurs
    // Ideally we merge changes, but re-fetching is safer to avoid drift
    useOrdersSubscription(restaurantId, () => {
        refreshOrders();
    });

    // Optimistic update handler passed to cards
    const handleStatusChange = () => {
        // We can wait for realtime or trigger refresh immediately
        refreshOrders();
    };

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => o.status === 'preparing');

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex justify-end">
                 <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refreshOrders()}
                    disabled={isRefreshing}
                >
                    <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-hidden">
                {/* Pending Column */}
                <div className="flex flex-col bg-gray-50/50 rounded-lg border border-gray-200 h-full overflow-hidden">
                    <div className="p-3 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <h3 className="font-semibold text-gray-900">New Orders</h3>
                        </div>
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                            {pendingOrders.length}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {pendingOrders.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
                                <p>No new orders</p>
                            </div>
                        )}
                        {pendingOrders.map(order => (
                            <OrderCard 
                                key={order.id} 
                                order={order} 
                                onStatusChange={handleStatusChange} 
                            />
                        ))}
                    </div>
                </div>

                {/* Preparing Column */}
                <div className="flex flex-col bg-blue-50/30 rounded-lg border border-blue-100 h-full overflow-hidden">
                     <div className="p-3 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <h3 className="font-semibold text-gray-900">Preparing</h3>
                        </div>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                            {preparingOrders.length}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                         {preparingOrders.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
                                <p>No active orders</p>
                            </div>
                        )}
                        {preparingOrders.map(order => (
                            <OrderCard 
                                key={order.id} 
                                order={order} 
                                onStatusChange={handleStatusChange} 
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
