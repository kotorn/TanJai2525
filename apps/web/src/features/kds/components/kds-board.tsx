'use client';

import { useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useRealtimeOrders } from '@/features/kds/hooks/use-realtime-orders';
import { OrderCard } from './order-card';

export type SupportedLanguage = 'en' | 'my' | 'km' | 'la';

export default function KDSBoard({ initialOrders, tenantId }: { initialOrders: any[], tenantId: string }) {
    // We ignore initialOrders here because the hook handles the state, 
    // BUT to avoid flash, we could initialize the hook with it. 
    // For now, the hook fetches on mount. 
    // Optimization: Pass initialOrders to hook?
    // Let's rely on the hook's fetching for data consistency.

    const { orders, loading, updateStatus } = useRealtimeOrders(tenantId);
    const [displayLanguage, setDisplayLanguage] = useState<SupportedLanguage>('en');

    // Filter out completed orders from view (unless we want a history tab)
    const activeOrders = orders.filter(o => o.status !== 'served' && o.status !== 'cancelled' && o.status !== 'completed');

    return (
        <div>
            <div className="bg-gray-800 text-white p-4 flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sticky top-0 z-10 shadow-md">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold">Kitchen Display System</h1>
                    <div className="flex items-center bg-gray-700 rounded-lg p-1">
                        {(['en', 'my', 'km', 'la'] as const).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setDisplayLanguage(lang)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-all uppercase ${displayLanguage === lang ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-300 hover:text-white'}`}
                            >
                                {lang}
                            </button>
                        ))}
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
                        {!loading ? <Wifi className="text-green-400 w-4 h-4" /> : <WifiOff className="text-yellow-400 w-4 h-4" />}
                        {!loading ? 'Live' : 'Connecting...'}
                    </div>
                </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
                {activeOrders.map(order => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={updateStatus}
                        displayLanguage={displayLanguage}
                    />
                ))}

                {!loading && activeOrders.length === 0 && (
                    <div className="col-span-full text-center py-20 text-gray-400 border-2 border-dashed rounded-lg border-gray-300">
                        <p className="text-xl">all clear</p>
                        <p className="text-sm">No active orders</p>
                    </div>
                )}
            </div>
        </div>
    );
}
