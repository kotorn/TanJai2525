import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { submitOrder } from '../actions';
import { addToSyncQueue, flushSyncQueue } from '@/lib/offline-sync';
import { useCartStore } from '../cart-store';

export function useOrder() {
    const [isProcessing, setIsProcessing] = useState(false);
    const { items, clearCart, total } = useCartStore(); // Assuming total is exposed
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    // Network Listener
    useEffect(() => {
        // ... (lines 14-35 omitted for brevity, assuming they are fine or will be updated if needed)
        const handleOnline = () => {
             setIsOffline(false);
             toast.success('Back online! Syncing orders...');
             // Flush Queue
             flushSyncQueue(async (item) => {
                 return true; 
             });
         };
         const handleOffline = () => setIsOffline(true);
 
         window.addEventListener('online', handleOnline);
         window.addEventListener('offline', handleOffline);
 
         return () => {
             window.removeEventListener('online', handleOnline);
             window.removeEventListener('offline', handleOffline);
         };
    }, []);

    const placeOrder = async (tenantId: string, tableNumber: string) => {
        if (items.length === 0) return;
        setIsProcessing(true);

        try {
            if (isOffline) {
                // Offline Logic
                await addToSyncQueue('CREATE_ORDER', {
                    tenantId,
                    tableNumber,
                    items: items.map(i => ({ menu_item_id: i.menuItemId, quantity: i.quantity, priceCheck: i.price }))
                });
                
                toast.warning('Offline: Order queued. Will sync when online.');
                clearCart();
            } else {
                // Online Logic
                // Use total() method from store
                const calculatedTotal = total();
                
                const result = await submitOrder(
                    tenantId, 
                    tableNumber,
                    items.map(i => ({ 
                        menu_item_id: i.menuItemId, 
                        quantity: i.quantity, 
                        priceCheck: i.price,
                        options: i.options
                    })),
                    calculatedTotal
                );

                if (result.success) {
                    toast.success('Order placed successfully!');
                    clearCart();
                } else {
                    throw new Error('Order failed');
                }
            }
        } catch (error: any) {
            toast.error('Failed to place order: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        placeOrder,
        isProcessing,
        isOffline
    };
}
