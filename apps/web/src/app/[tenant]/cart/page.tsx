'use client';

import { useCartStore } from '@/features/ordering/cart-store';
import { useOrder } from '@/features/ordering/hooks/use-order';
import { useRouter } from 'next/navigation';
import { Trash, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CartPage({ params }: { params: { tenant: string } }) {
    const { items, removeItem, total, clearCart } = useCartStore();
    const router = useRouter();
    const { placeOrder, isProcessing, isOffline } = useOrder();

    const tenantSlug = params.tenant;

    const handleCheckout = async () => {
        if (items.length === 0) return;
        
        // Simulating ID for now (This will fail DB constraint if not real)
        // Ideally we resolve slug to ID in Server Action or pass it down via Layout.
        // For MVP, passing slug to action layer is cleaner if action handles resolution.
        // Our useOrder hook calls processOrder which handles slug resolution.
        
        await placeOrder(tenantSlug, 'T1'); // Hardcoded table
        // Success handling is done inside the hook (clears cart, shows toast)
        // We might want to redirect on success?
        // Hook clears cart, so we can watch item length or just redirect if processing done?
        // Ideally hook returns result or we pass callback.
        // But for now, if cart is cleared, we can assume success or redirect?
        // The hook implementation clears cart on success.
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-24">
            <header className="flex items-center gap-4 mb-6">
                <Link href={`/${tenantSlug}`} className="p-2 bg-white rounded-full shadow">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <h1 className="text-xl font-bold">Your Cart</h1>
            </header>

            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.menuItemId} className="bg-white p-4 rounded-lg shadow flex justify-between items-center animate-in slide-in-from-bottom-2">
                        <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-gray-500">฿{item.price} x {item.quantity}</p>
                        </div>
                        <button
                            onClick={() => removeItem(item.menuItemId)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                        >
                            <Trash className="w-5 h-5" />
                        </button>
                    </div>
                ))}

                {items.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        Cart is empty
                    </div>
                )}
            </div>

            {items.length > 0 && (
                <div className="mt-8 border-t pt-4">
                    <div className="flex justify-between text-xl font-bold mb-4">
                        <span>Total:</span>
                        <span>฿{total()}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className={`w-full py-3 rounded-lg font-bold text-lg text-white disabled:opacity-50 ${isOffline ? 'bg-amber-600 hover:bg-amber-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                    >
                        {isProcessing ? 'Processing...' : isOffline ? 'Queue Order (Offline)' : 'Confirm Order'}
                    </button>
                    {isOffline && <p className="text-xs text-center mt-2 text-amber-700 font-medium">You are offline. Order will sync when online.</p>}
                </div>
            )}
        </div>
    );
}
