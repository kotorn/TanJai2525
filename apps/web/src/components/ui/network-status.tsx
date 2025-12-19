'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { offlineService } from '@/services/offline-service';
import { submitOrder } from '@/features/ordering/actions';
import { Button } from "@tanjai/ui";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Check queue status
  const checkQueue = async () => {
    try {
      if (typeof window === 'undefined') return;
      const count = await offlineService.getQueueSize();
      setPendingCount(count);
    } catch (e) {
      console.error('Failed to check offline queue', e);
    }
  };

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);
    checkQueue();

    const handleOnline = () => {
      setIsOnline(true);
      toast.success('กลับมาออนไลน์แล้ว! 🌐', {
        description: 'ระบบกำลังตรวจสอบออเดอร์ที่ค้างอยู่...',
      });
      syncOrders();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('คุณกำลังออฟไลน์ 🔌', {
        description: 'ออเดอร์จะถูกบันทึกไว้ในเครื่อง',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Poll queue size every 5 seconds (to react to new offline orders)
    const interval = setInterval(checkQueue, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const syncOrders = async () => {
    if (isSyncing) return;
    try {
      const queue = await offlineService.getQueue();
      if (queue.length === 0) return;

      setIsSyncing(true);
      toast.info(`กำลังซิงค์ ${queue.length} ออเดอร์...`);

      let successCount = 0;
      
      for (const order of queue) {
        try {
          const payload = order.payload;
          
          // Call Server Action
          const result = await submitOrder(
            payload.restaurantId,
            payload.tableId,
            payload.items,
            payload.totalAmount,
            payload.specialInstructions,
            payload.promotionCode,
            payload.customerEmail,
            payload.customerPhone
          );

          if (result.success) {
            await offlineService.removeOrder(order.id);
            successCount++;
          }
        } catch (err) {
            console.error('Sync failed for order:', order.id, err);
        }
      }

      await checkQueue();
      
      if (successCount > 0) {
        toast.success(`ซิงค์สำเร็จ ${successCount} ออเดอร์! 🎉`);
      }
      
    } catch (e) {
      console.error('Sync process failed', e);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[100] px-4 py-2 flex items-center justify-between transition-colors duration-300 ${isOnline ? 'bg-green-600' : 'bg-[#eab308]'}`}>
        <div className="flex items-center gap-2 text-white font-medium text-sm">
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span>
                {isOnline 
                  ? `ออนไลน์ - มีออเดอร์รอซิงค์ ${pendingCount} รายการ`
                  : `ออฟไลน์ - บันทึกในเครื่อง ${pendingCount} รายการ`
                }
            </span>
        </div>
        
        {(isOnline && pendingCount > 0) && (
            <Button 
                size="sm" 
                variant="secondary" 
                className="h-7 text-xs bg-white text-green-700 hover:bg-white/90 border-0"
                onClick={() => syncOrders()}
                disabled={isSyncing}
            >
                <RefreshCcw className={`mr-1 h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ทันที'}
            </Button>
        )}
    </div>
  );
}
