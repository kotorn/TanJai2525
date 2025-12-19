'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateOrderStatus } from '../actions';
import { toast } from 'sonner';
import { TicketCard } from './TicketCard';
import { Badge } from '@tanjai/ui';
import { Database } from '@/lib/database.types';

// Use Database Type if possible, or extend it
type OrderRow = Database['public']['Tables']['orders']['Row'];
export interface KitchenOrder extends OrderRow {
    // Add joined properties if we fetch them via server action
    items?: any[]; // Keep any for items until we define Item type deeply
}

export function KitchenBoard({ initialOrders, tenantId }: { initialOrders: KitchenOrder[], tenantId: string }) {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialOrders);
  const [soundEnabled, setSoundEnabled] = useState(false);
  // Optional: check window type for hydration safety
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
     setAudio(new Audio('/sounds/notification.mp3'));
  }, []);

  const supabase = createClient();

  // Play sound helper
  const playSound = () => {
    if (soundEnabled && audio) {
      audio.play().catch(e => console.error("Audio play failed", e));
    }
  };

  useEffect(() => {
    // Realtime Subscription
    const channel = supabase
      .channel('kitchen-orders')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          console.log('Realtime Change:', payload);
            
          if (payload.eventType === 'INSERT') {
             const newOrder = payload.new as KitchenOrder;
             // Optimistic add (incomplete data potentially, but good for alerting)
             setOrders(prev => [newOrder, ...prev]);
             playSound();
             toast.info(`New Order #${newOrder.table_no || '?' }!`);
          } else if (payload.eventType === 'UPDATE') {
             const updated = payload.new as KitchenOrder;
             setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, soundEnabled, audio]);
  
  // Categorize
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');

  const handleStatusChange = async (orderId: string, newStatus: string) => {
      // Optimistic Update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
      
      const res = await updateOrderStatus(tenantId, orderId, newStatus);
      if (!res.success) {
          toast.error("Failed to update status");
      }
  };

  return (
    <div className="h-full flex flex-col">
       {!soundEnabled && (
           <div className="bg-blue-600 text-white p-2 text-center cursor-pointer hover:bg-blue-700 transition-colors" onClick={() => setSoundEnabled(true)}>
               🔊 Click here to enable Order Alerts
           </div>
       )}
       
       <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden h-full">
           {/* Column 1: New Orders */}
           <div className="flex flex-col bg-white/5 rounded-xl border border-white/10 h-full">
               <div className="p-4 border-b border-white/10 flex justify-between items-center bg-red-500/10">
                   <h2 className="text-xl font-bold text-red-400">WAITING ({pendingOrders.length})</h2>
                   <Badge variant="destructive" className="animate-pulse">New</Badge>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                   {pendingOrders.map((order) => (
                       <TicketCard 
                         key={order.id} 
                         order={order} 
                         onAction={() => handleStatusChange(order.id, 'preparing')}
                         actionLabel="Start Cooking"
                         variant="pending"
                       />
                   ))}
               </div>
           </div>

           {/* Column 2: Cooking */}
           <div className="flex flex-col bg-white/5 rounded-xl border border-white/10 h-full">
               <div className="p-4 border-b border-white/10 flex justify-between items-center bg-yellow-500/10">
                   <h2 className="text-xl font-bold text-yellow-400">COOKING ({preparingOrders.length})</h2>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                   {preparingOrders.map((order) => (
                       <TicketCard 
                         key={order.id} 
                         order={order} 
                         onAction={() => handleStatusChange(order.id, 'ready')} // or completed
                         actionLabel="Mark Ready"
                         variant="preparing"
                       />
                   ))}
               </div>
           </div>
       </div>
    </div>
  );
}
