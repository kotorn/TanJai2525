'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { OrderCard } from '@/features/kitchen/components/OrderCard';
import { useRealtimeSubscription } from '@/lib/supabase/realtime';
import { fetchKitchenOrders } from '@/features/kitchen/actions'; // Use Server Action wrapper
// import { Button } from '@/components/ui/button';

export default function KitchenDisplayPage() {
  const queryClient = useQueryClient();
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  // Fetch orders
  const { data: orders = [] } = useQuery({
    queryKey: ['kitchen-orders', selectedStation],
    queryFn: async () => {
      // Call Server Action
      const data = await fetchKitchenOrders();
      // Filter by station client-side if needed/supported by API
      // if (selectedStation) return data.filter(...)
      return data;
    },
    refetchInterval: 10000,
  });

  // Subscribe to real-time updates
  useRealtimeSubscription('orders', {
    event: 'INSERT', // Also listen to UPDATE? usually INSERT is new order.
    callback: () => {
      // Play sound
      playNotificationSound();
      
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
    },
  });

  // Also listen for item updates if needed, but 'orders' table updates usually suffice for status
  
  // Group orders
  const pendingOrders = orders.filter((o: any) => o.status === 'pending');
  const preparingOrders = orders.filter((o: any) => o.status === 'preparing');

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-100 p-6 overflow-hidden flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Kitchen Display System</h1>
        
        {/* Station Filter (Placeholder) */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedStation(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedStation === null ? 'bg-orange-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Stations
          </button>
           <button
             disabled
            className="px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-400 cursor-not-allowed opacity-60"
          >
            Hot Kitchen (Coming Soon)
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Pending Column */}
        <div className="flex flex-col bg-gray-200/50 rounded-xl p-4 h-full overflow-hidden">
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-700">
            🔔 รอทำ
            <span className="ml-2 bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-sm shadow-sm">
              {pendingOrders.length}
            </span>
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300">
            {pendingOrders.length === 0 && (
                <div className="text-center py-10 text-gray-400 italic">ไม่มีออเดอร์ใหม่</div>
            )}
            {pendingOrders.map((order: any) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={() => {
                  queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
                }}
              />
            ))}
          </div>
        </div>

        {/* Preparing Column */}
        <div className="flex flex-col bg-gray-200/50 rounded-xl p-4 h-full overflow-hidden">
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-700">
            🔥 กำลังทำ
            <span className="ml-2 bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full text-sm shadow-sm">
              {preparingOrders.length}
            </span>
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300">
            {preparingOrders.length === 0 && (
                <div className="text-center py-10 text-gray-400 italic">ไม่มีรายการที่กำลังทำ</div>
            )}
            {preparingOrders.map((order: any) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={() => {
                  queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
                }}
              />
            ))}
          </div>
        </div>

        {/* Done/History Preview (Optional) */}
        <div className="hidden lg:flex flex-col bg-gray-200/50 rounded-xl p-4 h-full overflow-hidden opacity-60">
           <h2 className="text-xl font-bold mb-4 flex items-center text-gray-700">
            ✅ เสร็จแล้ว (ล่าสุด)
          </h2>
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
             รายการที่เสร็จแล้วจะย้ายไปที่ History
          </div>
        </div>
      </div>
    </div>
  );
}

function playNotificationSound() {
  try {
    const audio = new Audio('/sounds/new-order.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.warn("Audio play blocked", e));
  } catch (error) {
    console.error('Failed to play sound:', error);
  }
}
