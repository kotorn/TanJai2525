'use client';

import { useCartStore } from '@/features/ordering/cart-store';
import { processOrder } from '@/features/ordering/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CartPage({ params }: { params: { tenant: string } }) {
    const { items, removeItem, total, clearCart } = useCartStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    // Hacky tenant ID (In real app, middleware pass it or we fetch it)
    // For now we just use a placeholder UUID or derived from params if we had it mapped
    const tenantSlug = params.tenant;

    const handleCheckout = async () => {
        if (items.length === 0) return;
        setIsSubmitting(true);

        try {
            // We need the ACTUAL tenant ID, but for this demo we might fail if we don't have it.
            // In a real implementation this component would get tenantId via props or context
            // For scaffold, we assume we can get it or just pass null and let server handle if possible.
            // But the Server Action expects a UUID. 
            // We will fetch it client side merely for this demo or assume passed.

            // Simulating ID for now (This will fail DB constraint if not real)
            const fakeTenantId = '00000000-0000-0000-0000-000000000000';

            const result = await processOrder({
                tenant_id: fakeTenantId,
                table_number: 'T1', // Hardcoded for demo
                items: items.map(i => ({
                    menu_item_id: i.menuItemId,
                    quantity: i.quantity,
                    options: i.options
                }))
            });

            if (result.success) {
                toast.success('Order placed!');
                clearCart();
                router.push(`/${tenantSlug}/order-status/${result.orderId}`);
            } else {
                toast.error('Failed to place order: ' + result.error);
            }
        } catch (e) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
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
                <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] border-t">
                    <div className="max-w-md mx-auto flex justify-between items-center mb-4">
                        <span className="text-gray-600">Total</span>
                        <span className="text-2xl font-bold text-orange-600">฿{total()}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={isSubmitting}
                        className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-orange-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Processing...' : 'Confirm Order'}
                    </button>
                </div>
            )}
        </div>
    );
}
