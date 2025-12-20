'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/database.types';
import { toast } from 'sonner';

type Order = Database['public']['Tables']['orders']['Row'];

// Define active statuses for KDS
const ACTIVE_STATUSES = ['pending', 'cooking', 'ready'];

export function useRealtimeOrders(tenantId: string) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!tenantId) return;

        // 1. Fetch Initial Data
        const fetchOrders = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('restaurant_id', tenantId)
                .in('status', ACTIVE_STATUSES)
                .order('created_at', { ascending: true }); // Oldest first (FIFO)

            if (error) {
                toast.error('Failed to load orders: ' + error.message);
            } else {
                setOrders(data || []);
            }
            setLoading(false);
        };

        fetchOrders();

        // 2. Subscribe to Realtime Changes
        const channel = supabase
            .channel('kds-orders')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'orders',
                    filter: `restaurant_id=eq.${tenantId}`,
                },
                (payload) => {
                    // console.log('Realtime Event:', payload);

                    if (payload.eventType === 'INSERT') {
                        const newOrder = payload.new as Order;
                        // Only add if it's one of the statuses we care about
                        if (ACTIVE_STATUSES.includes(newOrder.status)) {
                            setOrders((prev) => [...prev, newOrder]);
                            toast.info(`New Order #${newOrder.id.slice(0, 4)}`);
                        }
                    }
                    else if (payload.eventType === 'UPDATE') {
                        const updatedOrder = payload.new as Order;
                        setOrders((prev) => {
                            // If status is no longer active (e.g. served/cancelled), remove it
                            if (!ACTIVE_STATUSES.includes(updatedOrder.status)) {
                                return prev.filter(o => o.id !== updatedOrder.id);
                            }
                            // Otherwise update it
                            return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                        });
                    }
                    else if (payload.eventType === 'DELETE') {
                        // Rare for KDS, but handle it
                        setOrders((prev) => prev.filter(o => o.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tenantId]); // Re-run if tenantId changes

    // Helper to update status (optimistic update could be added here)
    const updateStatus = async (orderId: string, newStatus: string) => {
        // Optimistic Update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            toast.error('Failed to update status');
            // Revert on error? Or let realtime fix it. 
            // For KDS, realtime sync is fast enough usually.
        }
    };

    return { orders, loading, updateStatus };
}
