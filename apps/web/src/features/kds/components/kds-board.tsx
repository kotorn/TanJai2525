'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // Or standard createClient
import { useEffect, useState } from 'react';
import OrderTicket from './order-ticket';
import { WifiOff, Wifi } from 'lucide-react';

// For the demo without auth-helpers installed yet, we use standard
import { createClient } from '@supabase/supabase-js';

export default function KDSBoard({ initialOrders, tenantId }: { initialOrders: any[], tenantId: string }) {
    const [orders, setOrders] = useState(initialOrders);
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        // Client-side supabase
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Subscribe to INSERT and UPDATE on 'orders' table
        // Filter by tenant_id would be ideal but realtime row level security might filter it automatically 
        // or we filter in callback if row has tenant_id.
        const channel = supabase
            .channel(`kds-${tenantId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `tenant_id=eq.${tenantId}`,
                },
                async (payload) => {
                    console.log('Realtime update:', payload);
                    if (payload.eventType === 'INSERT') {
                        // For a real app we need to fetch the relations (items) too
                        // Simplified: Just reload the page or fetch single order
                        // Here we might just want to trigger a revalidation or fetch the new order details
                        window.location.reload(); // Brute force update for MVP to get full relations
                    } else if (payload.eventType === 'UPDATE') {
                        setOrders((prev) =>
                            prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o)
                                .filter(o => o.status !== 'completed') // Remove completed from board
                        );
                    }
                }
            )
            .subscribe((status) => {
                setIsConnected(status === 'SUBSCRIBED');
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tenantId]);

    // Filter out completed orders from view
    const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');

    return (
        <div>
            <div className="bg-gray-800 text-white p-4 flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Kitchen Display System</h1>
                <div className="flex items-center gap-2 text-sm">
                    {isConnected ? <Wifi className="text-green-400 w-4 h-4" /> : <WifiOff className="text-red-400 w-4 h-4" />}
                    {isConnected ? 'Live' : 'Disconnected'}
                </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
                {activeOrders.map(order => (
                    <OrderTicket key={order.id} order={order} tenantId={tenantId} />
                ))}

                {activeOrders.length === 0 && (
                    <div className="col-span-full text-center py-20 text-gray-400 border-2 border-dashed rounded-lg">
                        No active orders. Ready for service!
                    </div>
                )}
            </div>
        </div>
    );
}
