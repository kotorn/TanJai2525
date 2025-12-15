import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { processOrder } from '../actions';
import { addToSyncQueue, flushSyncQueue } from '@/lib/offline-sync';
import { useCartStore } from '../cart-store';

export function useOrder() {
    const [isProcessing, setIsProcessing] = useState(false);
    const { items, clearCart } = useCartStore();
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    // Network Listener
    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            toast.success('Back online! Syncing orders...');
            // Flush Queue
            flushSyncQueue(async (item) => {
                if (item.type === 'CREATE_ORDER') {
                    const result = await processOrder(item.payload.tenantId, item.payload.items, item.payload.tableNumber);
                    return result.success;
                }
                return false;
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
                    items: items.map(i => ({ id: i.menuItemId, quantity: i.quantity, name: i.name }))
                });
                
                toast.warning('Offline: Order queued. Will sync when online.');
                clearCart();
                // We might want to persist "PENDING ORDERS" in a separate store to show UI
            } else {
                // Online Logic
                const result = await processOrder(
                    tenantId, 
                    items.map(i => ({ id: i.menuItemId, quantity: i.quantity, name: i.name })),
                    tableNumber
                );

                if (result.success) {
                    toast.success('Order placed successfully!');
                    clearCart();
                } else {
                    throw new Error(result.error);
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
