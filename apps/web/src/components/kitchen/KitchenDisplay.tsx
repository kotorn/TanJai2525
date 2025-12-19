"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
}

interface Order {
  id: string;
  table_id: number | null;
  items: OrderItem[];
  status: 'pending' | 'making' | 'served' | 'cancelled';
  total_amount: number;
  customer_notes: string | null;
  created_at: string;
}

export function KitchenDisplay({ restaurantId }: { restaurantId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Fetch initial orders
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .in('status', ['pending', 'making'])
        .order('created_at', { ascending: true });

      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    };

    fetchOrders();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('orders_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        (payload) => {
          const newOrder = payload.new as Order;
          setOrders((prev) => [...prev, newOrder]);
          
          // Play notification sound
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        (payload) => {
          const updatedOrder = payload.new as Order;
          setOrders((prev) =>
            prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
              .filter(o => o.status === 'pending' || o.status === 'making')
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Failed to update order:', error);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const makingOrders = orders.filter(o => o.status === 'making');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-dark">
        <p className="text-white text-xl">Loading Kitchen Display...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark p-6">
      {/* Audio for notifications */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white font-display">Kitchen Display</h1>
        <p className="text-gray-400 mt-2">Real-time order monitoring</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incoming Orders */}
        <OrderColumn
          title="🔔 Incoming"
          orders={pendingOrders}
          onAction={(id) => updateOrderStatus(id, 'making')}
          actionLabel="Start Cooking"
          bgColor="bg-red-500/10"
          borderColor="border-red-500/30"
        />

        {/* Cooking */}
        <OrderColumn
          title="🔥 Cooking"
          orders={makingOrders}
          onAction={(id) => updateOrderStatus(id, 'served')}
          actionLabel="Mark Served"
          bgColor="bg-secondary-500/10"
          borderColor="border-secondary-500/30"
        />
      </div>
    </div>
  );
}

function OrderColumn({
  title,
  orders,
  onAction,
  actionLabel,
  bgColor,
  borderColor
}: {
  title: string;
  orders: Order[];
  onAction: (id: string) => void;
  actionLabel: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={`rounded-2xl border-2 ${borderColor} ${bgColor} p-6`}>
      <h2 className="text-2xl font-bold text-white mb-4 font-display">{title}</h2>
      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        <AnimatePresence>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders</p>
          ) : (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAction={onAction}
                actionLabel={actionLabel}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onAction,
  actionLabel
}: {
  order: Order;
  onAction: (id: string) => void;
  actionLabel: string;
}) {
  const elapsed = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 1000 / 60);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="glass-panel p-4 rounded-xl"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-white font-bold text-lg">
            {order.table_id ? `Table ${order.table_id}` : 'Takeout'}
          </h3>
          <p className="text-gray-400 text-xs">{elapsed} min ago</p>
        </div>
        <span className="text-secondary-500 font-bold text-xl">
          ฿{order.total_amount?.toFixed(0) || 0}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-white">
              {item.quantity}x {item.name}
            </span>
            {item.notes && (
              <span className="text-gray-400 text-xs italic">{item.notes}</span>
            )}
          </div>
        ))}
      </div>

      {order.customer_notes && (
        <p className="text-yellow-400 text-xs mb-3 italic">Note: {order.customer_notes}</p>
      )}

      <button
        onClick={() => onAction(order.id)}
        className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 rounded-lg transition-colors"
      >
        {actionLabel}
      </button>
    </motion.div>
  );
}
