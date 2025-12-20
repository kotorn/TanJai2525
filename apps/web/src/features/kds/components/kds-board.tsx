'use client';

import { useEffect, useState } from 'react';
import OrderTicket from './order-ticket';
import { WifiOff, Wifi, Globe } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

export type SupportedLanguage = 'en' | 'my' | 'km' | 'la';

export default function KDSBoard({ initialOrders, tenantId }: { initialOrders: any[], tenantId: string }) {
    const [orders, setOrders] = useState(initialOrders);
    const [isConnected, setIsConnected] = useState(true);
    const [displayLanguage, setDisplayLanguage] = useState<SupportedLanguage>('en');

    useEffect(() => {
        const supabase = createClient();

        // Subscribe to INSERT and UPDATE on 'orders' table
        const channel = supabase
            .channel(`kds-${tenantId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `restaurant_id=eq.${tenantId}`, // Updated to real column name 'restaurant_id'
                },
                async (payload) => {
                    if (payload.eventType === 'INSERT') {
                        // For a real app we need to fetch the relations (items) too
                        // Simplified: Reload or re-fetch
                        window.location.reload();
                    } else if (payload.eventType === 'UPDATE') {
                        setOrders((prev) =>
                            prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o)
                                .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
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
            <div className="bg-gray-800 text-white p-4 flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold">Kitchen Display System</h1>
                    <div className="flex items-center bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setDisplayLanguage('en')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${displayLanguage === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-300 hover:text-white'}`}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => setDisplayLanguage('my')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${displayLanguage === 'my' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-300 hover:text-white'}`}
                        >
                            MY
                        </button>
                        <button
                            onClick={() => setDisplayLanguage('km')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${displayLanguage === 'km' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-300 hover:text-white'}`}
                        >
                            KM
                        </button>
                        <button
                            onClick={() => setDisplayLanguage('la')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${displayLanguage === 'la' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-300 hover:text-white'}`}
                        >
                            LA
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 font-mono hidden sm:inline-block">
                        {displayLanguage === 'en' && 'English'}
                        {displayLanguage === 'my' && 'မြန်မာ (Myanmar)'}
                        {displayLanguage === 'km' && 'ខ្មែរ (Khmer)'}
                        {displayLanguage === 'la' && 'ລາວ (Lao)'}
                    </span>
                    <div className="flex items-center gap-2 text-sm">
                        {isConnected ? <Wifi className="text-green-400 w-4 h-4" /> : <WifiOff className="text-red-400 w-4 h-4" />}
                        {isConnected ? 'Live' : 'Disconnected'}
                    </div>
                </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
                {activeOrders.map(order => (
                    <OrderTicket
                        key={order.id}
                        order={order}
                        tenantId={tenantId}
                        displayLanguage={displayLanguage}
                    />
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
