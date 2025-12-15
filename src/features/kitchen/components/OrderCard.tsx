"use client";

import { useState, useEffect } from 'react';
import { Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateKitchenOrderStatus } from '@/features/kitchen/actions';
import { toast } from 'sonner';

interface OrderCardProps {
    order: any;
    onStatusChange: () => void;
}

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [waitTime, setWaitTime] = useState(0);

  useEffect(() => {
    // Calculate initial wait time
    const calculateWaitTime = () => {
        const created = new Date(order.created_at).getTime();
        const now = Date.now();
        return Math.max(0, Math.floor((now - created) / 60000));
    };
    
    setWaitTime(calculateWaitTime());

    // Optional: Update every minute
    const interval = setInterval(() => {
        setWaitTime(calculateWaitTime());
    }, 60000);

    return () => clearInterval(interval);
  }, [order.created_at]);

  // Color coding based on wait time
  const getColorClass = () => {
    if (order.status === 'done') return 'border-l-gray-500'; // Just in case
    if (waitTime < 5) return 'border-l-green-500';
    if (waitTime < 10) return 'border-l-yellow-500';
    return 'border-l-red-500';
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const result = await updateKitchenOrderStatus(order.id, newStatus);
      if (result.success) {
        toast.success(newStatus === 'preparing' ? 'เริ่มทำออเดอร์' : 'ออเดอร์เสร็จสิ้น');
        onStatusChange();
      } else {
        toast.error('เกิดข้อผิดพลาด');
      }
    } catch (error) {
        console.error(error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border-l-4 ${getColorClass()}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            โต๊ะ {order.table_number || 'N/A'}
          </h3>
          <p className="text-xs text-gray-400">#{order.order_number}</p>
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${waitTime >= 10 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
          <Clock className="h-4 w-4" />
          <span>{waitTime} นาที</span>
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-2 mb-4">
        {order.order_items?.map((item: any) => (
          <div key={item.id} className="flex justify-between text-gray-700 text-sm border-b border-dashed border-gray-100 pb-1 last:border-0">
            <div className="flex-1">
                <span className="font-bold mr-2">{item.quantity}x</span> 
                <span>{item.menu_items?.name || item.name}</span>
                {item.notes && (
                    <div className="text-orange-600 text-xs ml-5">📝 {item.notes}</div>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Special Instructions */}
      {order.special_instructions && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-4">
          <p className="text-xs font-semibold text-yellow-800">📌 หมายเหตุ: {order.special_instructions}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-auto">
        {order.status === 'pending' && (
          <Button
            onClick={() => handleUpdateStatus('preparing')}
            disabled={isUpdating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            🔥 เริ่มทำ
          </Button>
        )}
        
        {order.status === 'preparing' && (
          <Button
            onClick={() => handleUpdateStatus('done')} // Mark as done to hide from KDS
            disabled={isUpdating}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="mr-2 h-4 w-4" />
            เสร็จแล้ว
          </Button>
        )}
      </div>
    </div>
  );
}
